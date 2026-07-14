import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Wallet, Clock, LogOut, BellRing, Receipt, UserCog, Moon } from "lucide-react";
import { Card, PageHeader, Button, Field, PasswordField, LoadingBlock, C } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { getSettings, updateSettings } from "../api/settings";
import { changePassword } from "../api/auth";

function ToggleRow({ icon: Icon, title, sub, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ background: C.primarySoft, color: C.primary, borderRadius: 9, padding: 8, display: "flex" }}><Icon size={16} /></div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>{title}</p>
          <p style={{ fontSize: 12.5, color: C.textMuted, margin: "3px 0 0" }}>{sub}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="focus-ring"
        style={{ width: 42, height: 24, borderRadius: 999, border: "none", cursor: "pointer", background: value ? C.primary : "#D1D5DB", position: "relative", flexShrink: 0, transition: "background 0.15s" }}
      >
        <span style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 18, height: 18, borderRadius: 999, background: "#fff", transition: "left 0.15s" }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { notify } = useOutletContext();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_new_password: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [configForm, setConfigForm] = useState(null);
  const [configSaving, setConfigSaving] = useState(false);

  useEffect(() => {
    getSettings().then((s) => { setSettings(s); setConfigForm(s); }).finally(() => setLoading(false));
  }, []);

  const patchSetting = async (updates) => {
    const merged = { ...settings, ...updates };
    setSettings(merged);
    try {
      await updateSettings(updates);
    } catch {
      notify?.("Failed to update setting");
    }
  };

  const handleSaveConfig = async () => {
    setConfigSaving(true);
    try {
      await updateSettings({
        monthly_salary: parseFloat(configForm.monthly_salary),
        office_start_time: configForm.office_start_time,
        office_end_time: configForm.office_end_time,
        overtime_rate: parseFloat(configForm.overtime_rate),
      });
      notify?.("Settings saved");
    } catch {
      notify?.("Failed to save settings");
    } finally {
      setConfigSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm_new_password) {
      notify?.("New passwords do not match");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      notify?.("Password updated");
      setPwForm({ current_password: "", new_password: "", confirm_new_password: "" });
    } catch (e) {
      notify?.(e?.response?.data?.detail || "Failed to update password");
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  if (loading || !settings) return <LoadingBlock label="Loading settings…" />;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account preferences and security." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="two-col">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 6px" }}>Work Configuration</h3>
            <p style={{ fontSize: 12.5, color: C.textMuted, margin: "0 0 16px" }}>Salary, office hours, and overtime rate.</p>
            <Field label="Monthly Salary (₹)" icon={Wallet} type="number" value={configForm.monthly_salary} onChange={(e) => setConfigForm((f) => ({ ...f, monthly_salary: e.target.value }))} />
            <Field label="Office Start Time" icon={Clock} value={configForm.office_start_time} onChange={(e) => setConfigForm((f) => ({ ...f, office_start_time: e.target.value }))} />
            <Field label="Office End Time" icon={Clock} value={configForm.office_end_time} onChange={(e) => setConfigForm((f) => ({ ...f, office_end_time: e.target.value }))} />
            <Field label="Overtime Rate / hr (₹)" icon={Wallet} type="number" value={configForm.overtime_rate} onChange={(e) => setConfigForm((f) => ({ ...f, overtime_rate: e.target.value }))} />
            <Button onClick={handleSaveConfig} disabled={configSaving}>{configSaving ? "Saving…" : "Save Configuration"}</Button>
          </Card>

          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 6px" }}>Change Password</h3>
            <p style={{ fontSize: 12.5, color: C.textMuted, margin: "0 0 16px" }}>Choose a strong password you don't use elsewhere.</p>
            <PasswordField label="Current Password" value={pwForm.current_password} onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))} />
            <PasswordField label="New Password" value={pwForm.new_password} onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))} />
            <PasswordField label="Confirm New Password" value={pwForm.confirm_new_password} onChange={(e) => setPwForm((f) => ({ ...f, confirm_new_password: e.target.value }))} />
            <Button onClick={handleChangePassword} disabled={pwSaving}>{pwSaving ? "Updating…" : "Update Password"}</Button>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Notification Settings</h3>
            <ToggleRow icon={BellRing} title="Attendance reminders" sub="Get notified if you forget to check in." value={settings.notify_attendance} onChange={(v) => patchSetting({ notify_attendance: v })} />
            <ToggleRow icon={Wallet} title="Salary updates" sub="Alerts when your monthly salary is processed." value={settings.notify_salary} onChange={(v) => patchSetting({ notify_salary: v })} />
            <ToggleRow icon={Receipt} title="Expense alerts" sub="Warn me when I'm close to my monthly budget." value={settings.notify_expense} onChange={(v) => patchSetting({ notify_expense: v })} />
          </Card>
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Profile Settings</h3>
            <ToggleRow icon={UserCog} title="Public visibility" sub="Show your profile to teammates in reports." value={settings.public_visibility} onChange={(v) => patchSetting({ public_visibility: v })} />
            <ToggleRow icon={Moon} title="Compact mode" sub="Reduce spacing across tables and cards." value={settings.compact_mode} onChange={(v) => patchSetting({ compact_mode: v })} />
          </Card>
          <Card>
            <Button full variant="danger" icon={LogOut} onClick={handleLogout}>Logout</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
