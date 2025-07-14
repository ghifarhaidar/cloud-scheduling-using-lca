import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SetConfigPage from "./pages/SetConfigPage";
import EditConfigPage from "./pages/EditConfigPage";
import RunPage from "./pages/RunPage";
import FitnessPage from "./pages/FitnessPage";
import "./App.css";

function Navigation() {
    const location = useLocation();
    
    const isActive = (path) => location.pathname === path;
    
    return (
        <nav className="nav-container">
            <div className="nav-content">
                <Link to="/" className="nav-brand">
                    🧬 Cloud Scheduling LCA
                </Link>
                <ul className="nav-links">
                    <li>
                        <Link 
                            to="/" 
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/set-config" 
                            className={`nav-link ${isActive('/set-config') ? 'active' : ''}`}
                        >
                            Set Config
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/edit-config" 
                            className={`nav-link ${isActive('/edit-config') ? 'active' : ''}`}
                        >
                            Edit Config
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/run" 
                            className={`nav-link ${isActive('/run') ? 'active' : ''}`}
                        >
                            Run Experiments
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/fitness" 
                            className={`nav-link ${isActive('/fitness') ? 'active' : ''}`}
                        >
                            Fitness Analysis
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <Navigation />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/set-config" element={<SetConfigPage />} />
                        <Route path="/edit-config" element={<EditConfigPage />} />
                        <Route path="/run" element={<RunPage />} />
                        <Route path="/fitness" element={<FitnessPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
