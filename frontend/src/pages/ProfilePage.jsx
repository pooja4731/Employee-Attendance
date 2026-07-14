import { useOutletContext } from "react-router-dom";
import React, { useState } from "react";
import { Pencil, KeyRound, User, Mail, Briefcase, Calendar, Wallet, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card, PageHeader, Button, Badge, C } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api/auth";

function DetailField({ label, icon: Icon, value, editing, onChange, disabled }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={13} /> {label}
      </p>
      {editing && !disabled ? (
        <input value={value} onChange={onChange} className="focus-ring" style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, width: "100%" }} />
      ) : (
        <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>{value}</p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { notify } = useOutletContext();
  const { user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: user?.full_name || "", mobile_number: user?.mobile_number || "" });
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const initials = user.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      await refreshProfile();
      setEditing(false);
      notify?.("Profile updated");
    } catch {
      notify?.("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your personal and employment details." />
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }} className="two-col">
        <Card style={{ textAlign: "center" }}>
          <div style={{ width: 88, height: 88, borderRadius: 999, background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 28, margin: "0 auto 14px" }}>
            {initials}
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 2px" }}>{user.full_name}</p>
          <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 12px" }}>{user.designation}</p>
          <Badge tone="success">Active Employee</Badge>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <Button full variant="outline" icon={Pencil} onClick={() => setEditing((e) => !e)}>{editing ? "Close Editing" : "Edit Profile"}</Button>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 16px" }}>Employment Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="two-col">
            <DetailField editing={editing} label="Full Name" icon={User} value={editing ? form.full_name : user.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            <DetailField editing={editing} label="Email" icon={Mail} value={user.email} disabled />
            <DetailField editing={editing} label="Mobile Number" icon={ShieldCheck} value={editing ? form.mobile_number : user.mobile_number} onChange={(e) => setForm((f) => ({ ...f, mobile_number: e.target.value }))} />
            <DetailField editing={editing} label="Department" icon={Briefcase} value={user.department} disabled />
            <DetailField editing={editing} label="Designation" icon={Briefcase} value={user.designation} disabled />
            <DetailField editing={editing} label="Joining Date" icon={Calendar} value={user.date_of_joining} disabled />
            <DetailField editing={editing} label="Monthly Salary" icon={Wallet} value={`₹${user.monthly_salary.toLocaleString("en-IN")}`} disabled />
            <DetailField editing={editing} label="Employee ID" icon={ShieldCheck} value={user.employee_id} disabled />
          </div>
          {editing && (
            <div style={{ marginTop: 20 }}>
              <Button icon={CheckCircle2} onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
