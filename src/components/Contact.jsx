import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { translations } from '../utils/translations';

export default function Contact() {
  const [result, setResult] = useState("");
  const navigate = useNavigate();

  const [lang, setLang] = useState('EN');
  const t = translations[lang];

  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("access_key", "bdd13f90-728f-4021-abb7-e1bdc98f2bf6");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (data.success) {
    setResult("Success! Your message has been sent.");
    event.target.reset(); 
  } else {
    setResult("Error: Something went wrong.");
  }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
        {/* nav bar */}
        <nav className="flex flex-col md:flex-row justify-between items-center p-4 bg-[#C2D8C4] shadow-sm w-full">
        {/* project name */}
        <div 
            onClick={() => navigate("/")} 
            className="text-2xl font-bold tracking-tight mb-4 md:mb-0 text-[#222222] cursor-pointer"
        >
            GenTicket.lk
        </div>

        {/* language */}
        <div 
            onClick={() => setLang(lang === 'EN'? 'SI' : 'EN')}
            className="hidden md:flex text-sm font-medium text-[#222222] hover:text-gray-900 cursor-pointer select-none"
        >
            Language: {lang}
        </div>
        </nav>

        {/* Form Container Wrapper */}
        <main className="flex-grow flex items-center justify-center p-4 my-10 w-full">
        <form 
            onSubmit={onSubmit} 
            className="w-full max-w-lg p-8 bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col gap-5"
        >
            {/* Form Header */}
            <div className="text-center mb-2">
            <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
            <p className="text-gray-500 mt-2 text-sm">Have a question? Drop us a message.</p>
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
            <input 
                type="text" 
                name="name" 
                placeholder="Eg: Amal Perera"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
            />
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
            <input 
                type="email" 
                name="email" 
                placeholder="Eg: amalperera@example.com"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
            />
            </div>

            {/* Message Textarea */}
            <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
            <textarea 
                name="message" 
                placeholder="How can we help you?"
                rows="4"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 resize-none"
            ></textarea>
            </div>

            {/* Submit Button */}
            <button 
            type="submit"
            className="w-full mt-4 bg-[#222222] hover:bg-black text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
            Send Message
            </button>

            {/* Result Message */}
            {result && (
            <p className={`text-center text-sm font-bold mt-2 py-3 rounded-xl border ${result.includes("Success") ? "text-green-600 bg-green-50 border-green-100" : "text-red-600 bg-red-50 border-red-100"}`}>
                {result}
            </p>
            )}
        </form>
        </main>

        {/* footer */}
        <footer className="bg-[#C2D8C4] border-t border-gray-200 py-10 mt-auto w-full">
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