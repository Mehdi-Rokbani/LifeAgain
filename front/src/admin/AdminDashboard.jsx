import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: 0,
        listings: 0,
        commandes: 0,
    });

    // ✅ ALWAYS read from localStorage
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            console.error("❌ NO TOKEN FOUND IN LOCAL STORAGE");
            return;
        }

        console.log("✅ Admin token:", token);

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        const fetchStats = async () => {
            try {
                const [usersRes, listingsRes, commandesRes] = await Promise.all([
                    fetch("http://localhost:5000/api/admin/users", { headers }),
                    fetch("http://localhost:5000/api/admin/listings", { headers }),
                    fetch("http://localhost:5000/api/admin/commandes", { headers }),
                ]);

                if (!usersRes.ok || !listingsRes.ok || !commandesRes.ok) {
                    throw new Error("One of admin requests failed");
                }

                const usersData = await usersRes.json();
                const listingsData = await listingsRes.json();
                const commandesData = await commandesRes.json();

                console.log("USERS:", usersData);
                console.log("LISTINGS:", listingsData);
                console.log("COMMANDES:", commandesData);

                setStats({
                    users: usersData.users.length,
                    listings: listingsData.listings.length,
                    commandes: commandesData.commandes.length,
                });

            } catch (err) {
                console.error("❌ ADMIN DASHBOARD ERROR:", err.message);
            }
        };

        fetchStats();
    }, [token]);

    return (
        <div>
            <h1 style={{ fontSize: 28, marginBottom: 24 }}>Dashboard</h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 20,
                }}
            >
                <StatCard title="Users" value={stats.users} icon="👤" />
                <StatCard title="Listings" value={stats.listings} icon="📦" />
                <StatCard title="Commandes" value={stats.commandes} icon="🧾" />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }) {
    return (
        <div
            style={{
                background: "#ffffff",
                borderRadius: 12,
                padding: 24,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
        >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>{title}</div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{value}</div>
        </div>
    );
}
