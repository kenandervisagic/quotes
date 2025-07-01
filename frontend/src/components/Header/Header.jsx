import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import "./Header.css";

function Header() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <header className="header">
            <div className="logo">
                <h1>the words left behind</h1>
            </div>
            <nav className="nav-links">
                <Link to="/" className={isActive("/") ? "active" : ""}>Home</Link>
                <Link to="/submit" className={isActive("/submit") ? "active" : ""}>Submit</Link>
                <Link to="/browse" className={isActive("/browse") ? "active" : ""}>Browse</Link>
            </nav>
        </header>
    );
}

export default Header;
