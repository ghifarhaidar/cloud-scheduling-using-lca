import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SetConfigPage from "./pages/SetConfigPage";
import EditConfigPage from "./pages/EditConfigPage";
import RunPage from "./pages/RunPage";
import FitnessPage from "./pages/FitnessPage";

export default function App() {
    return (
        <BrowserRouter>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/set-config">Set Config</Link>
                <Link to="/edit-config">Edit Config</Link>
                <Link to="/run">Run</Link>
                <Link to="/fitness">Fitness</Link>
            </nav>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/set-config" element={<SetConfigPage />} />
                <Route path="/edit-config" element={<EditConfigPage />} />
                <Route path="/run" element={<RunPage />} />
                <Route path="/fitness" element={<FitnessPage />} />
            </Routes>
        </BrowserRouter>
    );
}
