import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
            setStatus("error");
            setMessage("Missing verification token.");
            return;
        }

        const verifyUser = async () => {
            try {
                const res = await axios.post("http://localhost:5000/api/auth/verify-email", { token });

                setStatus("success");
                setMessage("Email verified successfully! Redirecting...");

                // Save token and redirect to onboarding
                localStorage.setItem("authToken", res.data.token);

                setTimeout(() => {
                    navigate("/onboarding");
                }, 2000);

            } catch (err) {
                setStatus("error");
                setMessage(err.response?.data?.message || "Verification failed.");
            }
        };

        verifyUser();
    }, [location, navigate]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "100px"
        }}>

            {status === "loading" && (
                <>
                    <h2>Verifying your email...</h2>
                    <p>Please wait.</p>
                </>
            )}

            {status === "success" && (
                <>
                    <h2 style={{ color: "green" }}>{message}</h2>
                </>
            )}

            {status === "error" && (
                <>
                    <h2 style={{ color: "red" }}>Verification Failed</h2>
                    <p>{message}</p>
                </>
            )}

        </div>
    );
};

export default VerifyEmail;
