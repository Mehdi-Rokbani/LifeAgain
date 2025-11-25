import { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/styles/auth.css";
import { useLogin } from "../hooks/useLogin";
import lifeagain from "../assets/lifeagain.png";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const { login, Loading, Error } = useLogin();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        login(form.email, form.password);
    };

    return (
        <div className="auth-container">
            {/* LEFT SIDE FORM */}
            <div className="auth-left">
                <h1 className="auth-title">Welcome back!</h1>
                <p className="auth-subtitle">
                    Enter your credentials to access your account
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label>Email address</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {Error && <p className="auth-error">{Error}</p>}

                    <button className="auth-btn" disabled={Loading}>
                        {Loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                {/* Social login options */}
                <div className="auth-social">
                    <button className="social-btn google-btn">
                        Sign in with Google
                    </button>
                    <button className="social-btn apple-btn">
                        Sign in with Apple
                    </button>
                </div>

                <p className="auth-footer">
                    Don't have an account?
                    <Link to="/signup"> Sign Up</Link>
                </p>
            </div>

            {/* RIGHT SIDE IMAGE */}
            <div className="auth-right">
                <img src={lifeagain} className="auth-hero" alt="LifeAgain Marketplace" />
            </div>
        </div>
    );
}