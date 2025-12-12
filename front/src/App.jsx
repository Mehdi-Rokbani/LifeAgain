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

// eyazagd pages
import CreateAd from "./pages/CreateAd";
import ListingDetail from "./pages/ListingDetail";
import ListingsList from "./pages/ListingList";
import ComparePage from "./pages/ComparePage";

// Seller Dashboard
import Overview from "./sellerdashboard/Overview";
import MyListings from "./sellerdashboard/MyListings";
import EditListing from "./sellerdashboard/EditListing";
import Settings from "./sellerdashboard/Settings";

import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>

      {/* ---------------- PUBLIC ROUTES ---------------- */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route path="/shop" element={<ListingsList />} />
      <Route path="/listings/:id" element={<ListingDetail />} />
      <Route path="/compare/:id" element={<ComparePage />} />

      <Route
        path="/cart"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <Cart />
          </ProtectedRoute>
        }
      />

      {/* Only sellers can create listings */}
      <Route
        path="/create-ad"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <CreateAd />
          </ProtectedRoute>
        }
      />

      {/* ---------------- PROTECTED (LOGGED IN) ---------------- */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["client", "seller"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute allowedRoles={["client", "seller"]}>
            <Chat />
          </ProtectedRoute>
        }
      />


      {/* ---------------- SELLER DASHBOARD ---------------- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <Overview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/listings"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <MyListings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/listings/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <EditListing />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute allowedRoles={["seller"]}>
            <Settings />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}
