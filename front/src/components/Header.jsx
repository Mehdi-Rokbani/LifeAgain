import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/styles/Header.css";
import { FaSearch, FaHeart, FaShoppingCart } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useLogout } from "../hooks/useLogout";
import { getAvatarUrl } from "../utils/avatar";

export default function Header() {
    const { user } = useContext(AuthContext);
    const { logout } = useLogout();
    const navigate = useNavigate();

    const [openMenu, setOpenMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const avatarUrl = getAvatarUrl(user);

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

                {user?.role === "client" && (
                    <Link to="/my-orders">My Orders</Link>
                )}

                {user?.role === "client" && <Link to="/chat">Chat</Link>}
                {user?.role === "seller" && <Link to="/chat">Chat</Link>}
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
                        {console.log(avatarUrl)}
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                className="header-avatar-img"
                            />
                        ) : (
                            <div className="header-avatar-fallback">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                        )}
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




                {/* FAVORITES */}
                {user?.role === "client" && (
                    <Link to="/favorites" title="Favorites">
                        <FaHeart className="icon" />
                    </Link>
                )}

                {/* CART */}
                {user?.role === "client" && (
                    <Link to="/cart" title="Cart">
                        <FaShoppingCart className="icon" />
                    </Link>
                )}
            </div>
        </header>
    );
}