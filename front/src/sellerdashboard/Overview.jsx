import { useEffect, useState } from "react";
import DashboardLayout from "./Dashboard";
import React from "react";
export default function Overview() {
    const [stats, setStats] = useState({ listings: 0, views: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const res = await fetch("http://localhost:5000/api/listings/seller/me", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            const data = await res.json();

            if (data.success) {
                const views = data.listings.reduce((sum, l) => sum + l.views, 0);
                setStats({ listings: data.listings.length, views });
            }
        };

        fetchStats();
    }, []);

    return (
        <DashboardLayout>
            <h1>Dashboard Overview</h1>

            <div className="stats-boxes">
                <div className="stat-box">
                    <h3>Total Listings</h3>
                    <p>{stats.listings}</p>
                </div>

                <div className="stat-box">
                    <h3>Total Views</h3>
                    <p>{stats.views}</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
