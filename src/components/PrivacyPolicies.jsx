import React, {useState} from "react";
import { translations } from "../utils/translations";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicies(){

    const[lang, setLang] = useState("EN");
    const t = translations[lang];
    const navigate = useNavigate();


    return(
        <div className="min-h-screen bg-zinc-50 font-sans text-gray-900 flex flex-col">
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

            <main className="mx-auto px-3 py-12 max-w-7xl">
                <div className="text-center mb-12">
                    <h1 className="font-bold text-xl">Legal & Policies</h1>
                    <p className="text-gray-700">Everything you need to know about our platform rules, your privacy, and refunds.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="w-full text-left mb-8 space-y-2  md:w-1/4 ">
                        <h3><a href="#refund-policy" className="italic text-purple-700">Refund policy</a></h3>
                        <h3><a href="#privacy-policy" className="italic text-purple-700">Privacy policy</a></h3>
                        <h3><a href="#terms-conditions" className="italic text-purple-700">Terms and Conditions</a></h3>
                    </div>

                    <div className="flex flex-col gap-10">
                        <section id="refund-policy" className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-6 border-b-2 border-[#C2D8C4] pb-2 inline-block">Refund Policy</h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>Thank you for booking with GenTicket. We value your satisfaction and strive to provide you with the best digital ticketing experience possible.</p>
                            <h3 className="text-lg font-semibold text-black mt-6">Refunds & Returns</h3>
                            <p>We accept refund requests within 7 days from the date of purchase, strictly provided that the event has not yet commenced or taken place. Once we receive your request and verify the ticket status, we will notify you of the approval or rejection of your refund. If approved, we will initiate a refund to your original method of payment.</p>
                        
                            <h3 className="text-lg font-semibold text-black mt-6">Event Cancellations</h3>
                            <p>In the unfortunate event that an organizer cancels or postpones an event, please contact us immediately. We will arrange for a full replacement ticket for the new date or issue a refund, depending on the organizer's directives and your preference.</p>
                        
                            <h3 className="text-lg font-semibold text-black mt-6">Non-Refundable Items</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Tickets for events that have already started or concluded.</li>
                                <li>Gift cards or promotional vouchers.</li>
                                <li>Personalized or custom VIP event packages.</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-black mt-6">Processing Time</h3>
                            <p>Refunds will be processed within 5-7 business days after approval. Please note that it may take additional time for the refund to appear in your account, depending on your local bank or payment provider.</p>
                        
                            <h3 className="text-lg font-semibold text-black mt-6">Contact Us</h3>
                            <p>If you have any questions or concerns regarding our refund policy, please <a href="/contact" className="italic text-purple-700">contact us</a>. We are here to assist you and ensure your shopping experience with us is enjoyable and hassle-free.</p>
                        </div>
                        </section>

                        <section id="privacy-policy" className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold mb-6 border-b-2 border-[#C2D8C4] pb-2 inline-block">Privacy Policy</h2>
                            <div className="space-y-4 text-gray-700 leading-relaxed">
                                <p>At GenTicket, we are committed to protecting the privacy and security of our customers' personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit or make a purchase on our website. By using our website, you consent to the practices described in this policy.</p>

                                <h3 className="text-lg font-semibold text-black mt-6">Information We Collect</h3>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li><strong>Personal Identification:</strong> Name, email address, and phone number provided voluntarily during the booking process.</li>
                                    <li><strong>Payment Information:</strong> Necessary details to process your orders securely handled by trusted third-party payment processors (PayHere).</li>
                                    <li><strong>Browsing Information:</strong> IP address, device information, and browser type collected automatically using cookies.</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-black mt-6">Use of Information</h3>
                                <p>We may use the collected information for the following purposes:</p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>To process and fulfill your orders, including shipping and delivery.</li>
                                    <li>To communicate with you regarding your purchases, provide customer support, and respond to inquiries or requests.</li>
                                    <li>To improve our website, products, and services based on your feedback and browsing patterns.</li>
                                    <li>To detect and prevent fraud, unauthorized activities, and abuse of our website.</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-black mt-6">Information Sharing</h3>
                                <p>We respect your privacy and do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Trusted service providers: We may share your information with third-party service providers who assist us in operating our website, processing payments, and delivering products. These providers are contractually obligated to handle your data securely and confidentially.</li>
                                    <li>Legal requirements: We may disclose your information if required to do so by law or in response to valid legal requests or orders.</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-black mt-6">Data Security</h3>
                                <p>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
                            
                                <h3 className="text-lg font-semibold text-black mt-6">Cookies and Tracking Technologies</h3>
                                <p>We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and gather information about your preferences and interactions with our website. You have the option to disable cookies through your browser settings, but this may limit certain features and functionality of our website.</p>

                                <h3 className="text-lg font-semibold text-black mt-6">Changes to the Privacy Policy</h3>
                                <p>We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with a revised "last updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we collect, use, and protect your information.</p>
                            
                                <h3 className="text-lg font-semibold text-black mt-6">Contact us</h3>
                                <p>If you have any questions, concerns, or requests regarding our Privacy Policy or the handling of your personal information, please <a href="/contact" className="italic text-purple-700">contact us </a>using the information provided on our website</p>
                            </div>
                        </section>

                        <section id="terms-conditions" className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold mb-6 border-b-2 border-[#C2D8C4] pb-2 inline-block">Terms and Conditions</h2>
                            <div className="space-y-4 text-gray-700 leading-relaxed">
                                <p>Welcome to GenTicket. These Terms and Conditions govern your use of our website and the purchase of digital tickets from our platform. By accessing and using our website, you agree to comply with these terms. Please read them carefully before proceeding with any transactions.</p>

                                <h3 className="text-lg font-semibold text-black mt-6">Use of the Platform</h3>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>You must be at least 18 years old to make purchases, or have the consent of a legal guardian.</li>
                                    <li>You are responsible for maintaining the confidentiality of your account informations.</li>
                                    <li>You agree to provide accurate and current information during the checkout process.</li>
                                    <li>You may not use our website for any unlawful, fraudulent, or unauthorized ticket-scalping purposes.</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-black mt-6">Event Information and Pricing</h3>
                                <p><strong>a. </strong>We strive to provide accurate event descriptions, images, and pricing information. However, we do not guarantee the accuracy or completeness of such information.</p>
                                <p><strong>b. </strong>Prices are subject to change without notice. Any promotions or discounts are valid for a limited time and may be subject to additional terms and conditions.</p>

                                <h3 className="text-lg font-semibold text-black mt-6">Orders and Payments</h3>
                                <p><strong>a. </strong>By placing an order on our website, you are making an offer to purchase the selected event.</p>
                                <p><strong>b. </strong>We reserve the right to refuse or cancel any order for any reason, including but not limited to capacity limits, errors in pricing or product information, or suspected fraudulent activity.</p>
                                <p><strong>c. </strong>You agree to provide valid and up-to-date payment information and authorize us to charge the total order amount, including applicable taxes and other fees, to your chosen payment method.</p>
                                <p><strong>d. </strong>We use trusted third-party payment processors to handle your payment information securely. We do not store or have access to your full payment details.</p>

                                <h3 className="text-lg font-semibold text-black mt-6">Returns and Refunds</h3>
                                <p>Our Returns and Refund Policy governs the process and conditions for returning tickets and seeking refunds. Please refer to the policy provided on our website for more information.</p>

                                <h3 className="text-lg font-semibold text-black mt-6">Intellectual Property</h3>
                                <p><strong>a. </strong>All content and materials on our website, including but not limited to text, images, logos, and graphics, are protected by intellectual property rights and are the property of GenTicket or its licensors.</p>
                                <p><strong>b. </strong>You may not use, reproduce, distribute, or modify any content from our website without our prior written consent.</p>

                                <h3 className="text-lg font-semibold text-black mt-6">Limitation of Liability</h3>
                                <p>GenTicket acts as a platform connecting event-goers with organizers. We make no warranties regarding the ultimate quality of the events hosted by third parties. In no event shall GenTicket be liable for any indirect or incidental damages arising out of your attendance at an event booked through our platform.</p>
                            
                                <h3 className="text-lg font-semibold text-black mt-6">Amendments and Termination</h3>
                                <p>We reserve the right to modify, update, or terminate these Terms and Conditions at any time without prior notice. It is your responsibility to review these terms periodically for any changes.</p>
                            </div>
                        </section>

                    </div>
                </div>
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