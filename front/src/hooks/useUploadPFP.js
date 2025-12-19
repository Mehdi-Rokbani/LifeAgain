import { useState } from "react";
export const useUploadPFP = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const uploadPFP = async (file) => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("image", file); // ✅ MUST MATCH multer

            const res = await fetch(
                "http://localhost:5000/api/user/me/profile-image",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: formData,
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            localStorage.setItem("user", JSON.stringify(data.user));
            return data.user;

        } catch (err) {
            setError(err.message || "Profile image upload failed");
        } finally {
            setLoading(false);
        }
    };

    return { uploadPFP, loading, error };
};
