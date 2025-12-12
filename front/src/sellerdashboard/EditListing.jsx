import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "./Dashboard";
import React from "react";
export default function EditListing() {
    const { id } = useParams();
    const [listing, setListing] = useState(null);

    useEffect(() => {
        const load = async () => {
            const res = await fetch(`http://localhost:5000/api/listings/${id}`);
            const data = await res.json();
            if (data.success) setListing(data.listing);
        };

        load();
    }, [id]);

    const updateField = async (field, value) => {
        await fetch(`http://localhost:5000/api/listings/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ [field]: value })
        });
    };

    if (!listing) return <p>Loading...</p>;

    return (
        <DashboardLayout>
            <h1>Edit Listing</h1>

            <div className="edit-form">
                <label>Title</label>
                <input
                    defaultValue={listing.title}
                    onBlur={e => updateField("title", e.target.value)}
                />

                <label>Price</label>
                <input
                    defaultValue={listing.price}
                    onBlur={e => updateField("price", e.target.value)}
                />

                <label>Description</label>
                <textarea
                    defaultValue={listing.description}
                    onBlur={e => updateField("description", e.target.value)}
                />
            </div>
        </DashboardLayout>
    );
}
