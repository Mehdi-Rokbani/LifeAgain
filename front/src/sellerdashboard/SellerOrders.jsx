import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import commandeService from "../services/commandeService";
import DashboardLayout from "./Dashboard";

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            const res = await commandeService.getSellerCommandes();
            setOrders(res.commandes || []);
        } catch {
            toast.error("Failed to load seller orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const action = async (type, orderId, listingId) => {
        try {
            await fetch(
                `http://localhost:5000/api/commandes/${orderId}/${type}/${listingId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            toast.success(
                type === "confirm"
                    ? "Item confirmed"
                    : "Item rejected"
            );

            loadOrders();
        } catch {
            toast.error("Action failed");
        }
    };

    const orderBadge = (status) => {
        const map = {
            pending: { label: "PENDING", color: "#f59e0b" },
            confirmed: { label: "CONFIRMED", color: "#22c55e" },
            cancelled: { label: "CANCELLED", color: "#ef4444" },
        };

        const s = map[status] || map.pending;

        return (
            <span
                style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    background: s.color,
                }}
            >
                {s.label}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <div style={{ padding: 30, maxWidth: 1100 }}>
                <h1 style={{ marginBottom: 20 }}>Seller Orders</h1>

                {loading && <p>Loading orders…</p>}
                {!loading && orders.length === 0 && <p>No orders yet.</p>}

                {orders.map((order) => (
                    <div
                        key={order._id}
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 20,
                            marginBottom: 20,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                    >
                        {/* ORDER HEADER */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 15,
                            }}
                        >
                            <div>
                                <strong>Order:</strong> {order.orderNumber}
                                <div style={{ fontSize: 13, color: "#666" }}>
                                    Buyer: {order.buyer?.email}
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                {orderBadge(order.status)}
                                <span style={{ fontSize: 13 }}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* ITEMS */}
                        {order.items.map((item) => {
                            const listing = item.listing;
                            const status = listing.status;

                            const badgeColor =
                                status === "sold"
                                    ? "#22c55e"
                                    : status === "in_transit"
                                        ? "#f59e0b"
                                        : "#999";

                            return (
                                <div
                                    key={item._id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 15,
                                        padding: "12px 0",
                                        borderTop: "1px solid #eee",
                                    }}
                                >
                                    {/* IMAGE */}
                                    <div
                                        style={{
                                            width: 70,
                                            height: 70,
                                            borderRadius: 8,
                                            overflow: "hidden",
                                            background: "#f3f3f3",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {listing.images?.[0] && (
                                            <img
                                                src={`http://localhost:5000${listing.images[0]}`}
                                                alt={listing.title}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* INFO */}
                                    <div style={{ flex: 1 }}>
                                        <strong>{listing.title}</strong>
                                        <div>{item.price} TND</div>
                                    </div>

                                    {/* ITEM STATUS */}
                                    <span
                                        style={{
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "#fff",
                                            background: badgeColor,
                                        }}
                                    >
                                        {status.toUpperCase()}
                                    </span>

                                    {/* ACTIONS */}
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                            onClick={() =>
                                                action("confirm", order._id, listing._id)
                                            }
                                            disabled={
                                                status !== "in_transit" ||
                                                order.status !== "pending"
                                            }
                                        >
                                            Confirm
                                        </button>

                                        <button
                                            onClick={() =>
                                                action("reject", order._id, listing._id)
                                            }
                                            disabled={
                                                status !== "in_transit" ||
                                                order.status !== "pending"
                                            }
                                            style={{
                                                background: "#ef4444",
                                                color: "#fff",
                                            }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
