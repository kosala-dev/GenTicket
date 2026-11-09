import react, {useState} from "react"
import { useNavigate } from "react-router-dom";
import { translations } from "../utils/translations";

export default function AboutUs(){

    const navigate = useNavigate();
    const[lang, setLang] = useState("EN");
    const t = translations[lang];

    return (
        <div className="min-h-screen w-full flex flex-col bg-zinc-50 font-sans text-gray-900">

            <nav className="flex flex-col md:flex-row justify-between items-center p-4 bg-[#C2D8C4] shadow-sm w-full">
                <div onClick={() => navigate("/")} className="text-2xl font-bold tracking-tight mb-4 md:mb-0 text-[#222222] cursor-pointer">
                    GenTicket.lk
                </div>

                <div 
                onClick={() => setLang(lang === 'EN'? 'SI' : 'EN')}
                className="hidden md:flex text-sm font-medium text-[#222222] hover:text-gray-900 cursor-pointer">
                    Language: {lang}
                </div>
            </nav>            

            <main className="mx-auto px-3 py-12 max-w-4xl">
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 mx-3 text-center">
                    <h1 className="font-bold mb-4 text-gray-800 text-2xl">Transforming How Sri Lanka Experiences Events</h1>
                    <p>GenTicket.lk is your modern, 100% digital platform for discovering and booking events effortlessly. No more paper tickets, no more queues.</p>
                </div>

                <div className="text-center py-5 px-4 bg-white rounded-3xl shadow-sm mb-8 mx-3 mt-10">
                    <h1 className="font-bold mb-4 text-gray-800 text-2xl">Our Mission</h1>
                    <p>To revolutionize the ticketing industry by providing a seamless, eco-friendly, and secure digital platform. We aim to connect event-goers with their favorite experiences while empowering organizers with simple, powerful tools.</p>
                </div>
            </main>


            <div className="mb-16 mt-5 px-3">
                <h2 className="font-bold mb-4 text-gray-800 text-2xl text-center">Why Choose GenTicket?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-2xl shadow-md py-10 px-10 transition-shadow hover:shadow-lg text-center">
                        <img 
                        src="/instant.jpg"
                        alt="Instant Booking"
                        className="w-15 h-15 mx-auto"
                        />
                        <h3 className="font-bold py-1 text-gray-800  mb-5"> Instant Booking</h3>
                        <p className="text-gray-600 ">Get your digital tickets delivered instantly to your device. Just click, book, and you are ready to go.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md py-10 px-10 transition-shadow hover:shadow-lg text-center">
                        <img 
                        src="/secure.png"
                        alt="secure payments"
                        className="w-24 h-15 mx-auto"
                        />
                        <h3 className="font-bold py-1 text-gray-800 text-center mb-5">Secure Payments</h3>
                        <p className="text-gray-600 text-center">Integrated with PayHere for 100% secure, seamless transactions using any local payment method.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md py-10 px-10 transition-shadow hover:shadow-lg">
                        <img 
                        src="/qrcode.png"
                        alt="secure payments"
                        className="w-13 h-15 mx-auto"
                        />
                        <h3 className="font-bold py-1 text-gray-800 text-center mb-5">QR Code Entry</h3>
                        <p className="text-gray-600 text-center">Skip the hassle at the gate. Simply show your unique QR code on your phone for lightning-fast entry.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 md:p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto mb-5">
                <h4 className="font-semibold text-gray-600 italic">Built with ❤️ by Kosala Madushan</h4>
            </div>

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