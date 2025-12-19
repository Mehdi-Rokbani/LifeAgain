import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import "../assets/styles/profile.css";

import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useUploadPFP } from "../hooks/useUploadPFP";
import { useAddress } from "../hooks/useAddress";
import { tunisiaLocations } from "../data/tunisiaLocations";

export default function Profile() {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    const [activeTab, setActiveTab] = useState("account");

    const [form, setForm] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
    });

    const [profilePicture, setProfilePicture] = useState(
        storedUser?.profilePicture
            ? `http://localhost:5000${storedUser.profilePicture}`
            : "/default-avatar.png"
    );

    const { updateProfile, loading, error, success } = useUpdateProfile();
    const { uploadPFP, loading: pfpLoading, error: pfpError } = useUploadPFP();
    const { getAddresses, addAddress, deleteAddress } = useAddress();

    const [addresses, setAddresses] = useState([]);
    const [addressForm, setAddressForm] = useState({
        wilaya: "",
        delegation: "",
        street: "",
        postalCode: "",
    });

    // --------------------------------------------------
    // LOAD USER DATA
    // --------------------------------------------------
    useEffect(() => {
        if (!storedUser) return;

        setForm({
            username: storedUser.username,
            email: storedUser.email,
            phone: storedUser.phone || "",
            password: "",
        });
    }, []);

    // --------------------------------------------------
    // LOAD ADDRESSES
    // --------------------------------------------------
    useEffect(() => {
        if (activeTab === "addresses") {
            loadAddresses();
        }
    }, [activeTab]);

    const loadAddresses = async () => {
        const data = await getAddresses();
        setAddresses(Array.isArray(data) ? data : []);
    };

    // --------------------------------------------------
    // PROFILE FORM
    // --------------------------------------------------
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfile(form);
    };

    // --------------------------------------------------
    // PROFILE PICTURE
    // --------------------------------------------------
    const handlePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // optimistic preview
        setProfilePicture(URL.createObjectURL(file));

        const updatedUser = await uploadPFP(file);

        if (updatedUser?.profilePicture) {
            setProfilePicture(
                `http://localhost:5000${updatedUser.profilePicture}`
            );
        }
    };

    // --------------------------------------------------
    // ADDRESS FORM
    // --------------------------------------------------
    const handleAddressChange = (e) => {
        setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();

        await addAddress({
            street: addressForm.street,
            city: addressForm.delegation,
            postalCode: addressForm.postalCode,
            country: addressForm.wilaya,
        });

        setAddressForm({
            wilaya: "",
            delegation: "",
            street: "",
            postalCode: "",
        });

        loadAddresses();
    };

    const handleDeleteAddress = async (id) => {
        await deleteAddress(id);
        loadAddresses();
    };

    // --------------------------------------------------
    // UI
    // --------------------------------------------------
    return (
        <>
            <Header />

            <div className="page-with-header">
                <div className="profile-container">
                    {/* SIDEBAR */}
                    <aside className="profile-sidebar">
                        <h2>Your Profile</h2>
                        <ul>
                            <li
                                className={activeTab === "account" ? "active" : ""}
                                onClick={() => setActiveTab("account")}
                            >
                                Account Information
                            </li>
                            <li
                                className={activeTab === "addresses" ? "active" : ""}
                                onClick={() => setActiveTab("addresses")}
                            >
                                Addresses
                            </li>
                        </ul>
                    </aside>

                    {/* CONTENT */}
                    <div className="profile-content">
                        {/* ACCOUNT TAB */}
                        {activeTab === "account" && (
                            <>
                                <h1 className="profile-title">Account Settings</h1>
                                <p className="profile-subtitle">
                                    Update your personal details and profile picture.
                                </p>

                                {/* PROFILE PICTURE */}
                                <div className="profile-picture-section">
                                    <img
                                        src={profilePicture}
                                        alt="Profile"
                                        className="profile-picture"
                                    />

                                    <label className="profile-change-btn">
                                        {pfpLoading ? "Uploading..." : "Change Picture"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={handlePictureChange}
                                        />
                                    </label>
                                </div>

                                {pfpError && (
                                    <p className="profile-error">{pfpError}</p>
                                )}

                                {/* FORM */}
                                <form
                                    onSubmit={handleSubmit}
                                    className="profile-form"
                                >
                                    <div className="profile-field">
                                        <label>Username</label>
                                        <input
                                            name="username"
                                            value={form.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="profile-field">
                                        <label>Email</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="profile-field">
                                        <label>Phone</label>
                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="profile-field">
                                        <label>Password (optional)</label>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Leave empty to keep current password"
                                            value={form.password}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {error && (
                                        <p className="profile-error">{error}</p>
                                    )}
                                    {success && (
                                        <p className="profile-success">{success}</p>
                                    )}

                                    <button
                                        className="profile-btn"
                                        disabled={loading}
                                    >
                                        {loading ? "Saving..." : "Save Changes"}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* ADDRESSES TAB */}
                        {activeTab === "addresses" && (
                            <>
                                <h1 className="profile-title">Your Addresses</h1>

                                <form
                                    className="address-form"
                                    onSubmit={handleAddAddress}
                                >
                                    <select
                                        name="wilaya"
                                        value={addressForm.wilaya}
                                        onChange={(e) =>
                                            setAddressForm({
                                                ...addressForm,
                                                wilaya: e.target.value,
                                                delegation: "",
                                            })
                                        }
                                        required
                                    >
                                        <option value="">Select Wilaya</option>
                                        {Object.keys(tunisiaLocations).map((w) => (
                                            <option key={w} value={w}>
                                                {w}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        name="delegation"
                                        value={addressForm.delegation}
                                        onChange={handleAddressChange}
                                        disabled={!addressForm.wilaya}
                                        required
                                    >
                                        <option value="">
                                            {addressForm.wilaya
                                                ? "Select Delegation"
                                                : "Select Wilaya first"}
                                        </option>
                                        {addressForm.wilaya &&
                                            tunisiaLocations[addressForm.wilaya].map(
                                                (d) => (
                                                    <option key={d} value={d}>
                                                        {d}
                                                    </option>
                                                )
                                            )}
                                    </select>

                                    <input
                                        name="street"
                                        placeholder="Street"
                                        value={addressForm.street}
                                        onChange={handleAddressChange}
                                        required
                                    />

                                    <input
                                        name="postalCode"
                                        placeholder="Postal Code"
                                        type="number"
                                        value={addressForm.postalCode}
                                        onChange={handleAddressChange}
                                        required
                                    />

                                    <button className="auth-btn">
                                        Add Address
                                    </button>
                                </form>

                                <div className="address-list">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            className="address-item"
                                        >
                                            <p>{addr.street}</p>
                                            <p>
                                                {addr.city}, {addr.country}
                                            </p>
                                            <p>{addr.postalCode}</p>

                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    handleDeleteAddress(addr._id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
