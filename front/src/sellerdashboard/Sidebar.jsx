import React from "react";
import { NavLink } from "react-router-dom";
import "./Dashboard.css";

export default function Sidebar() {
    return (
        <aside className="dashboard-sidebar">
            <div className="sidebar-header">
                <h2>Seller Panel</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    📊 Overview
                </NavLink>

                <NavLink
                    to="/dashboard/orders"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    📦 Orders
                </NavLink>

                <NavLink
                    to="/dashboard/listings"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    🛍 My Listings
                </NavLink>

                <NavLink
                    to="/create-ad"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    ➕ Create Listing
                </NavLink>

                <NavLink
                    to="/dashboard/settings"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    ⚙️ Settings
                </NavLink>
            </nav>
        </aside>
    );
}
