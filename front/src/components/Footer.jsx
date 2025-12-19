import React from "react";
import { Link } from "react-router-dom";
import "../assets/styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-brand">
          <h3>LIFEAGAIN</h3>
          <p>Buy • Sell • Reuse responsibly.</p>
        </div>

        <div className="footer-links">
          <h4>Marketplace</h4>
          <Link to="/shop">Shop</Link>
          <Link to="/categories">Categories</Link>
        </div>

        <div className="footer-links">
          <h4>Account</h4>
          <Link to="/profile">Profile</Link>
          <Link to="/chat">Chat</Link>
        </div>

        <div className="footer-links">
          <h4>Seller</h4>
          <Link to="/create-ad">Create Listing</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} LifeAgain. All rights reserved.
      </div>
    </footer>
  );
}
