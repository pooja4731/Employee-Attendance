import React from "react";
import { Menu, Search, Bell, Calendar, ChevronDown } from "lucide-react";
import { C } from "./ui";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ setMobileOpen, title }) {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const initials = user?.full_name
    ? user.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
        <button className="mobile-menu-btn focus-ring" onClick={() => setMobileOpen(true)} style={{ display: "none", background: "#F3F4F6", border: "none", borderRadius: 8, padding: 8, cursor: "pointer" }}>
          <Menu size={18} color={C.text} />
        </button>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }} className="hide-mobile">{title}</h2>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <span className="hide-mobile" style={{ fontSize: 13, color: C.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={15} color={C.textFaint} /> {today}
        </span>
        <button className="focus-ring" style={{ position: "relative", background: "#F3F4F6", border: "none", borderRadius: 10, padding: 9, cursor: "pointer", display: "flex" }}>
          <Bell size={17} color={C.text} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 999, background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, overflow: "hidden" }}>
            {user?.profile_photo ? <img src={user.profile_photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
          </div>
          <div className="hide-mobile" style={{ lineHeight: 1.2 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{user?.full_name || "—"}</p>
            <p style={{ fontSize: 11.5, color: C.textMuted, margin: 0 }}>{user?.designation || ""}</p>
          </div>
          <ChevronDown size={15} color={C.textFaint} className="hide-mobile" />
        </div>
      </div>
    </header>
  );
}
