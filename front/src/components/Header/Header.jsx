import React from 'react';
import { Link } from 'react-router-dom';
import { usePanier } from '../../context/PanierContext';
import './Header.css';

// 👉 Import du logo
import logo from '../../assets/images/LogoProj.png';

const Header = () => {
    const { itemCount } = usePanier();

    return (
        <header className="header">
            <div className="header-container">

                <Link to="/" className="logo">
                    <img src={logo} alt="Logo LifeAgain" className="logo-img" />
                    <span className="logo-text">LIFEAGAIN</span>
                </Link>

                <nav className="nav">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/shop" className="nav-link">Shop</Link>
                    <Link to="/about" className="nav-link">About</Link>
                    <Link to="/contact" className="nav-link">Contact</Link>
                </nav>

                <div className="header-actions">
                    <button className="icon-btn">
                        <span>👤</span>
                    </button>
                    <button className="icon-btn">
                        <span>🔍</span>
                    </button>
                    <button className="icon-btn">
                        <span>❤️</span>
                    </button>

                    <Link to="/cart" className="icon-btn cart-btn">
                        <span>🛒</span>
                        {itemCount > 0 && (
                            <span className="cart-badge">{itemCount}</span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
