import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function AdminCommandes() {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    // ---------------- LOAD COMMANDES ----------------
    useEffect(() => {
        if (!token) return;

        const load = async () => {
            try {
                const res = await fetch(
                    "http://localhost:5000/api/admin/commandes",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                setCommandes(Array.isArray(data.commandes) ? data.commandes : []);
            } catch {
                toast.error("Failed to load commandes");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [token]);

    // ---------------- STATUS BADGE ----------------
    const statusBadge = (status) => {
        const colors = {
            pending: "#f59e0b",
            paid: "#3b82f6",
            completed: "#22c55e",
            cancelled: "#ef4444",
        };

        return (
            <span
                style={{
                    background: colors[status] || "#999",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                }}
            >
                {status.toUpperCase()}
            </span>
        );
    };

    // ---------------- UPDATE STATUS ----------------
    const updateStatus = async (commande, newStatus) => {
        if (commande.status === "completed" || commande.status === "cancelled") {
            return;
        }

        const confirm = window.confirm(
            `Change order status from "${commande.status}" to "${newStatus}"?`
        );
        if (!confirm) return;

        try {
            const res = await fetch(
                `http://localhost:5000/api/admin/commandes/${commande._id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Status updated");

            setCommandes((prev) =>
                prev.map((c) =>
                    c._id === commande._id ? { ...c, status: newStatus } : c
                )
            );
        } catch {
            toast.error("Failed to update status");
        }
    };

    // ---------------- RENDER ----------------
    if (loading) {
        return <div style={{ padding: 30 }}>Loading commandes…</div>;
    }

    return (
        <div style={{ padding: 30 }}>
            <h1>Admin • Commandes</h1>

            {commandes.length === 0 && (
                <p style={{ marginTop: 20, color: "#666" }}>
                    No commandes yet.
                </p>
            )}

            {commandes.length > 0 && (
                <table
                    width="100%"
                    cellPadding="12"
                    style={{
                        marginTop: 20,
                        borderCollapse: "collapse",
                        background: "#fff",
                    }}
                >
                    <thead style={{ background: "#f5f5f5" }}>
                        <tr>
                            <th align="left">Buyer</th>
                            <th align="left">Status</th>
                            <th align="left">Total</th>
                            <th align="left">Date</th>
                            <th align="right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {commandes.map((cmd) => {
                            const locked =
                                cmd.status === "completed" ||
                                cmd.status === "cancelled";

                            return (
                                <tr
                                    key={cmd._id}
                                    style={{ borderBottom: "1px solid #eee" }}
                                >
                                    <td>{cmd.buyer?.email || "—"}</td>

                                    <td>{statusBadge(cmd.status)}</td>

                                    <td>{cmd.totalPrice} TND</td>

                                    <td>
                                        {new Date(cmd.createdAt).toLocaleDateString()}
                                    </td>

                                    <td align="right" style={{ whiteSpace: "nowrap" }}>
                                        <Link
                                            to={`/admin/commandes/${cmd._id}`}
                                            style={{ marginRight: 10 }}
                                        >
                                            View
                                        </Link>

                                        <select
                                            value={cmd.status}
                                            disabled={locked}
                                            onChange={(e) =>
                                                updateStatus(cmd, e.target.value)
                                            }
                                            style={{
                                                padding: "6px",
                                                borderRadius: 6,
                                                cursor: locked
                                                    ? "not-allowed"
                                                    : "pointer",
                                            }}
                                        >
                                            <option value="pending">Pending</option>

                                            <option value="completed">
                                                Completed
                                            </option>
                                            <option value="cancelled">
                                                Cancelled
                                            </option>
                                        </select>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
