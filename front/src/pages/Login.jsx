import { useState, useEffect } from "react";
import { useLogin } from "../hooks/useLogin";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/styles/register.css"; // ✅ same CSS as Signup
import lifeAgainLogo from "../assets/images/lifeagain.png";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login, loading, error } = useLogin();
    const { user } = useAuthContext();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            toast.info("You are already logged in.");
            navigate("/");
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.warning("Please fill in all required fields");
            return;
        }

        const success = await login(email, password);
        if (success) {
            toast.success("Logged in successfully!");
            navigate("/");
        } else {
            toast.error("Invalid credentials");
        }
    };

    return (
        <div className="signup-page">
            {/* ---------- Left: Form ---------- */}
            <div className="signup-left">
                <div className="signup-form-container">
                    <h1>Welcome Back</h1>
                    <p>Log in to continue exploring the LifeAgain Marketplace</p>

                    <form className="signup-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit" className="signup-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <p className="signin-text">
                            Don’t have an account? <Link to="/signup">Sign Up</Link>
                        </p>

                        {error && <p className="auth-error">{error}</p>}
                    </form>
                </div>
            </div>

            {/* ---------- Right: Image ---------- */}
            <div className="signup-right">
                <img src={lifeAgainLogo} alt="LifeAgain Marketplace" />
            </div>
        </div>
    );
}
