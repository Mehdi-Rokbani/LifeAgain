import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Chat from "./pages/chat";
import Home from "./pages/Home";
import Shop from "./pages/Shop/Shop";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";

import { AuthContext } from "./context/AuthContext";

export default function App() {
    const { user } = useContext(AuthContext); // ⭐ Correct value from context

    console.log("Stored User in App.jsx:", user);

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
                path="/profile"
                element={user ? <Profile /> : <Login />}
            />
            <Route
                path="/chat"
                element={user ? <Chat /> : <Login />}
            />
            <Route
                path="/shop"
                element={user ? <Shop /> : <Login />}
            />
            <Route
                path="/cart"
                element={user ? <Cart /> : <Login />}
            />
            <Route
                path="/checkout"
                element={user ? <Checkout /> : <Login />}
            />
        </Routes>
    );
}
