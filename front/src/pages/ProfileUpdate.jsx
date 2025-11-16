import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
//import Header from "../components/Header";
import { toast } from "react-toastify";
//import "../assets/style/Header.css";
import "../assets/styles/profile.css";

const ProfileUpdate = () => {
    const { user, dispatch } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [password, setPassword] = useState("");
    const [editingField, setEditingField] = useState(null);
    const [preview, setPreview] = useState(null); // 🔸 For local image preview
    const [profilePicture, setProfilePicture] = useState(null);

    const skillOptions = [
        "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
        "Node.js", "Express", "MongoDB", "SQL", "Python", "Django", "Flask",
        "PHP", "Laravel", "Ruby", "Ruby on Rails", "Java", "Spring Boot",
        "C#", ".NET", "AWS", "Docker", "Kubernetes", "GraphQL", "REST API"
    ];

    // Load user data
    useEffect(() => {
        if (user?.user) {
            setUsername(user.user.username || "");
            setEmail(user.user.email || "");
            setPhone(user.user.phone || "");
            setSelectedSkills(user.user.skills || []);
            setPreview(user.user.profilePicture || null);
        }
    }, [user]);

    // ---------- Local image selection ----------
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            const url = URL.createObjectURL(file);
            setPreview(url);
            setEditingField("profilePicture");
        }
    };

    // ---------- Save handler ----------
    const handleSave = async (field, value) => {
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();

            if (field === "skills") formData.append("skills", JSON.stringify(selectedSkills));
            else if (field === "profilePicture" && profilePicture)
                formData.append("profilePicture", profilePicture);
            else formData.append(field, value);

            const res = await fetch("http://localhost:5000/api/users/profile", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Update failed");

            // Update local storage and context
            const updatedUser = { ...user, user: data.user };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            dispatch({ type: "LOGIN", payload: data.user });

            toast.success(`${field} updated successfully`);
            setEditingField(null);
        } catch (err) {
            console.error(err);
            toast.error(`${field} update failed`);
        }
    };

    const cancelEdit = () => {
        setEditingField(null);
        setProfilePicture(null);
        if (user?.user?.profilePicture) setPreview(user.user.profilePicture);
    };

    // ---------- Skills handlers ----------
    const handleSkillSelect = (e) => {
        const skill = e.target.value;
        if (skill && !selectedSkills.includes(skill) && skill !== "default") {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const removeSkill = (skill) =>
        setSelectedSkills(selectedSkills.filter((s) => s !== skill));

    return (
        <div className="profile-page">
            

            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {preview ? (
                            <img
                                src={preview}
                                alt="Profile"
                                className="avatar-img"
                            />
                        ) : (
                            username.charAt(0).toUpperCase()
                        )}
                    </div>
                    <h1>Your Profile</h1>
                </div>

                <div className="profile-card">
                    {/* ---------- Profile Picture ---------- */}
                    <div className="profile-field">
                        <div className="field-label">Profile Picture</div>
                        <div className="field-content">
                            {editingField === "profilePicture" ? (
                                <div className="edit-mode">
                                    <input type="file" accept="image/*" onChange={handleImageChange} />
                                    <div className="button-group">
                                        <button
                                            className="save-btn"
                                            onClick={() => handleSave("profilePicture")}
                                        >
                                            Save
                                        </button>
                                        <button className="cancel-btn" onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-mode">
                                    <button
                                        className="edit-btn"
                                        onClick={() => setEditingField("profilePicture")}
                                    >
                                        Change Picture
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ---------- Username ---------- */}
                    <div className="profile-field">
                        <div className="field-label">Username</div>
                        <div className="field-content">
                            {editingField === "username" ? (
                                <div className="edit-mode">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <div className="button-group">
                                        <button
                                            className="save-btn"
                                            onClick={() => handleSave("username", username)}
                                        >
                                            Save
                                        </button>
                                        <button className="cancel-btn" onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-mode">
                                    <span>{username}</span>
                                    <button
                                        className="edit-btn"
                                        onClick={() => setEditingField("username")}
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ---------- Email ---------- */}
                    <div className="profile-field">
                        <div className="field-label">Email</div>
                        <div className="field-content">
                            {editingField === "email" ? (
                                <div className="edit-mode">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <div className="button-group">
                                        <button
                                            className="save-btn"
                                            onClick={() => handleSave("email", email)}
                                        >
                                            Save
                                        </button>
                                        <button className="cancel-btn" onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-mode">
                                    <span>{email}</span>
                                    <button
                                        className="edit-btn"
                                        onClick={() => setEditingField("email")}
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ---------- Phone ---------- */}
                    <div className="profile-field">
                        <div className="field-label">Phone</div>
                        <div className="field-content">
                            {editingField === "phone" ? (
                                <div className="edit-mode">
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                    <div className="button-group">
                                        <button
                                            className="save-btn"
                                            onClick={() => handleSave("phone", phone)}
                                        >
                                            Save
                                        </button>
                                        <button className="cancel-btn" onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-mode">
                                    <span>{phone || "—"}</span>
                                    <button
                                        className="edit-btn"
                                        onClick={() => setEditingField("phone")}
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ---------- Skills ---------- */}
                    <div className="profile-field">
                        <div className="field-label">Skills</div>
                        <div className="field-content">
                            {editingField === "skills" ? (
                                <div className="edit-mode">
                                    <div className="skills-selector">
                                        <select
                                            onChange={handleSkillSelect}
                                            value="default"
                                            className="skills-dropdown"
                                        >
                                            <option value="default" disabled>
                                                Select skills
                                            </option>
                                            {skillOptions
                                                .filter((skill) => !selectedSkills.includes(skill))
                                                .map((skill) => (
                                                    <option key={skill} value={skill}>
                                                        {skill}
                                                    </option>
                                                ))}
                                        </select>
                                        <div className="selected-skills">
                                            {selectedSkills.map((skill) => (
                                                <div key={skill} className="skill-tag">
                                                    {skill}
                                                    <button
                                                        className="remove-skill"
                                                        onClick={() => removeSkill(skill)}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="button-group">
                                        <button
                                            className="save-btn"
                                            onClick={() => handleSave("skills")}
                                        >
                                            Save
                                        </button>
                                        <button className="cancel-btn" onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-mode">
                                    <div className="skills-tags">
                                        {selectedSkills.length > 0 ? (
                                            selectedSkills.map((skill) => (
                                                <span key={skill} className="skill-tag read-only">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="no-skills">No skills added</span>
                                        )}
                                    </div>
                                    <button
                                        className="edit-btn"
                                        onClick={() => setEditingField("skills")}
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ---------- Password ---------- */}
                    <div className="profile-field">
                        <div className="field-label">Password</div>
                        <div className="field-content">
                            {editingField === "password" ? (
                                <div className="edit-mode">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div className="button-group">
                                        <button
                                            className="save-btn"
                                            onClick={() => handleSave("password", password)}
                                        >
                                            Save
                                        </button>
                                        <button className="cancel-btn" onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-mode">
                                    <span>••••••••</span>
                                    <button
                                        className="edit-btn"
                                        onClick={() => setEditingField("password")}
                                    >
                                        Change
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileUpdate;
