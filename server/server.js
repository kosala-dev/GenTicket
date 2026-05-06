require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');


const app = express();
app.use(cors());
app.use(express.json());

// connection 
const db = mysql.createPool({
    host:'localhost',
    user:'kosala',
    password:'',
    database:'eventsync'
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});

// endpoints
// fetch events
app.get(`/api/events`, (req, res) => {
    const sqlQuery = "SELECT * FROM events";

    db.query(sqlQuery, (err, results) => {
        if(err){
            console.error("Database query failed: ", err);
            return res.status(500).json({error: "Failed to fetch events"});
        }

        res.json(results);
    });
});

// hash payments
const PAYHERE_MERCHANT_SECRET = process.env.MERCHANT_SECRET;
const PAYHERE_MERCHANT_ID = process.env.MERCHANT_ID;

app.post(`/api/generate-hash`, (req,res) => {
    const {order_id, amount, currency} = req.body;
    const formattedAmount = parseFloat(amount).toFixed(2);
    const hashedSecret = crypto.createHash('md5').update(PAYHERE_MERCHANT_SECRET).digest('hex').toUpperCase();
    const hashString = PAYHERE_MERCHANT_ID + order_id + formattedAmount + currency + hashedSecret;
    const finalHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
    res.json({hash:finalHash});
});

// save the ticket details after success
const user= process.env.EMAIL_USER;
const pass= process.env.EMAIL_PASS;

app.use(express.urlencoded({extended:true}));

app.post(`/api/payhere-webhook`, (req, res) => {
    const {
        merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig, payment_id, custom_1, custom_2
    } = req.body;

    // Verify signature
    const hashedSecret = crypto.createHash('md5').update(process.env.MERCHANT_SECRET).digest('hex').toUpperCase();
    const verifyString = merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret;
    const localMd5sig = crypto.createHash('md5').update(verifyString).digest('hex').toUpperCase();

    if(localMd5sig === md5sig && status_code == "2") {
        const eventId = custom_1;
        const buyer = JSON.parse(custom_2); 

        const qrSecureHash = crypto.randomUUID();
        
        const sqlQuery = 'INSERT INTO tickets(event_id, buyer_name, buyer_email, buyer_phone, payhere_payment_id, qr_secure_hash) VALUES(?,?,?,?,?,?)';
        db.query(sqlQuery, [eventId, buyer.name, buyer.email, buyer.phone, payment_id, qrSecureHash], (err,result) => {
            if(err){
                console.error("Failed to insert ticket: ", err);
                return res.status(500).send("Database error");
            }

            // reduce ticket amounts
            const updateCapacityQuery = 'UPDATE events SET max_capacity = max_capacity - 1 WHERE event_id = ? AND max_capacity > 0';
            
            db.query(updateCapacityQuery, [eventId], async (updateErr, updateResult) => {
                if(updateErr){
                    console.error("Failed to update capacity: ", updateErr);
                }

                // mailing
                try {
                    const qrImageBuffer = await QRCode.toBuffer(qrSecureHash);

                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: user,
                            pass: pass
                        }
                    });

                    // Draft the email
                    const mailOptions = {
                        from: `"EventSync.lk" <${user}>`,
                        to: buyer.email,
                        subject: `Your Ticket for ${buyer.eventName}`,
                        html: `
                            <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                                <h2>You are going to ${buyer.eventName}!</h2>
                                <p>Hi ${buyer.name},</p>
                                <p>Thank you for booking with EventSync.lk. Please present the attached QR code at the entrance.</p>
                                <p style="color: red; font-size: 12px;">Do not share this email or QR code with anyone.</p>
                            </div>
                        `,
                        attachments: [
                            {
                                filename: `${buyer.eventName.replace(/\s+/g, '-')}-Ticket.png`,
                                content: qrImageBuffer,
                                contentType: 'image/png'
                            }
                        ]
                    };

                    await transporter.sendMail(mailOptions);
                    console.log(`✅ Success! Ticket saved, capacity reduced, and emailed to ${buyer.email}`);

                } catch (emailError) {
                    console.error("Database updated, but email failed to send: ", emailError);
                }

                res.status(200).send("OK");
            });
        });
    } else {
        console.error("Payment failed or invalid signature.");
        res.status(400).send("Invalid Request");
    }
});