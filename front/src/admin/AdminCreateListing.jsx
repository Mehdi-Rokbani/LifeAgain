import { useState } from "react";
import { toast } from "react-toastify";
import React from "react";

export default function AdminCreateListing() {
    const token = localStorage.getItem("token");

    const [form, setForm] = useState({});
    const [cover, setCover] = useState(null);
    const [photos, setPhotos] = useState([]);

    const submit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("No admin token");
            return;
        }

        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => data.append(k, v));
        if (cover) data.append("cover", cover);
        photos.forEach(p => data.append("photos", p));

        try {
            const res = await fetch("http://localhost:5000/api/admin/listings", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: data,
            });

            if (!res.ok) throw new Error();

            toast.success("Listing created");
        } catch {
            toast.error("Error creating listing");
        }
    };

    return (
        <div style={{ padding: 30, maxWidth: 600 }}>
            <h2>Create Listing</h2>

            <form className="admin-form" onSubmit={submit}>
                <input placeholder="Title"
                    onChange={e => setForm({ ...form, title: e.target.value })} />

                <textarea placeholder="Description"
                    onChange={e => setForm({ ...form, description: e.target.value })} />

                <input type="number" placeholder="Price"
                    onChange={e => setForm({ ...form, price: e.target.value })} />

                <input placeholder="Category ID"
                    onChange={e => setForm({ ...form, category: e.target.value })} />

                <input placeholder="Seller ID"
                    onChange={e => setForm({ ...form, seller: e.target.value })} />

                <input placeholder="Address ID"
                    onChange={e => setForm({ ...form, address: e.target.value })} />

                <input type="file" onChange={e => setCover(e.target.files[0])} />
                <input type="file" multiple onChange={e => setPhotos([...e.target.files])} />

                <button type="submit">Create</button>
            </form>
        </div>
    );
}
