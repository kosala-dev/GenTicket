import {BrowserRouter, Routes, Route} from "react-router-dom";
import LandingPage from "./components/LandingPage";
import QrGenerator from "./components/QrGenerator";

function App(){
    return(
        <BrowserRouter>
            <div>
                <Routes>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="/success" element={<QrGenerator />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;