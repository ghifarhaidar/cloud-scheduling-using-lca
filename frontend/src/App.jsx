import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SetConfigPage from "./pages/SetConfigPage";
import EditConfigPage from "./pages/EditConfigPage";
import RunPage from "./pages/RunPage";
import NavBar from "./components/NavBar";
import FitnessPage from "./pages/FitnessPage";
import ResultsPage from "./pages/ResultsPage";
import "./App.css";

export default function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <NavBar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/set-config" element={<SetConfigPage />} />
                        <Route path="/edit-config" element={<EditConfigPage />} />
                        <Route path="/run" element={<RunPage />} />
                        <Route path="/fitness" element={<FitnessPage />} />
                        <Route path="/results" element={<ResultsPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
