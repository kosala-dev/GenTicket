import React, {useState} from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { FiDownload, FiCopy, FiCheck } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import { useNavigate } from "react-router-dom";
import { translations } from '../utils/translations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function QrGenerator(){
    const [copied, setCopied] = useState(false);
    const [searchParams] = useSearchParams();
    const [ticketId, setTicketId] = useState("");
    const [ticketHash, setTicketHash] = useState("");
    const [loading, setLoading] = useState(true);

    const orderId = searchParams.get("order_id") || "";
    const eventId = searchParams.get("event_id") || "";
    const eventName = searchParams.get("event_name") || "";
    const createdAt = searchParams.get("created_at") || "";

    const[lang, setLang] = useState("EN");
    const t = translations[lang];

    // fetch ticket data using order_id
    React.useEffect(() => {
        if (orderId) {
            console.log('Fetching ticket for orderId:', orderId);
            fetch(`${API_URL}/api/ticket/${orderId}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    console.log('Ticket data received:', data);
                    if (data.ticket_id && data.ticket_hash) {
                        setTicketId(data.ticket_id);
                        setTicketHash(data.ticket_hash);
                    } else {
                        console.warn('Incomplete ticket data:', data);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch ticket:', err);
                    setLoading(false);
                });
        } else {
            console.warn('No orderId found in URL');
            setLoading(false);
        }
    }, [orderId]);

    const qrValue = `${API_URL}/verify?ticket_hash=${ticketHash}`;

    const hasQrData = ticketId && ticketHash;
    const navigate = useNavigate();

    const handleDownload = () => {
        const canvas = document.querySelector("canvas");
        if(!canvas) return;
        // tell the browser to downlaod the qr code
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = "qr-code.png";
        link.click();
    }

    const handleCopy = async () => {
        try{
            await navigator.clipboard.writeText(qrValue);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }catch(err){
            console.error("copy error: ", err);
        }
    }

return (
        <div className="min-h-screen w-full flex flex-col bg-zinc-50 font-sans text-gray-900">

            {/* nav bar */}
            <nav className="flex flex-col md:flex-row justify-between items-center p-4 bg-[#C2D8C4] shadow-sm w-full">
                {/* project name */}
                <div onClick={() => navigate("/")} className="text-2xl font-bold tracking-tight mb-4 md:mb-0 text-[#222222] cursor-pointer">
                    GenTicket.lk
                </div>

                {/* language */}
                <div 
                onClick={() => setLang(lang === 'EN'? 'SI' : 'EN')}
                className="hidden md:flex text-sm font-medium text-[#222222] hover:text-gray-900 cursor-pointer">
                    Language: {lang}
                </div>
            </nav>
            
            <div className="flex-grow flex items-center justify-center p-4 mt-8 mb-8">
                
                <div className='w-full max-w-md p-8 bg-white rounded-xl shadow-xl flex flex-col items-center hover:scale-105 transition-all ease-in-out duration-300'>
                    <div className='flex flex-col items-center w-full mb-2'>
                        
                        <div className='w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-indigo-400 mb-4'>
                            <BsQrCode className='w-10 h-10 text-white'/>
                        </div>
                        
                        <h1 className='text-xl font-bold mb-1 text-center'>{eventName}</h1>
                        <p className='text-gray-500 text-sm text-center'>{t.risk}</p>
                
                        <div className='mb-6 flex items-center justify-center w-full mt-6'>
                            <div className='bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center p-4 min-h-[200px] w-full'>
                                {
                                    loading ? (
                                        <p className='text-gray-500'>Loading ticket...</p>
                                    ) : hasQrData ? (
                                        <QRCodeCanvas value={qrValue} size={200} className='rounded' />
                                    ) : (
                                        <div className='text-center'>
                                            <BsQrCode className='w-16 h-16 text-gray-300 mx-auto mb-2'/>
                                            <p className='text-gray-500 text-sm'>No ticket data found</p>
                                            <p className='text-gray-400 text-xs mt-1'>orderId: {orderId || 'missing'}</p>
                                        </div>
                                    )
                                }
                            </div>
                        </div>

                        <div className='flex sm:flex-row flex-col w-full gap-3 mb-3'>
                            <button onClick={handleDownload} disabled={!hasQrData}
                            className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors cursor-pointer'
                            ><FiDownload className='w-5 h-5'/>Download</button>
                        </div>

                        <div className='flex sm:flex-row flex-col w-full gap-3'>
                            <button onClick={handleCopy} disabled={!hasQrData}
                            className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors cursor-pointer'
                            >
                            {
                                copied ? (
                                    <FiCheck className='w-5 h-5 text-green-400'/>
                                ) : (
                                    <FiCopy className='w-5 h-5' />
                                )
                            }
                            {
                                copied ? "Copied!" : "Copy"
                            }
                            </button>
                        </div>

                    </div>
                </div>
            </div>

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
    );
}
