import React, { useEffect, useState } from "react";

export default function AdminCommandes() {
    const [commandes, setCommandes] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) return;

        fetch("http://localhost:5000/api/admin/commandes", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(data => {
                setCommandes(Array.isArray(data.commandes) ? data.commandes : []);
            })
            .catch(err => console.error("Commandes error:", err));
    }, [token]);

    return (
        <div style={{ padding: 30 }}>
            <h2>Commandes</h2>

            <table width="100%" cellPadding="12" style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th align="left">Buyer</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Date</th>
                    </tr>
                </thead>

                <tbody>
                    {commandes.map(cmd => (
                        <tr key={cmd._id}>
                            <td>{cmd.buyer?.email || "—"}</td>
                            <td>{cmd.status}</td>
                            <td>{cmd.totalPrice} TND</td>
                            <td>{new Date(cmd.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
