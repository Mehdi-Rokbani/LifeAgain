import { createContext, useReducer } from "react";
import { authReducer } from "./authReducer";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    const [state, dispatch] = useReducer(authReducer, {
        user: storedUser || null,
    });

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
