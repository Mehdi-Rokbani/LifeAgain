import "./admin.css";
import React from "react";

export default function AdminTopbar() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <header className="admin-topbar">
            <h1>Admin Dashboard</h1>
            <div className="admin-user">{user?.email}</div>
        </header>
    );
}
