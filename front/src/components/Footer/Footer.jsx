import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-features">
                <div className="feature">
                    <span className="feature-icon">🏆</span>
                    <div>
                        <h4>High Quality</h4>
                        <p>Crafted from top materials</p>
                    </div>
                </div>
                <div className="feature">
                    <span className="feature-icon">✅</span>
                    <div>
                        <h4>Warranty Protection</h4>
                        <p>Over 2 years</p>
                    </div>
                </div>
                <div className="feature">
                    <span className="feature-icon">🚚</span>
                    <div>
                        <h4>Free Shipping</h4>
                        <p>Order over 150 $</p>
                    </div>
                </div>
                <div className="feature">
                    <span className="feature-icon">💬</span>
                    <div>
                        <h4>24 / 7 Support</h4>
                        <p>Dedicated support</p>
                    </div>
                </div>
            </div>

            <div className="footer-content">
                <div className="footer-section">
                    <h3>LIFEAGAIN</h3>
                    <p>400 University Drive Suite 200</p>
                    <p>Coral Gables, FL 33134 USA</p>
                </div>

                <div className="footer-section">
                    <h4>Links</h4>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/shop">Shop</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Help</h4>
                    <ul>
                        <li><a href="/payment">Payment Options</a></li>
                        <li><a href="/returns">Returns</a></li>
                        <li><a href="/privacy">Privacy Policies</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Newsletter</h4>
                    <p>Subscribe to our newsletter</p>
                    <div className="newsletter">
                        <input type="email" placeholder="Enter your email" />
                        <button>Subscribe</button>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>2025 LIFEAGAIN. All rights reserved</p>
            </div>
        </footer>
    );
};

export default Footer;