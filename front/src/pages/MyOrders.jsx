import React, { useEffect, useState } from "react";
import commandeService from "../services/commandeService";
import Header from "../components/Header";
import "./MyOrders.css";

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const res = await commandeService.getMyCommandes();
                setOrders(res.commandes || []);
            } catch {
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    if (loading) {
        return <div className="orders-loading">Loading orders…</div>;
    }

    return (
        <div className="orders-page">
            <Header />

            <div className="orders-container">
                <h1>My Orders</h1>

                {orders.length === 0 && (
                    <p className="empty-orders">You have no orders yet.</p>
                )}

                {orders.map((order) => (
                    <div key={order._id} className="order-card">
                        {/* HEADER */}
                        <div className="order-header">
                            <span>
                                <strong>Order:</strong> {order.orderNumber}
                            </span>
                            <span className={`status ${order.status}`}>
                                {order.status.toUpperCase()}
                            </span>
                        </div>

                        {/* ITEMS */}
                        <div className="order-items">
                            {order.items.map((item) => {
                                const listing = item.listing;
                                if (!listing) return null;

                                return (
                                    <div key={item._id} className="order-item">
                                        <div className="item-image">
                                            {listing.images?.[0] ? (
                                                <img
                                                    src={`http://localhost:5000${listing.images[0]}`}
                                                    alt={listing.title}
                                                />
                                            ) : (
                                                <div className="no-image">📦</div>
                                            )}
                                        </div>

                                        <div className="item-info">
                                            <h4>{listing.title}</h4>
                                            <p>Seller: {listing.seller?.username}</p>
                                            <p>Price: {item.price} TND</p>
                                            <p className={`item-status ${listing.status}`}>
                                                {listing.status}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* FOOTER */}
                        <div className="order-footer">
                            <span>
                                <strong>Total:</strong> {order.totalPrice} TND
                            </span>
                            <span>
                                {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
