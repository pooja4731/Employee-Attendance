import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import {
  Card,
  Button,
  Field,
  PasswordField,
  ErrorBlock,
  C,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";

function AuthShell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: C.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={22} color="#fff" />
          </div>
          <span style={{ fontSize: 19, fontWeight: 700, color: C.text }}>
            Attendly
          </span>
        </div>
        <Card style={{ padding: 32 }}>{children}</Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const token = localStorage.getItem("access_token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: C.text,
          margin: "0 0 4px",
        }}
      >
        Welcome back
      </h2>
      <p style={{ fontSize: 13.5, color: C.textMuted, margin: "0 0 26px" }}>
        Log in to manage your attendance, salary and expenses.
      </p>
      <ErrorBlock message={error} />
      <form onSubmit={handleSubmit}>
        <Field
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button full type="submit" icon={ArrowRight} disabled={submitting}>
          {submitting ? "Logging in…" : "Log In"}
        </Button>
      </form>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          margin: "20px 0",
        }}
      >
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontSize: 12, color: C.textFaint }}>OR</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>
      <Link to="/register" style={{ textDecoration: "none" }}>
        <Button full variant="outline">
          Create an account
        </Button>
      </Link>
    </AuthShell>
  );
}
