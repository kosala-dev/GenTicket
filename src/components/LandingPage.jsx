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
            notify_url: "https://fee3-203-189-188-163.ngrok-free.app/api/payhere-webhook",
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
            
            window.payhere.onDismissed = () => setCheckoutEvent(null);
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
        const response = await fetch('http://localhost:5000/api/send-ticket', {
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

    return(
        <div className="min-h-screen bg-zinc-50 font-sans text-gray-900 flex flex-col ">
            {/* nav bar */}
            <nav className="flex flex-col md:flex-row justify-between items-center p-4 bg-[#C2D8C4] shadow-sm">
                {/* project name */}
                <div onClick={() => navigate("/")} className="text-2xl font-bold tracking-tight mb-4 md:mb-0 text-[#222222] hover:cursor-pointer">
                    EventSync.lk
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

            <main className="max-w-7xl mx-auto px-4 pb-20 mt-10 flex-grow w-full mt-10">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.map((event) => (
                            <div key={event.event_id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
                                
                                <div className="w-full aspect-[1/1] bg-gray-200 relative overflow-hidden">
                                <img 
                                    src={`/images/${event.event_id}.png`} 
                                    alt={event.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                    e.currentTarget.parentElement.innerHTML = '<span class="text-gray-400 text-sm">Image Coming Soon</span>';
                                    }}
                                />
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold mb-2 text-gray-900">{event.title}</h3>
                                
                                <div className="text-sm font-semibold text-gray-700 mb-1">
                                    📅 {new Date(event.event_date).toLocaleString('en-US', { 
                                        month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
                                    })}
                                </div>
                                <div className="text-sm text-gray-600 mb-4">
                                    📍 {event.venue}
                                </div>

                                <p className="text-sm text-gray-500 mb-6 flex-grow line-clamp-3">
                                    {event.description}
                                </p>

                                <div className="text-2xl font-extrabold text-center mb-4 text-gray-900">
                                    {event.ticket_price} LKR
                                </div>

                                <button 
                                    onClick={() => setCheckoutEvent(event)}
                                    disabled={event.max_capacity === 0}
                                    className={`w-full font-bold py-3 rounded-xl transition-colors duration-200 ${
                                        event.max_capacity === 0 
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                            : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                                >
                                    {event.max_capacity === 0 ? t.soldout : t.buyNow}
                                </button>

                                <div 
                                    className={`text-center text-sm font-bold mt-4 ${
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
                        <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{t.getTicket}</h3>
                        {/* Close Button */}
                        <button onClick={() => setCheckoutEvent(null)} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        </div>

                        <div className="mb-6 pb-4 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{checkoutEvent.title}</p>
                        <p className="text-blue-600 font-bold">{checkoutEvent.ticket_price} LKR</p>
                        </div>

                        {/* The Form */}
                        <div className="space-y-4">
                        <div className="flex gap-4">
                            <input type="text" name="firstName" placeholder={t.firstName} onChange={handleInputChange} className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="text" name="lastName" placeholder={t.lastName} onChange={handleInputChange} className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <input type="email" name="email" placeholder={t.email} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="tel" name="phone" placeholder={t.phone} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" name="address" placeholder={t.address} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        <button 
                            onClick={triggerPayment}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors duration-200 mt-4"
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
                        <a href="#" className="hover:text-gray-900 transition-colors text-[#222222]">{t.contactUs}</a>
                        <a href="#" className="hover:text-gray-900 transition-colors text-[#222222]">{t.aboutUs}</a>
                        <a href="#" className="hover:text-gray-900 transition-colors text-[#222222]">{t.privacy}</a>
                    </div>
                    <div className="text-sm text-gray-500">
                        {t.rights}
                    </div>
                </div>
            </footer>
        </div>
    )
}
