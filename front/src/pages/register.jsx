import { useState, useEffect } from "react";
import { useSignup } from "../hooks/useSignup";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/register.css";
import lifeAgainLogo from "../assets/images/lifeagain.png"; // your right-side image

export default function Signup() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        phone: "",
        role: "client",
    });

    const { signup, loading, error } = useSignup();

    const { user } = useAuthContext();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            toast.info("You are already logged in.");
            navigate("/");
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, email, password } = form;

        if (!username || !email || !password) {
            toast.warning("Please fill in all required fields");
            return;
        }

        try {
            await signup(form);
            toast.success("Account created successfully!");
            navigate("/login");
        } catch {
            toast.error("Signup failed");
        }
    };

    return (
        <div className="signup-page">
            {/* ---------- Left side: Form ---------- */}
            <div className="signup-left">
                <div className="signup-form-container">
                    <h1>Get Started Now</h1>
                    <p>Create an account to explore the LifeAgain Marketplace</p>

                    <form className="signup-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Name"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone (optional)"
                            value={form.phone}
                            onChange={handleChange}
                        />

                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="client">Client</option>
                            <option value="seller">Seller</option>
                        </select>

                        <div className="checkbox">
                            <input type="checkbox" required />
                            <label>I agree to the terms & policy</label>
                        </div>

                        <button type="submit" className="signup-btn" disabled={loading}>
                            {loading ? "Creating account..." : "Signup"}
                        </button>

                        <div className="divider">or</div>

                        <div className="social-buttons">
                            <button type="button" className="social-btn">
                                <img
                                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                                    alt="Google"
                                    width="18"
                                />
                                Sign in with Google
                            </button>

                            <button type="button" className="social-btn">
                                <img
                                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg"
                                    alt="Apple"
                                    width="18"
                                />
                                Sign in with Apple
                            </button>
                        </div>

                        <p className="signin-text">
                            Have an account? <Link to="/login">Sign In</Link>
                        </p>

                        {error && <p className="auth-error">{error}</p>}
                    </form>
                </div>
            </div>

            {/* ---------- Right side: Image ---------- */}
            <div className="signup-right">
                <img src={lifeAgainLogo} alt="LifeAgain Marketplace" />
            </div>
        </div>
    );
}
