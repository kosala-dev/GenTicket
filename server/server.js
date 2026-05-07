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
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
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
        
        const sqlQuery = 'INSERT INTO tickets(event_id, order_id, buyer_name, buyer_email, buyer_phone, payhere_payment_id, qr_secure_hash) VALUES(?,?,?,?,?,?,?)';
        db.query(sqlQuery, [eventId, order_id, buyer.name, buyer.email, buyer.phone, payment_id, qrSecureHash], (err,result) => {
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
                    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
                    const verifyUrl = `${backendUrl}/verify?ticket_hash=${qrSecureHash}`;
                    const qrImageBuffer = await QRCode.toBuffer(verifyUrl);

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

// fetch ticket by order_id (payment_id)
app.get('/api/ticket/:orderId', (req, res) => {
  const { orderId } = req.params;
  const query = 'SELECT ticket_id, qr_secure_hash FROM tickets WHERE order_id = ?';
  db.query(query, [orderId], (err, results) => {
    if (err) {
      console.error('Ticket lookup failed:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    return res.status(200).json({
      ticket_id: results[0].ticket_id,
      ticket_hash: results[0].qr_secure_hash
    });
  });
});

// ticket scan verification
app.post('/api/ticket-scan', (req, res) => {
  const { ticket_hash } = req.body;
  if (!ticket_hash) {
    return res.status(400).json({ error: 'Missing ticket_hash' });
  }

  const selectQuery = 'SELECT * FROM tickets WHERE qr_secure_hash = ?';
  db.query(selectQuery, [ticket_hash], (err, results) => {
    if (err) {
      console.error('Ticket lookup failed:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: 'invalid', message: 'Ticket not found' });
    }

    const ticket = results[0];
    if (ticket.scanned_at) {
      return res.status(409).json({
        status: 'already_scanned',
        message: 'Ticket has already been scanned',
        scanned_at: ticket.scanned_at
      });
    }

    const updateQuery = 'UPDATE tickets SET scanned_at = NOW() WHERE ticket_id = ?';
    db.query(updateQuery, [ticket.ticket_id], (updateErr) => {
      if (updateErr) {
        console.error('Failed to mark ticket scanned:', updateErr);
        return res.status(500).json({ error: 'Database error' });
      }

      return res.status(200).json({
        status: 'ok',
        message: 'Ticket scanned successfully',
        ticket_id: ticket.ticket_id,
        event_id: ticket.event_id
      });
    });
  });
});

// verify ticket via URL (for QR scanning)
app.get('/verify', (req, res) => {
  const { ticket_hash } = req.query;
  if (!ticket_hash) {
    return res.status(400).send('Missing ticket_hash');
  }

  const selectQuery = 'SELECT * FROM tickets WHERE qr_secure_hash = ?';
  db.query(selectQuery, [ticket_hash], (err, results) => {
    if (err) {
      console.error('Ticket lookup failed:', err);
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.status(404).send('Invalid ticket');
    }

    const ticket = results[0];
    if (ticket.scanned_at) {
      return res.status(409).send('Ticket already scanned');
    }

    const updateQuery = 'UPDATE tickets SET scanned_at = NOW() WHERE ticket_id = ?';
    db.query(updateQuery, [ticket.ticket_id], (updateErr) => {
      if (updateErr) {
        console.error('Failed to mark ticket scanned:', updateErr);
        return res.status(500).send('Database error');
      }

      return res.status(200).send('Ticket scanned successfully');
    });
  });
});
