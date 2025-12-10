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

// From eyazagd branch
import CreateAd from "./pages/CreateAd";
import ListingDetail from "./pages/ListingDetail";
import ListingsList from "./pages/ListingList";
import ComparePage from "./pages/ComparePage";

import { AuthContext } from "./context/AuthContext";

export default function App() {
  const { user } = useContext(AuthContext);

  console.log("Stored User in App.jsx:", user);

  return (
    <Routes>
      {/* ---------------- PUBLIC ROUTES ---------------- */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* eyazagd public routes */}
      <Route path="/shop" element={<ListingsList />} />
      <Route path="/listings/:id" element={<ListingDetail />} />
      <Route path="/compare/:id" element={<ComparePage />} />
      <Route path="/create-ad" element={<CreateAd />} />

      {/* ---------------- PROTECTED ROUTES ---------------- */}
      <Route path="/profile" element={user ? <Profile /> : <Login />} />
      <Route path="/chat" element={user ? <Chat /> : <Login />} />
      <Route path="/cart" element={user ? <Cart /> : <Login />} />
      <Route path="/checkout" element={user ? <Checkout /> : <Login />} />
    </Routes>
  );
}
