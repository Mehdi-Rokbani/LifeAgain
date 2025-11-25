import { useEffect, useState } from "react";
import "../assets/styles/profile.css";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

export default function Profile() {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const [form, setForm] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
    });

    const { updateProfile, loading, error, success } = useUpdateProfile();

    useEffect(() => {
        if (storedUser) {
            setForm({
                username: storedUser.username || "",
                email: storedUser.email || "",
                phone: storedUser.phone || "",
                password: "",
            });
        }
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfile(form);
    };

    return (
        <div className="profile-container">

            {/* LEFT SIDEBAR */}
            <div className="profile-sidebar">
                <h2>Your Profile</h2>
                <ul>
                    <li className="active">Account Information</li>
                    {/* future sections:
                    <li>Addresses</li>
                    <li>Favorites</li>
                    */}
                </ul>
            </div>

            {/* RIGHT PANEL: FORM */}
            <div className="profile-content">
                <h1 className="profile-title">Account Settings</h1>
                <p className="profile-subtitle">
                    Update your information anytime.
                </p>

                <form onSubmit={handleSubmit} className="profile-form">

                    {/* Username */}
                    <div className="profile-field">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="profile-field">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div className="profile-field">
                        <label>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="profile-field">
                        <label>New Password (optional)</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Leave empty to keep current password"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Error */}
                    {error && <p className="profile-error">{error}</p>}
                    {success && <p className="profile-success">{success}</p>}

                    <button type="submit" className="profile-btn" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}
