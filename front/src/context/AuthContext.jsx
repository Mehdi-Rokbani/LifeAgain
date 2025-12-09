import { createContext, useReducer } from "react";
import { authReducer } from "./authReducer";
import React from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("Stored User in AuthContextProvider:", storedUser);
    const [state, dispatch] = useReducer(authReducer, {
        user: storedUser || null,
    });

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};
