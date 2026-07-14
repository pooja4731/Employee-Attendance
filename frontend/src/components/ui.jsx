import React, { useState } from "react";
import { CheckCircle2, TrendingUp, TrendingDown, X, Eye, EyeOff } from "lucide-react";

export const C = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primarySoft: "#EFF4FF",
  success: "#22C55E",
  successSoft: "#EAFBF0",
  warning: "#F59E0B",
  warningSoft: "#FEF6E7",
  danger: "#EF4444",
  dangerSoft: "#FDEDED",
  text: "#1F2937",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
  border: "#E5E7EB",
  cardBg: "#F9FAFB",
  bg: "#FFFFFF",
  violet: "#8B5CF6",
  cyan: "#06B6D4",
};

export const PIE_COLORS = [C.primary, C.success, C.warning, C.violet, C.cyan, C.danger];

export function Card({ children, style, className = "", padded = true }) {
  return (
    <div
      className={className}
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.04)",
        padding: padded ? 20 : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", size = "md", icon: Icon, onClick, type = "button", full, disabled }) {
  const sizes = { sm: "6px 12px", md: "10px 16px", lg: "12px 20px" };
  const fontSizes = { sm: 13, md: 14, lg: 15 };
  const styles = {
    primary: { background: C.primary, color: "#fff", border: `1px solid ${C.primary}` },
    outline: { background: "#fff", color: C.text, border: `1px solid ${C.border}` },
    ghost: { background: "transparent", color: C.textMuted, border: "1px solid transparent" },
    danger: { background: C.dangerSoft, color: C.danger, border: `1px solid ${C.dangerSoft}` },
    success: { background: C.success, color: "#fff", border: `1px solid ${C.success}` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="focus-ring"
      style={{
        ...styles[variant],
        padding: sizes[size],
        fontSize: fontSizes[size],
        fontWeight: 600,
        borderRadius: 10,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        width: full ? "100%" : "auto",
        transition: "filter 0.15s ease, transform 0.05s ease",
        whiteSpace: "nowrap",
      }}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    success: { bg: C.successSoft, color: "#15803D" },
    warning: { bg: C.warningSoft, color: "#B45309" },
    danger: { bg: C.dangerSoft, color: "#B91C1C" },
    primary: { bg: C.primarySoft, color: C.primaryDark },
    neutral: { bg: "#F3F4F6", color: C.textMuted },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        background: t.bg, color: t.color, fontSize: 12, fontWeight: 600,
        padding: "4px 10px", borderRadius: 999, display: "inline-flex",
        alignItems: "center", gap: 6,
      }}
    >
      {children}
    </span>
  );
}

export function statusTone(status) {
  if (status === "Present") return "success";
  if (status === "Absent") return "danger";
  return "warning";
}

export function Field({ label, icon: Icon, type = "text", value, onChange, placeholder, rightAdornment, name }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: "block" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0 12px", background: "#fff" }}>
        {Icon && <Icon size={17} color={C.textFaint} style={{ marginRight: 8, flexShrink: 0 }} />}
        <input
          className="focus-ring"
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ border: "none", padding: "11px 0", width: "100%", fontSize: 14, color: C.text, background: "transparent" }}
        />
        {rightAdornment}
      </div>
    </label>
  );
}

export function PasswordField({ label, value, onChange, name, placeholder = "••••••••" }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label} name={name} type={show ? "text" : "password"} value={value} onChange={onChange}
      placeholder={placeholder}
      rightAdornment={
        <button type="button" onClick={() => setShow((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
          {show ? <EyeOff size={16} color={C.textFaint} /> : <Eye size={16} color={C.textFaint} />}
        </button>
      }
    />
  );
}

export function Modal({ open, onClose, title, children, width = 460 }) {
  if (!open) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: width, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.text }}>{title}</h3>
          <button onClick={onClose} className="focus-ring" style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
            <X size={16} color={C.textMuted} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.text, color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 10px 30px rgba(0,0,0,0.25)", zIndex: 200, display: "flex", alignItems: "center", gap: 8 }}>
      <CheckCircle2 size={16} color={C.success} />
      {message}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13.5, color: C.textMuted, margin: "4px 0 0" }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export function Th({ children, align = "left" }) {
  return (
    <th style={{ textAlign: align, fontSize: 12, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.4, padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
      {children}
    </th>
  );
}
export function Td({ children, align = "left", muted }) {
  return (
    <td style={{ textAlign: align, fontSize: 13.5, color: muted ? C.textMuted : C.text, padding: "13px 16px", borderBottom: `1px solid ${C.border}` }}>
      {children}
    </td>
  );
}

export function StatCard({ icon: Icon, label, value, sub, tone = "primary", trend }) {
  const tones = {
    primary: { bg: C.primarySoft, color: C.primary },
    success: { bg: C.successSoft, color: C.success },
    warning: { bg: C.warningSoft, color: C.warning },
    danger: { bg: C.dangerSoft, color: C.danger },
  };
  const t = tones[tone];
  return (
    <Card style={{ flex: "1 1 200px", minWidth: 190 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: C.textMuted, margin: "0 0 8px" }}>{label}</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>{value}</p>
          {sub && (
            <p style={{ fontSize: 12, color: C.textFaint, margin: "6px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
              {trend === "up" && <TrendingUp size={13} color={C.success} />}
              {trend === "down" && <TrendingDown size={13} color={C.danger} />}
              {sub}
            </p>
          )}
        </div>
        <div style={{ background: t.bg, color: t.color, borderRadius: 10, padding: 10, display: "flex" }}>
          <Icon size={19} />
        </div>
      </div>
    </Card>
  );
}

export function LoadingBlock({ label = "Loading…" }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: C.textMuted, fontSize: 14 }}>{label}</div>
  );
}

export function ErrorBlock({ message }) {
  if (!message) return null;
  return (
    <div style={{ background: C.dangerSoft, color: "#B91C1C", padding: "10px 14px", borderRadius: 10, fontSize: 13.5, marginBottom: 16 }}>
      {message}
    </div>
  );
}
