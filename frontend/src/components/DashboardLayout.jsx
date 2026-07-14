import React, { useState, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Toast } from "./ui";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/attendance": "Attendance",
  "/salary": "Salary",
  "/expenses": "Monthly Expenses",
  "/notes": "Notes",
  "/reports": "Reports",
  "/profile": "Profile",
  "/settings": "Settings",
};

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const location = useLocation();

  const notify = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(""), 2200);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#FBFBFC" }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar setMobileOpen={setMobileOpen} title={PAGE_TITLES[location.pathname] || ""} />
        <main style={{ padding: 24, flex: 1 }}>
          <Outlet context={{ notify }} />
        </main>
      </div>
      <Toast message={toast} />
    </div>
  );
}
