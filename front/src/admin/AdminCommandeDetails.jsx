import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminCommandeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [commande, setCommande] = useState(null);
    const [loading, setLoading] = useState(true);

    // ---------------- LOAD COMMANDE ----------------
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/api/admin/commandes/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json();
                if (!res.ok) throw new Error(data.message);

                setCommande(data.commande);
            } catch {
                toast.error("Failed to load order");
                navigate("/admin/commandes");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    // ---------------- UPDATE STATUS ----------------
    const updateStatus = async (status) => {
        if (commande.status === status) return;

        if (commande.status === "completed" || commande.status === "cancelled") {
            toast.info("This order is locked");
            return;
        }

        const toastId = toast.loading("Updating order status...");

        try {
            const res = await fetch(
                `http://localhost:5000/api/admin/commandes/${commande._id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.update(toastId, {
                render: "Order status updated",
                type: "success",
                isLoading: false,
                autoClose: 2000,
            });

            setCommande({ ...commande, status });
        } catch (err) {
            toast.update(toastId, {
                render: err.message || "Update failed",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    if (loading) return <div style={{ padding: 30 }}>Loading…</div>;
    if (!commande) return null;

    const locked =
        commande.status === "completed" ||
        commande.status === "cancelled";

    return (
        <div style={{ padding: 30, maxWidth: 900 }}>
            <h1>Commande Details</h1>

            {/* META */}
            <div style={{ marginBottom: 20 }}>
                <p><strong>Buyer:</strong> {commande.buyer?.email}</p>
                <p><strong>Status:</strong> {commande.status}</p>
                <p>
                    <strong>Date:</strong>{" "}
                    {new Date(commande.createdAt).toLocaleString()}
                </p>
                <p><strong>Total:</strong> {commande.totalPrice} TND</p>
            </div>

            {/* STATUS SELECT */}
            <div style={{ marginBottom: 30 }}>
                <label style={{ fontWeight: 600 }}>Update status:</label>
                <br />
                <select
                    value={commande.status}
                    disabled={locked}
                    onChange={(e) => updateStatus(e.target.value)}
                    style={{
                        padding: 8,
                        marginTop: 8,
                        minWidth: 200,
                    }}
                >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* ITEMS */}
            <h2>Items</h2>

            <table
                width="100%"
                cellPadding="10"
                style={{
                    borderCollapse: "collapse",
                    background: "#fff",
                }}
            >
                <thead style={{ background: "#f5f5f5" }}>
                    <tr>
                        <th align="left">Product</th>
                        <th align="left">Seller</th>
                        <th align="left">Price</th>
                        <th align="left">Qty</th>
                        <th align="left">Subtotal</th>
                    </tr>
                </thead>

                <tbody>
                    {commande.items.map((item) => (
                        <tr key={item._id} style={{ borderBottom: "1px solid #eee" }}>
                            <td>{item.listing?.title || "—"}</td>
                            <td>{item.listing?.seller?.username || "—"}</td>
                            <td>{item.price} TND</td>
                            <td>{item.quantity}</td>
                            <td>{item.price * item.quantity} TND</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button
                onClick={() => navigate("/admin/commandes")}
                style={{
                    marginTop: 30,
                    padding: "10px 16px",
                    borderRadius: 6,
                    border: "none",
                    background: "#2563eb",
                    color: "#fff",
                    cursor: "pointer",
                }}
            >
                ← Back to commandes
            </button>
        </div>
    );
}
