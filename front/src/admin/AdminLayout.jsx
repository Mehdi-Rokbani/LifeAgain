import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import "./admin.css";
import React from "react";
import Header from "../components/Header";

export default function AdminLayout() {
  return (
    <>
      <Header />
      <div className="admin-layout">
        <AdminSidebar />

        <div className="admin-main">
          <AdminTopbar />
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>

    </>
  );
}
