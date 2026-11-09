"use client";
import React,{useState, useEffect} from "react";
import { translations } from "../utils/translations";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LandingPage(){

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [checkoutEvent, setCheckoutEvent] = useState(null);
    const [customer, setCustomer] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: ''
    });
    const merchantId = import.meta.env.VITE_MERCHANT_ID;
    const[lang, setLang] = useState("EN");
    const t = translations[lang];
    const navigate = useNavigate();
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    // fetch events
    useEffect(() => {
        fetch(`${API_URL}/api/events`)
        .then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch events');
            }

            if (!Array.isArray(data)) {
                throw new Error('Unexpected response received from the server.');
            }

            return data;
        })
        .then(data => {
            setEvents(data);
            setErrorMessage('');
            setLoading(false);
        })
        .catch(error => {
            console.error("Error fetching events: ", error);
            setEvents([]);
            setErrorMessage(error.message || 'Unable to load events right now.');
            setLoading(false);
        });
    }, []);

    // frozen the scroll bars
    useEffect(() => {
        if(checkoutEvent){
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [checkoutEvent]);

    // filter events
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLocaleLowerCase())
    );

    // hanlde user inputs
    const handleInputChange = (e) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value});
    };

    // handle payments
    const triggerPayment = async () => {
        if (!customer.firstName || !customer.email || !customer.phone) {
        alert("Please fill in your name, email, and phone number.");
        return;
        }

        if (!isVerified) {
            alert("Please verify your email using the OTP first.");
            return;
        }

        const orderId = `EVT-${checkoutEvent.event_id}-${Date.now()}`;
        const amount = checkoutEvent.ticket_price;
        const currency = "LKR";
        const params = new URLSearchParams({
            event_id: checkoutEvent.event_id.toString(),
            event_name: checkoutEvent.title,
            created_at: checkoutEvent.created_at,
            order_id: orderId
        });
        const successUrl = `${window.location.origin}/success?${params.toString()}`;

        try {
        const response = await fetch(`${API_URL}/api/generate-hash`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, amount: amount, currency: currency })
        });
        const data = await response.json();
        const secureHash = data.hash;

        const paymentObject = {
            sandbox: true,
            merchant_id: merchantId, 
            return_url: successUrl,
            cancel_url: `${window.location.origin}/`,
            notify_url: `https://51cc-2402-4000-13fa-8809-e9ad-24f1-7608-1961.ngrok-free.app/api/payhere-webhook`,
            order_id: orderId,
            items: `${checkoutEvent.title} Ticket`,
            amount: amount,
            currency: currency,
            hash: secureHash, 
            
            first_name: customer.firstName,
            last_name: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: "Colombo",
            country: "Sri Lanka",

            custom_1: checkoutEvent.event_id.toString(),
            custom_2: JSON.stringify({
                name: `${customer.firstName} ${customer.lastName}`,
                email: customer.email,
                phone: customer.phone,
                eventName: checkoutEvent.title
            })
        };

        // Open PayHere
        if (window.payhere) {
            window.payhere.startPayment(paymentObject);

            window.payhere.onCompleted = function (completedOrderId) {
                window.location.href = successUrl;
            };
            
            window.payhere.onDismissed = handleCloseModal;
            window.payhere.onError = (error) => console.log("Error:" + error);
        }
        } catch (error) {
        console.error("Failed to initialize payment:", error);
        alert("Payment system error. Please try again.");
        }
    };

    // mail
    const handleSendEmail = async () => {
        if (!email) {
        alert("Please enter an email address.");
        return;
        }
        
        setEmailStatus('sending');

        try {
        const response = await fetch(`${API_URL}/api/send-ticket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: email, 
                eventName: eventName, 
                ticketHash: qrValue 
            })
        });

        if (response.ok) {
            setEmailStatus('success');
            setEmail('');
            
            setTimeout(() => setEmailStatus(''), 3000);
        } else {
            throw new Error('Failed to send');
        }
        } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong while sending the email. Please try again.");
        setEmailStatus('');
        }
    };

// handle set otp
    const handleSendOtp = async (e) => {
        e.preventDefault();
        
        if (!customer.email) return alert("Please enter an email first!");
        
        try {
            console.log("OTP sending to:", customer.email);
            
            const response = await fetch(`${API_URL}/api/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: customer.email }), 
            });

            if (response.ok) {
                alert("OTP has been sent to your email!");
                setOtpSent(true); 
            } else {
                const errorData = await response.json();
                alert(`Failed to send OTP: ${errorData.error || "Please try again."}`);
            }

        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Network error. Please check your connection.");
        }
    };

    // verify otp
    const handleVerifyOtp = async () => {
        if (!otpCode) return alert("Please enter the OTP code first!");
        
        try {
            console.log("Verifying code:", otpCode);
            
            const response = await fetch(`${API_URL}/api/verify-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: customer.email, otp: otpCode }), 
            });

            if (response.ok) {
                alert("Email verified successfully!");
                setIsVerified(true);
            } else {
                const errorData = await response.json();
                alert(`Verification failed: ${errorData.error || "Invalid OTP code."}`);
            }

        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("Network error. Please check your connection.");
        }
    };

    // Modal eka close weddi okkoma data reset karana function eka
    const handleCloseModal = () => {
        setCheckoutEvent(null); 
        
        setCustomer({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: ''
        });
        setOtpSent(false);
        setOtpCode('');
        setIsVerified(false);
    };


    return(
        <div className="min-h-screen bg-zinc-50 font-sans text-gray-900 flex flex-col ">
            {/* nav bar */}
            <nav className="flex flex-col md:flex-row justify-between items-center p-4 bg-[#C2D8C4] shadow-sm">
                {/* project name */}
                <div onClick={() => navigate("/")} className="text-2xl font-bold tracking-tight mb-4 md:mb-0 text-[#222222] hover:cursor-pointer">
                    GenTicket.lk
                </div>
                {/* search bar */}
                <div className="flex w-full md:w-1/3 bg-gray-100 rounded-full overflow-hidden px-4 py-2 border border-gray-200 focus-within:border-gray-400 transition-colors">
                    <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        className="w-full bg-transparent outline-none text-sm text-gray-700"
                    
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                {/* language */}
                <div 
                onClick={() => setLang(lang === 'EN'? 'SI' : 'EN')}
                className="hidden md:flex text-sm font-medium text-[#222222] hover:text-gray-900 cursor-pointer">
                    {t.lang}: {lang}
                </div>
            </nav>

            <div className="w-full relative mt-3">
                
                {/* 1. Background Image */}
                <img
                    src="/main.png"
                    alt="GenTicket Main Banner"
                    className="w-full h-[220px] md:h-[400px] lg:h-[450px] object-cover"
                />

                <div className="absolute "></div>
                    {/* 3. Text Content Container */}
                    <div className="absolute inset-0 md:max-w-7xl max-w-4xl mx-auto px-4 flex flex-col justify-center pt-20 md:pt-0">
                        {/* Main Headline */}
                        <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-black mb-5 max-w-2xl leading-tight">
                            Book Your Next Event in Seconds
                        </h1>
                        
                        {/* Feature List */}
                        <div className="flex flex-col gap-4 mb-32 ml-2">
                            
                            {/* Feature 1 */}
                            <div className="flex items-center text-black text-sm md:text-lg font-semibold -ml-2 md:ml-0">
                                <span className="bg-black text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 text-xs md:text-sm shadow-md">
                                    ✓
                                </span>
                                Instant Booking
                            </div>

                            {/* Feature 2 */}
                            <div className="flex items-center text-black text-sm md:text-lg font-semibold -ml-2 md:ml-0">
                                <span className="bg-black text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 text-xs md:text-sm shadow-md">
                                    ✓
                                </span>
                                Secure Payments
                            </div>

                            {/* Feature 3 */}
                            <div className="flex items-center text-black text-sm md:text-lg font-semibold -ml-2 md:ml-0">
                                <span className="bg-black text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 text-xs md:text-sm shadow-md">
                                    ✓
                                </span>
                                QR Code Entry
                            </div>

                        </div>

                    </div>
                </div>

            <main className="max-w-7xl mx-auto px-4 pb-20 mt-10 flex-grow w-full">
                    {/* Loading State */}
                    {loading ? (
                    <div className="text-center text-gray-500 py-20 font-medium">
                        {t.loading}
                    </div>
                    ) : (
                    <>
                        {errorMessage && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errorMessage}
                        </div>
                        )}
                        {filteredEvents.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-10">
                            {t.noEventsText} "{searchTerm}"
                        </div>
                        ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredEvents.map((event) => (
                            <div key={event.event_id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
                                
                                <div className="w-full aspect-[4/3] bg-gray-200 relative overflow-hidden">
                                <img 
                                    src={`/images/${event.event_id}.png`} 
                                    loading="lazy"
                                    alt={event.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                    e.currentTarget.parentElement.innerHTML = '<span class="text-gray-400 text-sm">Image Coming Soon</span>';
                                    }}
                                />
                                </div>

                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold mb-2 text-gray-900">{event.title}</h3>
                                    
                                    <div className="text-sm font-semibold text-gray-700 mb-1">
                                        📅 {new Date(event.event_date).toLocaleString('en-US', { 
                                            month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
                                        })}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-4">
                                        📍 {event.venue}
                                    </div>

                                    <p className="text-sm text-gray-500 mb-3 flex-grow line-clamp-3">
                                        {event.description}
                                    </p>

                                    <div className="text-xl font-extrabold text-center mb-1 text-gray-900">
                                        {event.ticket_price} LKR
                                    </div>

                                    <button 
                                        onClick={() => setCheckoutEvent(event)}
                                        disabled={event.max_capacity === 0}
                                        className={`self-center px-15 font-bold py-2 text-sm rounded-lg transition-colors duration-200 ${
                                            event.max_capacity === 0 
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                                : "bg-[#222222] hover:bg-black text-white"
                                        }`}
                                    >
                                        {event.max_capacity === 0 ? t.soldout : t.buyNow}
                                    </button>

                                    <div 
                                        className={`text-center text-sm font-bold mt-2 ${
                                            event.max_capacity > 100 ? "text-[#222222]" : "text-red-600"
                                        }`}
                                    >
                                        {event.max_capacity > 100 ? (
                                            `${t.ticketsLeft}`
                                        ) : (
                                            `${event.max_capacity} ${t.ticketsLeft1}`
                                        )}
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>
                        )}
                    </>
                    )}

                {/* Checkout Modal Popup */}
                {checkoutEvent && (
                    <div className="fixed inset-0 backdrop-blur-3xl flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[95vh] relative border-black">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-xl font-bold text-gray-900">{t.getTicket}</h3>
                            {/* Close Button */}
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            </div>

                            <div className="mb-2 pb-2 border-b border-gray-100">
                            <p className="font-semibold text-gray-800">{checkoutEvent.title}</p>
                            <p className="text-blue-600 font-bold">{checkoutEvent.ticket_price} LKR</p>
                        </div>

                        <p className="italic text-sm mb-1 text-red-500 mt-2">Note: Please enter a valid email address to receive your QR ticket.</p>

                        {/* The Form */}
                        <div className="space-y-3">
                        <div className="flex gap-4">
                            <input type="text" name="firstName" placeholder={t.firstName} onChange={handleInputChange} className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="text" name="lastName" placeholder={t.lastName} onChange={handleInputChange} className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                       
                        <div className="flex gap-2">
                            <input 
                                type="email" 
                                name="email" 
                                placeholder={t.email} 
                                onChange={handleInputChange} 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                            <button 
                                type="button"
                                onClick={handleSendOtp}
                                className="whitespace-nowrap bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm"
                            >
                                Send OTP
                            </button>
                        </div>      
                        
                        <div className="flex gap-2 mt-4">
                            <input 
                                type="text" 
                                name="otp" 
                                placeholder="Enter 6-digit OTP" 
                                onChange={(e) => setOtpCode(e.target.value)}
                                maxLength={6}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                            <button 
                                type="button"
                                onClick={handleVerifyOtp}
                                className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg transition-colors shadow-sm"
                            >
                                Verify OTP
                            </button>
                        </div>                  
                        
                        <input type="tel" name="phone" placeholder={t.phone} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" name="address" placeholder={t.address} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <button 
                            onClick={triggerPayment}
                            className={`w-full font-bold py-3 rounded-xl transition-all duration-200 mt-4 text-white ${
                                (customer.firstName && customer.email && customer.phone && isVerified)
                                    ? "bg-[#222222] hover:bg-black cursor-pointer shadow-md" 
                                    : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed opacity-90"
                            }`}
                        >
                            {t.proceedPayment}
                        </button>
                            <a href="https://www.payhere.lk" target="_blank"><img src="https://www.payhere.lk/downloads/images/payhere_long_banner.png" alt="PayHere" width="400"/></a>
                        </div>
                    </div>
                    </div>
                )}
                </main>

            {/* footer */}
            <footer className=" bg-[#C2D8C4] border-t border-gray-200 py-10 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
                    <div className="flex gap-8 text-sm font-medium text-gray-600">
                        <a href="/contact" className="hover:text-gray-900 transition-colors text-[#222222]">{t.contactUs}</a>
                        <a href="/aboutus" className="hover:text-gray-900 transition-colors text-[#222222]">{t.aboutUs}</a>
                        <a href="/privacy" className="hover:text-gray-900 transition-colors text-[#222222]">{t.privacy}</a>
                    </div>
                    <div className="text-sm text-gray-500">
                        {t.rights}
                    </div>
                </div>
            </footer>
        </div>
    )
}
