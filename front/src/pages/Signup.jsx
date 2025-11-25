import { useState } from "react";
import { useSingup } from "../hooks/useSignup";
import "../assets/styles/auth.css";
import lifeagain from "../assets/lifeagain.png";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("client");

    const { signup, Loading, Error } = useSingup();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return;

        signup({ username, email, password, role });
    };

    return (
        <div className="auth-container">

            {/* LEFT SIDE FORM */}
            <div className="auth-left">
                <h1 className="auth-title">Get Started Now</h1>
                <p className="auth-subtitle">
                    Create an account to explore the LifeAgain Marketplace
                </p>

                <form onSubmit={handleSubmit} className="auth-form">

                    {/* Username */}
                    <div className="auth-field">
                        <label>Name</label>
                        <input
                            placeholder="Enter your name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="auth-field">
                        <label>Email address</label>
                        <input
                            placeholder="Enter your email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                        <label>Password</label>
                        <input
                            placeholder="Enter your password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="auth-field">
                        <label>Confirm Password</label>
                        <input
                            placeholder="Confirm password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Role */}
                    <div className="auth-field">
                        <label>Account Type</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="auth-select"
                        >
                            <option value="client">Client</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Error */}
                    {Error && <p className="auth-error">{Error}</p>}

                    {/* Button */}
                    <button className="auth-btn" disabled={Loading}>
                        {Loading ? "Signing up..." : "Signup"}
                    </button>

                </form>

                <p className="auth-footer">
                    Already have an account?
                    <a href="/login"> Login</a>
                </p>
            </div>

            {/* RIGHT IMAGE */}
            <div className="auth-right">
                <img src={lifeagain} className="auth-hero" alt="LifeAgain Marketplace" />
            </div>

        </div>
    );
}
