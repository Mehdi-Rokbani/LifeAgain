import Sidebar from "./Sidebar";
import "./Dashboard.css";
import Header from "../components/Header";
import React from "react";
export default function DashboardLayout({ children }) {
    return (
        <>
        <Header></Header>
        <div className="dashboard-container">
            
            <Sidebar />
            <div className="dashboard-content">
                {children}
            </div>
        </div>
        
    </>
    );
}
