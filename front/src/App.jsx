import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ===================== PUBLIC PAGES ===================== */
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ListingsList from "./pages/ListingList";
import ListingDetail from "./pages/ListingDetail";
import ComparePage from "./pages/ComparePage";

/* ===================== CLIENT ===================== */
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Profile from "./pages/Profile";
import Chat from "./pages/chat";
import Favorites from "./pages/Favorites";

/* ===================== SELLER ===================== */
import CreateAd from "./pages/CreateAd";
import Overview from "./sellerdashboard/Overview";
import MyListings from "./sellerdashboard/MyListings";
import EditListing from "./sellerdashboard/EditListing";
import Settings from "./sellerdashboard/Settings";

/* ===================== ADMIN ===================== */
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminListings from "./admin/AdminListings";
import AdminCreateListing from "./admin/AdminCreateListing";
import AdminCommandes from "./admin/AdminCommandes";


/* ===================== AUTH ===================== */
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      {/* 🔔 GLOBAL TOASTS */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />

      <Routes>
        {/* ===================================================
                            PUBLIC
        =================================================== */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/shop" element={<ListingsList />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/compare/:id" element={<ComparePage />} />

        {/* ===================================================
                            CLIENT
        =================================================== */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <Cart />
            </ProtectedRoute>
          }
        />


        <Route
          path="/favorites"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* ===================================================
                            AUTHENTICATED
        =================================================== */}
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

        {/* ===================================================
                            SELLER
        =================================================== */}
        <Route
          path="/create-ad"
          element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <CreateAd />
            </ProtectedRoute>
          }
        />

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

        {/* ===================================================
                            ADMIN
        =================================================== */}

        {/* ---------------- ADMIN ROUTES ---------------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="listings/create" element={<AdminCreateListing />} />
          <Route path="commandes" element={<AdminCommandes />} />
        </Route>




      </Routes>
    </>
  );
}
