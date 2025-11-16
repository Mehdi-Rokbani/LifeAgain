import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/styles/onboarding.css";

export default function StepPicture({ back }) {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // --------------------
    // Select profile picture
    // --------------------
    const onSelectFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    // --------------------
    // Upload picture
    // --------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("image", image);

            await axios.post(
                "http://localhost:5000/api/users/upload-picture",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            navigate("/profile");
        } catch (err) {
            console.log("UPLOAD ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    // --------------------
    // Skip profile picture
    // --------------------
    const skip = async () => {
        setLoading(true);

        try {
            await axios.post(
                "http://localhost:5000/api/users/skip-picture",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            navigate("/profile");
        } catch (err) {
            console.log("SKIP ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    // --------------------
    // UI
    // --------------------
    return (
        <form onSubmit={handleSubmit} className="step-picture-card">

            <h2 className="step-picture-title">Add Your Profile Picture</h2>

            {/* Preview Area */}
            <div className="step-picture-preview-container">
                {preview ? (
                    <img
                        src={preview}
                        alt="profile preview"
                        className="profile-preview"
                    />
                ) : (
                    <div className="step-picture-placeholder">
                        Upload a photo to continue
                    </div>
                )}
            </div>

            {/* Upload Button */}
            <label className="step-picture-upload-btn">
                Choose a picture
                <input type="file" accept="image/*" onChange={onSelectFile} />
            </label>

            {/* Actions */}
            <div className="step-picture-actions">
                <button
                    type="button"
                    className="btn-back"
                    onClick={back}
                    disabled={loading}
                >
                    Back
                </button>

                <button
                    type="button"
                    className="btn-skip"
                    onClick={skip}
                    disabled={loading}
                >
                    Skip
                </button>

                <button
                    type="submit"
                    className="btn-finish"
                    disabled={!image || loading}
                >
                    {loading ? "Saving..." : "Finish"}
                </button>
            </div>
        </form>
    );
}
