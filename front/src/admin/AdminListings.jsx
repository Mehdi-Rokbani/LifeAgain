import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function AdminListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    // ---------------- LOAD LISTINGS ----------------
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(
                    "http://localhost:5000/api/admin/listings",
                    { headers }
                );
                const data = await res.json();

                if (!res.ok) throw new Error(data.message);
                setListings(data.listings || []);
            } catch {
                toast.error("Failed to load listings");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    // ---------------- DELETE ----------------
    const deleteListing = async (listing) => {
        if (listing.status === "sold") return;

        const ok = window.confirm(
            "This will permanently delete the listing and its images.\nContinue?"
        );
        if (!ok) return;

        try {
            const res = await fetch(
                `http://localhost:5000/api/admin/listings/${listing._id}`,
                { method: "DELETE", headers }
            );

            if (!res.ok) throw new Error();

            toast.success("Listing deleted");
            setListings(prev => prev.filter(l => l._id !== listing._id));
        } catch {
            toast.error("Failed to delete listing");
        }
    };

    // ---------------- UI HELPERS ----------------
    const statusBadge = (status) => {
        const colors = {
            available: "#22c55e",
            sold: "#ef4444",
            archived: "#f59e0b",
        };

        return (
            <span
                style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fff",
                    background: colors[status] || "#999",
                }}
            >
                {status.toUpperCase()}
            </span>
        );
    };

    if (loading) return <div style={{ padding: 30 }}>Loading listings…</div>;

    return (
        <div style={{ padding: 30 }}>
            <h1>Admin • Listings</h1>

            {listings.length === 0 && <p>No listings found.</p>}

            {listings.length > 0 && (
                <table
                    width="100%"
                    cellPadding="10"
                    style={{
                        borderCollapse: "collapse",
                        marginTop: 20,
                        background: "#fff",
                    }}
                >
                    <thead style={{ background: "#f5f5f5" }}>
                        <tr>
                            <th align="left">Title</th>
                            <th align="left">Seller</th>
                            <th align="left">Category</th>
                            <th align="left">Price</th>
                            <th align="left">Status</th>
                            <th align="left">Created</th>
                            <th align="right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {listings.map((l) => (
                            <tr key={l._id} style={{ borderBottom: "1px solid #eee" }}>
                                <td>{l.title}</td>
                                <td>{l.seller?.username || "—"}</td>
                                <td>{l.category?.name || "—"}</td>
                                <td>{l.price} TND</td>
                                <td>{statusBadge(l.status)}</td>
                                <td>{new Date(l.createdAt).toLocaleDateString()}</td>

                                <td align="right" style={{ whiteSpace: "nowrap" }}>
                                    <Link
                                        to={`/listings/${l._id}`}
                                        style={{ marginRight: 8 }}
                                    >
                                        View
                                    </Link>

                                    {l.status === "sold" ? (
                                        <span
                                            style={{
                                                marginRight: 8,
                                                color: "#999",
                                                cursor: "not-allowed",
                                            }}
                                            title="Sold listings cannot be edited"
                                        >
                                            Edit
                                        </span>
                                    ) : (
                                        <Link
                                            to={`/admin/listings/${l._id}/edit`}
                                            style={{ marginRight: 8 }}
                                        >
                                            Edit
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => deleteListing(l)}
                                        disabled={l.status === "sold"}
                                        style={{
                                            background:
                                                l.status === "sold" ? "#ccc" : "#ff4d4f",
                                            color: "#fff",
                                            border: "none",
                                            padding: "6px 10px",
                                            borderRadius: 6,
                                            cursor:
                                                l.status === "sold"
                                                    ? "not-allowed"
                                                    : "pointer",
                                        }}
                                        title={
                                            l.status === "sold"
                                                ? "Sold listings cannot be deleted"
                                                : "Delete listing"
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
