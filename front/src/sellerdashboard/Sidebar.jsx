import { Link } from "react-router-dom";
import "./Dashboard.css";
import React from "react";
export default function Sidebar() {
    return (
        <aside className="dashboard-sidebar">
            <h2>Seller Panel</h2>

            <nav>
                <Link to="/dashboard">📊 Overview</Link>
                <Link to="/dashboard/listings">🛍 My Listings</Link>
                <Link to="/create-ad">➕ Create Listing</Link>
                <Link to="/dashboard/settings">⚙️ Settings</Link>
                
            </nav>
        </aside>
    );
}
