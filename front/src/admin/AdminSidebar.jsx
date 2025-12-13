import { NavLink } from "react-router-dom";
import "./admin.css";
import React from "react";

export default function AdminSidebar() {
    return (
        <aside className="admin-sidebar">
            <h2>Admin</h2>

            <NavLink to="/admin" end>Dashboard</NavLink>
            <NavLink to="/admin/users">Users</NavLink>
            <NavLink to="/admin/listings">Listings</NavLink>
            <NavLink to="/admin/listings/create">Create Listing</NavLink>
            <NavLink to="/admin/commandes">Commandes</NavLink>
        </aside>
    );
}
