import {BrowserRouter, Routes, Route} from "react-router-dom";
import LandingPage from "./components/LandingPage";
import QrGenerator from "./components/QrGenerator";
import Contact from "./components/Contact";
import AboutUs from "./components/AboutUs";
import PrivacyPolicies from "./components/PrivacyPolicies";

function App(){
    return(
        <BrowserRouter>
            <div>
                <Routes>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="/success" element={<QrGenerator />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/aboutus" element={<AboutUs/>} />
                    <Route path="/privacy" element={<PrivacyPolicies/>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;