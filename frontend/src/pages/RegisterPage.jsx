import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, ShieldCheck, Phone, Briefcase, Calendar, Wallet, Clock } from "lucide-react";
import { Card, Button, Field, PasswordField, ErrorBlock, C } from "../components/ui";
import { registerUser } from "../api/auth";

const initialForm = {
  full_name: "", employee_id: "", email: "", password: "", confirm_password: "",
  mobile_number: "", gender: "Female", date_of_birth: "", date_of_joining: "",
  department: "", designation: "", monthly_salary: "", office_start_time: "09:00 AM",
  office_end_time: "06:00 PM", overtime_rate: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await registerUser({
        ...form,
        monthly_salary: parseFloat(form.monthly_salary || 0),
        overtime_rate: parseFloat(form.overtime_rate || 0),
      });
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.detail || "Registration failed. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={22} color="#fff" />
          </div>
          <span style={{ fontSize: 19, fontWeight: 700, color: C.text }}>Attendly</span>
        </div>
        <Card style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Create your account</h2>
          <p style={{ fontSize: 13.5, color: C.textMuted, margin: "0 0 22px" }}>Set up your private workspace in a minute.</p>
          <ErrorBlock message={error} />
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <Field label="Full Name" icon={User} placeholder="Pooja S" value={form.full_name} onChange={update("full_name")} />
              <Field label="Employee ID" icon={ShieldCheck} placeholder="EMP-2026-001" value={form.employee_id} onChange={update("employee_id")} />
              <Field label="Email" icon={Mail} type="email" placeholder="you@company.com" value={form.email} onChange={update("email")} />
              <Field label="Mobile Number" icon={Phone} placeholder="9876543210" value={form.mobile_number} onChange={update("mobile_number")} />
              <PasswordField label="Password" value={form.password} onChange={update("password")} />
              <PasswordField label="Confirm Password" value={form.confirm_password} onChange={update("confirm_password")} />
            </div>

            <label style={{ display: "block", marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: "block" }}>Gender</span>
              <select value={form.gender} onChange={update("gender")} className="focus-ring" style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 12px", fontSize: 14, background: "#fff" }}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <Field label="Date of Birth" icon={Calendar} type="date" value={form.date_of_birth} onChange={update("date_of_birth")} />
              <Field label="Date of Joining" icon={Calendar} type="date" value={form.date_of_joining} onChange={update("date_of_joining")} />
              <Field label="Department" icon={Briefcase} placeholder="Engineering" value={form.department} onChange={update("department")} />
              <Field label="Designation" icon={Briefcase} placeholder="Software Engineer" value={form.designation} onChange={update("designation")} />
              <Field label="Monthly Salary (₹)" icon={Wallet} type="number" placeholder="45000" value={form.monthly_salary} onChange={update("monthly_salary")} />
              <Field label="Overtime Rate / hr (₹)" icon={Wallet} type="number" placeholder="150" value={form.overtime_rate} onChange={update("overtime_rate")} />
              <Field label="Office Start Time" icon={Clock} placeholder="09:00 AM" value={form.office_start_time} onChange={update("office_start_time")} />
              <Field label="Office End Time" icon={Clock} placeholder="06:00 PM" value={form.office_end_time} onChange={update("office_end_time")} />
            </div>

            <Button full type="submit" icon={ArrowRight} disabled={submitting}>{submitting ? "Creating account…" : "Register"}</Button>
          </form>
          <p style={{ textAlign: "center", fontSize: 13, color: C.textMuted, marginTop: 18 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: C.primary, fontWeight: 600, textDecoration: "none" }}>Log in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
