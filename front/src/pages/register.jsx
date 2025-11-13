import { useState, useEffect } from "react";
import { useSingup } from "../hooks/useSignup";
//import "../assets/style/Signup.css";
//import "../assets/style/Header.css";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignupForm = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [role, setRole] = useState("");
    const { signup, error, isLoading } = useSingup();
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const skillOptions = [
        "HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue.js",
        "Node.js", "Express", "MongoDB", "SQL", "Python", "Django", "Flask",
        "PHP", "Laravel", "Ruby", "Ruby on Rails", "Java", "Spring Boot",
        "C#", ".NET", "AWS", "Docker", "Kubernetes", "GraphQL", "REST API"
    ];
    const [selectedSkills, setSelectedSkills] = useState([]);

    // Redirect if user is already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    // Show error toast when error from useSignup changes
    useEffect(() => {
        if (error) {
            // Parse backend errors to more user-friendly messages
            let errorMessage = error;

            if (error.includes('password')) {
                if (error.includes('shorter than the minimum allowed length')) {
                    errorMessage = "Password must be at least 6 characters long";
                } else if (error.includes('uppercase letter')) {
                    errorMessage = "Password must contain at least one uppercase letter";
                } else if (error.includes('number')) {
                    errorMessage = "Password must contain at least one number";
                }
            } else if (error.includes('email')) {
                if (error.includes('valid email')) {
                    errorMessage = "Please enter a valid email address";
                } else if (error.includes('already in use')) {
                    errorMessage = "This email is already registered";
                }
            } else if (error.includes('username')) {
                if (error.includes('already taken')) {
                    errorMessage = "Username is already taken";
                }
            }

            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }, [error]);

    const handleSkillChange = (skill) => {
        setSelectedSkills(prevSkills => {
            if (prevSkills.includes(skill)) {
                return prevSkills.filter(s => s !== skill);
            } else {
                return [...prevSkills, skill];
            }
        });
    };

    const removeSkill = (skillToRemove) => {
        setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
    };

    const validatePassword = (password) => {
        if (password.length < 6) {
            toast.warning("Password must be at least 6 characters long", {
                position: "top-center"
            });
            return false;
        }
        if (!/[0-9]/.test(password)) {
            toast.warning("Password must contain at least one number", {
                position: "top-center"
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !username || !password || !passwordCheck || !role) {
            toast.warning("Please fill in all required fields", {
                position: "top-center"
            });
            return;
        }

        if (!validatePassword(password)) {
            return;
        }

        if (password !== passwordCheck) {
            toast.error("Password confirmation doesn't match", {
                position: "top-center"
            });
            return;
        }

        if (role === "freelancer" && selectedSkills.length === 0) {
            toast.warning("Please select at least one skill", {
                position: "top-center"
            });
            return;
        }

        // Show loading toast
        const toastId = toast.loading("Creating your account...", {
            position: "top-center"
        });

        try {
            const userData = {
                email,
                username,
                password,
                role,
                ...(role === "freelancer" && { skills: selectedSkills })
            };

            await signup(userData);

            // Update toast on success
            toast.update(toastId, {
                render: "Account created successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } catch (err) {
            // Error will be handled by the useEffect error handler
            toast.dismiss(toastId);
        }
    };

    return (
        <div>
            <div className="header">
                <Header />
            </div>

            <div className="signup-container">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <h2>Create An Account</h2>
                    <p>Create an account to enjoy all the services</p>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password (min 6 chars, 1 uppercase, 1 number)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={passwordCheck}
                        onChange={(e) => setPasswordCheck(e.target.value)}
                        required
                    />

                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                value="freelancer"
                                checked={role === "freelancer"}
                                onChange={() => setRole("freelancer")}
                            />
                            I'm a Freelancer, looking for work
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="client"
                                checked={role === "client"}
                                onChange={() => setRole("client")}
                            />
                            I'm a client, hiring for a project
                        </label>
                    </div>

                    {role === "freelancer" && (
                        <div className="skills-section">
                            <div className="skills-selector">
                                <select
                                    onChange={(e) => {
                                        const selectedSkill = e.target.value;
                                        if (selectedSkill && selectedSkill !== "default") {
                                            handleSkillChange(selectedSkill);
                                            e.target.value = "default";
                                        }
                                    }}
                                    defaultValue="default"
                                >
                                    <option value="default" disabled>Select your skills</option>
                                    {skillOptions
                                        .filter(skill => !selectedSkills.includes(skill))
                                        .map(skill => (
                                            <option key={skill} value={skill}>
                                                {skill}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="selected-skills">
                                {selectedSkills.map(skill => (
                                    <div key={skill} className="skill-tag">
                                        {skill}
                                        <button
                                            type="button"
                                            className="remove-skill-btn"
                                            onClick={() => removeSkill(skill)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Signing up..." : "Sign up"}
                    </button>

                    <p className="signin-text">
                        Already Have An Account? <Link to='/login'>Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignupForm;