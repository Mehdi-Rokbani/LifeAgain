import { createContext, useReducer, useEffect } from "react";
import { authReducer } from "./authReducer";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user: null });

    useEffect(() => {
        const stored = localStorage.getItem("user");

        try {
            const parsed = stored ? JSON.parse(stored) : null;

            if (parsed) {
                dispatch({ type: "LOGIN", payload: parsed });
            }
        } catch (error) {
            console.log("AuthContext: invalid JSON in localStorage, cleared.",error);
            localStorage.removeItem("user");
        }
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
