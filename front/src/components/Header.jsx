import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/styles/Header.css";
import { FaUser, FaSearch, FaHeart, FaShoppingCart } from "react-icons/fa";
import { AuthContext } from '../context/AuthContext';
import { useLogout } from "../hooks/useLogout";

export default function Header() {
    const { user } = useContext(AuthContext);
    const { logout } = useLogout();
    const navigate = useNavigate();

    const [openMenu, setOpenMenu] = useState(false);

    const handleLogout = () => {
        logout(); // clears user + token + updates context
        navigate("/login");
    };

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
                {user && user.role === 'seller' && (
                    <Link to="/dashboard">Dashboard</Link>
                )}
                {user && user.role === 'client' && (
                    <Link to="/shop">Shop</Link>
                )}
                <Link to="/chat">Chat</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
            </nav>

            {/* ICONS */}
            <div className="header-icons">

                {/* PROFILE DROPDOWN */}
                <div className="profile-wrapper">
                    <button
                        className="profile-btn"
                        onClick={() => setOpenMenu(!openMenu)}
                    >
                        <FaUser className="icon" />
                    </button>

                    {openMenu && (
                        <div className="profile-dropdown">
                            {user ? (
                                <>
                                    <Link to="/profile" className="dropdown-item">
                                        👤 Profile
                                    </Link>

                                    <button
                                        className="dropdown-item logout"
                                        onClick={handleLogout}
                                    >
                                        🚪 Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="dropdown-item">
                                    🔐 Login
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                <Link to="/">
                    <FaSearch className="icon" />
                </Link>

                <Link to="/favorites">
                    <FaHeart className="icon" />
                </Link>

                <Link to={user ? "/cart" : "/login"}>
                    <FaShoppingCart className="icon" />
                </Link>

            </div>
        </header>
    );
}
