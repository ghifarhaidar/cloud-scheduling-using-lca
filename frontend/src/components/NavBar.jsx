import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import "../styles/navbar.css"
const links = [
    {
        title: "Set Config",
        path: "/set-config",
    },
    {
        title: "Edit Config",
        path: "/edit-config",
    },
    {
        title: "Run Experiments",
        path: "/run",
    },
    {
        title: "Fitness Analysis",
        path: "/fitness",
    },
    {
        title: "Results Analysis",
        path: "/results",
    },

]

export default function NavBar() {
    const location = useLocation();

    const checkActive = useCallback((path) => {
        return location.pathname === path;
    }, [location])
    return (
        <nav className="nav-container">
            <div className="nav-content">
                <Link to="/" className="nav-brand">
                    🧬 Cloud Scheduling LCA
                </Link>
                <ul className="nav-links">
                    {links.map((link, index) => (

                        <li key={index}>
                            <Link
                                to={link.path}
                                className={`nav-link ${checkActive(link.path) ? 'active' : ''}`}
                            >
                                {link.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    )
}