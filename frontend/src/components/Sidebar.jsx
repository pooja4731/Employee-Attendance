import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Clock, Wallet, Receipt, StickyNote, BarChart3, User,
  Settings, LogOut, ShieldCheck,
} from "lucide-react";
import { C } from "./ui";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attendance", label: "Attendance", icon: Clock },
  { to: "/salary", label: "Salary", icon: Wallet },
  { to: "/expenses", label: "Monthly Expenses", icon: Receipt },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const content = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "22px 20px 26px" }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ShieldCheck size={19} color="#fff" />
        </div>
        <span style={{ fontSize: 17, fontWeight: 700, color: C.text }}>Attendly</span>
      </div>
      <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 3 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className="focus-ring"
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
              background: isActive ? C.primarySoft : "transparent",
              color: isActive ? C.primary : C.textMuted,
              fontWeight: isActive ? 600 : 500, fontSize: 14, width: "100%",
              textDecoration: "none",
            })}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: 12, borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={handleLogout}
          className="focus-ring"
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: C.danger, fontWeight: 600, fontSize: 14, width: "100%" }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className="desktop-sidebar"
        style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${C.border}`, background: "#fff", position: "sticky", top: 0, height: "100vh" }}
      >
        {content}
      </aside>
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(17,24,39,0.45)" }} onClick={() => setMobileOpen(false)} />
          <aside style={{ position: "relative", width: 240, background: "#fff", height: "100%", boxShadow: "10px 0 30px rgba(0,0,0,0.15)" }}>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
