import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AdminCreateListing() {
    const token = localStorage.getItem("token");

    // ---------------- STATES ----------------
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [condition, setCondition] = useState("used");

    const [categories, setCategories] = useState([]);
    const [parentCategoryId, setParentCategoryId] = useState("");
    const [subCategoryId, setSubCategoryId] = useState("");

    const [sellers, setSellers] = useState([]);
    const [sellerId, setSellerId] = useState("");

    const [addresses, setAddresses] = useState([]);
    const [addressId, setAddressId] = useState("");

    const [cover, setCover] = useState(null);
    const [photos, setPhotos] = useState([]);

    const [errors, setErrors] = useState({});

    // ---------------- LOAD DATA ----------------
    useEffect(() => {
        if (!token) return;

        fetch("http://localhost:5000/api/categories")
            .then(r => r.json())
            .then(setCategories);

        fetch("http://localhost:5000/api/admin/sellers", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => d.success && setSellers(d.sellers));
    }, [token]);

    useEffect(() => {
        if (!sellerId) {
            setAddresses([]);
            setAddressId("");
            return;
        }

        fetch(`http://localhost:5000/api/admin/sellers/${sellerId}/addresses`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => d.success && setAddresses(d.addresses));
    }, [sellerId]);

    // ---------------- CATEGORY HELPERS ----------------
    const getParentId = (c) =>
        typeof c.parentCategory === "object"
            ? c.parentCategory?._id
            : c.parentCategory;

    const parentCategories = categories.filter(c => !getParentId(c));
    const subCategories = categories.filter(
        c => getParentId(c) === parentCategoryId
    );

    // ---------------- VALIDATION ----------------
    const validate = () => {
        const e = {};

        if (!title.trim()) e.title = "Title is required";
        if (!description.trim()) e.description = "Description is required";
        if (!price || Number(price) < 0.5) e.price = "Price must be ≥ 0.5";
        if (!subCategoryId) e.category = "Sub-category is required";
        if (!sellerId) e.seller = "Seller is required";
        if (!addressId) e.address = "Address is required";
        if (!cover) e.cover = "Cover image is required";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ---------------- SUBMIT ----------------
    const submit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please fix the highlighted errors");
            return;
        }

        const data = new FormData();
        data.append("title", title);
        data.append("description", description);
        data.append("price", price);
        data.append("condition", condition);
        data.append("category", subCategoryId);
        data.append("seller", sellerId);
        data.append("address", addressId);
        data.append("cover", cover);
        photos.forEach(p => data.append("photos", p));

        try {
            const res = await fetch("http://localhost:5000/api/admin/listings", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: data,
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.message || "Creation failed");
            }

            toast.success("Listing created successfully");

        } catch (err) {
            toast.error(err.message);
        }
    };

    // ---------------- UI ----------------
    return (
        <div style={{ padding: 30, maxWidth: 700 }}>
            <h2>Create Listing (Admin)</h2>

            <form className="admin-form" onSubmit={submit} noValidate>

                <input
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                {errors.title && <small className="error">{errors.title}</small>}

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                {errors.description && <small className="error">{errors.description}</small>}

                <input
                    type="number"
                    min="0.5"
                    step="0.01"
                    placeholder="Price (TND)"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                />
                {errors.price && <small className="error">{errors.price}</small>}

                <select
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                </select>

                <select
                    value={parentCategoryId}
                    onChange={e => {
                        setParentCategoryId(e.target.value);
                        setSubCategoryId("");
                    }}
                >
                    <option value="">Parent Category</option>
                    {parentCategories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>

                <select
                    value={subCategoryId}
                    onChange={e => setSubCategoryId(e.target.value)}
                    disabled={!parentCategoryId}
                >
                    <option value="">Sub-category</option>
                    {subCategories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
                {errors.category && <small className="error">{errors.category}</small>}

                <select value={sellerId} onChange={e => setSellerId(e.target.value)}>
                    <option value="">Seller</option>
                    {sellers.map(s => (
                        <option key={s._id} value={s._id}>
                            {s.username} ({s.email})
                        </option>
                    ))}
                </select>
                {errors.seller && <small className="error">{errors.seller}</small>}

                <select
                    value={addressId}
                    onChange={e => setAddressId(e.target.value)}
                    disabled={!sellerId}
                >
                    <option value="">Address</option>
                    {addresses.map(a => (
                        <option key={a._id} value={a._id}>
                            {a.street}, {a.city}
                        </option>
                    ))}
                </select>
                {errors.address && <small className="error">{errors.address}</small>}

                <input type="file" accept="image/*" onChange={e => setCover(e.target.files[0])} />
                {errors.cover && <small className="error">{errors.cover}</small>}

                <input type="file" multiple accept="image/*" onChange={e => setPhotos([...e.target.files])} />

                <button type="submit">Create Listing</button>
            </form>
        </div>
    );
}
