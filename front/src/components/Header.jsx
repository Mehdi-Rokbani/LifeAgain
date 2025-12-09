import React from "react";
import { Link } from "react-router-dom";
import "../assets/styles/Header.css";
import { FaUser, FaSearch, FaHeart, FaShoppingCart } from "react-icons/fa";

export default function Header() {
    return (
        <header className="header">
            {/* LOGO */}
            <div className="header-left">
                <img src="/logo.png" alt="LifeAgain Logo" className="logo-img" />
                <span className="logo-text">LIFEAGAIN</span>
            </div>

            {/* NAVIGATION */}
            <nav className="header-nav">
                <Link to="/">Home</Link>
                <Link to="/categories">Categories</Link>
                <Link to="/shop">Shop</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
            </nav>

            {/* ICONS */}
            <div className="header-icons">
                <FaUser className="icon" />
                <FaSearch className="icon" />
                <FaHeart className="icon" />
                <FaShoppingCart className="icon" />
            </div>
        </header>
    );
}
