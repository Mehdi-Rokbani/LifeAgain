import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/styles/Header.css";
import { FaSearch, FaHeart, FaShoppingCart } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useLogout } from "../hooks/useLogout";

export default function Header() {
    const { user } = useContext(AuthContext);
    const { logout } = useLogout();
    const navigate = useNavigate();

    const [openMenu, setOpenMenu] = useState(false);

    const handleLogout = () => {
        logout();
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

                {user?.role === "seller" && <Link to="/dashboard">Dashboard</Link>}
                {user?.role === "admin" && <Link to="/admin">Dashboard</Link>}

                <Link to="/shop">Shop</Link>

                {user && <Link to="/chat">Chat</Link>}
            </nav>

            {/* ICONS */}
            <div className="header-icons">
                {/* PROFILE */}
                <div className="profile-wrapper">
                    <button
                        className="profile-avatar"
                        onClick={() => setOpenMenu(!openMenu)}
                        aria-label="User menu"
                    >
                        {user ? "🧑" : "🙂"}
                    </button>

                    {openMenu && (
                        <div className="profile-dropdown">
                            {user ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="dropdown-item"
                                        onClick={() => setOpenMenu(false)}
                                    >
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
                                <Link
                                    to="/login"
                                    className="dropdown-item"
                                    onClick={() => setOpenMenu(false)}
                                >
                                    🔐 Login
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* SEARCH */}
                <Link to="/" title="Search">
                    <FaSearch className="icon" />
                </Link>

                {/* ❤️ FAVORITES — CLIENT ONLY */}
                {user?.role === "client" && (
                    <Link to="/favorites" title="Favorites">
                        <FaHeart className="icon" />
                    </Link>
                )}

                {/* 🛒 CART — CLIENT ONLY */}
                {user?.role === "client" && (
                    <Link to="/cart" title="Cart">
                        <FaShoppingCart className="icon" />
                    </Link>
                )}
            </div>
        </header>
    );
}
