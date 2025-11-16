import { useState } from "react";
//import { useAuthContext } from "./useAuthContext";
import { toast } from "react-toastify";

export const useSignup = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    //const { dispatch } = useAuthContext();

    const signup = async (userData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const json = await response.json();
            console.log("🔍 Backend response:", json);

            if (!response.ok) {
                setError(json.message || "Registration failed");
                setLoading(false);
                return;
            }

            toast.success("Registration successful! Check your email to verify your account.");

            setLoading(false);
            return json.user;
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    return { signup, loading, error };
};
