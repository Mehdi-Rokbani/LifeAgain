import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import React from "react";

export default function AdminListings() {
    const [listings, setListings] = useState([]);
    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    useEffect(() => {
        fetch("http://localhost:5000/api/admin/listings", { headers })
            .then((r) => r.json())
            .then((d) => setListings(d.listings || d))
            .catch(() => toast.error("Failed to load listings"));
    }, []);

    const deleteListing = async (id) => {
        if (!window.confirm("Delete listing and images?")) return;

        const res = await fetch(
            `http://localhost:5000/api/admin/listings/${id}`,
            { method: "DELETE", headers }
        );

        if (res.ok) {
            toast.success("Listing deleted");
            setListings((p) => p.filter((l) => l._id !== id));
        }
    };

    return (
        <div style={{ padding: 30 }}>
            <h1>Admin • Listings</h1>

            {listings.map((l) => (
                <div key={l._id} style={{ borderBottom: "1px solid #eee", padding: 12 }}>
                    <strong>{l.title}</strong> — {l.price} TND ({l.status})
                    <button
                        onClick={() => deleteListing(l._id)}
                        style={{ marginLeft: 10 }}
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}
