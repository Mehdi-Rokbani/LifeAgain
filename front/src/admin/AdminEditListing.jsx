import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminEditListing() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(true);
    const [isSold, setIsSold] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        condition: "used",
        status: "available",
    });

    // ---------------- FETCH LISTING ----------------
    useEffect(() => {
        fetch(`http://localhost:5000/api/admin/listings/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => {
                if (!d.success) throw new Error();

                if (d.listing.status === "sold") {
                    setIsSold(true);
                    toast.info("Sold listings cannot be edited");
                }

                setForm({
                    title: d.listing.title,
                    description: d.listing.description,
                    price: d.listing.price,
                    condition: d.listing.condition,
                    status: d.listing.status,
                });
            })
            .catch(() => {
                toast.error("Failed to load listing");
                navigate("/admin/listings");
            })
            .finally(() => setLoading(false));
    }, [id, token]);

    // ---------------- SUBMIT ----------------
    const submit = async (e) => {
        e.preventDefault();
        if (isSold) return;

        try {
            const res = await fetch(
                `http://localhost:5000/api/admin/listings/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(form),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Listing updated");
            navigate("/admin/listings");
        } catch (err) {
            toast.error(err.message || "Update failed");
        }
    };

    if (loading) return <p>Loading…</p>;

    return (
        <div style={{ padding: 30, maxWidth: 600 }}>
            <h2>Edit Listing</h2>

            {isSold && (
                <div
                    style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        padding: 10,
                        borderRadius: 6,
                        marginBottom: 15,
                        fontWeight: 600,
                    }}
                >
                    This listing is sold and cannot be edited.
                </div>
            )}

            <form onSubmit={submit} className="admin-form">
                <input
                    value={form.title}
                    disabled={isSold}
                    onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                    }
                />

                <textarea
                    value={form.description}
                    disabled={isSold}
                    onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                    }
                />

                <input
                    type="number"
                    step="any"
                    min="0.5"
                    value={form.price}
                    disabled={isSold}
                    onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                    }
                />

                <select
                    value={form.condition}
                    disabled={isSold}
                    onChange={(e) =>
                        setForm({ ...form, condition: e.target.value })
                    }
                >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                </select>

                <select
                    value={form.status}
                    disabled={isSold}
                    onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                    }
                >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="archived">Archived</option>
                </select>

                <button type="submit" disabled={isSold}>
                    Save Changes
                </button>
            </form>
        </div>
    );
}
