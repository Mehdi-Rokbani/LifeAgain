import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useProfileUpdate = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { dispatch } = useAuthContext();

    const updateProfile = async (updates) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:5000/api/auth/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Update failed");
                setLoading(false);
                return;
            }

            // Update localStorage & context
            localStorage.setItem("user", JSON.stringify(data.user));
            dispatch({ type: "LOGIN", payload: data.user });
            setLoading(false);
            return data.user;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return { updateProfile, loading, error };
};
