import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CheckCircle2, XCircle, Timer, Clock, Wallet, Receipt, StickyNote } from "lucide-react";
import { Card, PageHeader, StatCard, Badge, statusTone, Th, Td, C, PIE_COLORS, LoadingBlock, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { getDashboard } from "../api/dashboard";
import { checkIn as apiCheckIn } from "../api/attendance";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await getDashboard();
      setData(d);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await apiCheckIn("");
      await load();
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading || !data) return <LoadingBlock label="Loading your dashboard…" />;

  const pieData = Object.values(
    data.recent_expenses.reduce((acc, e) => {
      acc[e.category] = acc[e.category] || { name: e.category, value: 0 };
      acc[e.category].value += e.amount;
      return acc;
    }, {})
  ).filter((d) => d.value > 0);

  return (
    <div>
      <PageHeader
        title={`Welcome Back, ${user?.full_name?.split(" ")[0] || ""} 👋`}
        subtitle="Here's what's happening with your work this month."
        actions={
          !data.is_checked_in ? (
            <Button icon={CheckCircle2} onClick={handleCheckIn} disabled={checkingIn}>
              {checkingIn ? "Checking in…" : "Check In"}
            </Button>
          ) : null
        }
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <StatCard icon={CheckCircle2} label="Today's Status" value={data.today_status} tone={statusTone(data.today_status)} />
        <StatCard icon={Timer} label="Working Hours (Today)" value={`${data.today_working_hours}h`} tone="primary" />
        <StatCard icon={Clock} label="Overtime (Today)" value={`${data.today_overtime_hours}h`} tone="warning" />
        <StatCard icon={XCircle} label="Attendance %" value={`${data.attendance_percentage}%`} sub="this month" tone="success" />
        <StatCard icon={Wallet} label="Monthly Salary" value={`₹${data.monthly_salary.toLocaleString("en-IN")}`} tone="primary" />
        <StatCard icon={Receipt} label="Monthly Expenses" value={`₹${data.monthly_expenses.toLocaleString("en-IN")}`} tone="danger" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }} className="two-col">
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Attendance Overview</h3>
          <p style={{ fontSize: 12.5, color: C.textMuted, margin: "0 0 12px" }}>Present vs absent, this week</p>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={data.weekly_attendance} barGap={6}>
                <CartesianGrid vertical={false} stroke={C.border} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5 }} />
                <Bar dataKey="present" name="Present" fill={C.primary} radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill={C.danger} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Recent Expense Split</h3>
          <p style={{ fontSize: 12.5, color: C.textMuted, margin: "0 0 12px" }}>By category</p>
          <div style={{ width: "100%", height: 240 }}>
            {pieData.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5 }} formatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
                  <Legend wrapperStyle={{ fontSize: 11.5 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: C.textMuted, fontSize: 13, textAlign: "center", paddingTop: 80 }}>No expenses yet</p>
            )}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="two-col">
        <Card padded={false}>
          <div style={{ padding: "18px 20px 4px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Recent Attendance</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Date</Th><Th>Check In</Th><Th>Check Out</Th><Th align="center">Status</Th></tr></thead>
              <tbody>
                {data.recent_attendance.map((r, i) => (
                  <tr key={i}>
                    <Td>{r.date}</Td>
                    <Td muted>{r.check_in || "—"}</Td>
                    <Td muted>{r.check_out || "—"}</Td>
                    <Td align="center"><Badge tone={statusTone(r.status)}>{r.status}</Badge></Td>
                  </tr>
                ))}
                {!data.recent_attendance.length && (
                  <tr><Td muted colSpan={4}>No attendance records yet</Td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card padded={false}>
          <div style={{ padding: "18px 20px 4px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Recent Expenses</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>Date</Th><Th>Category</Th><Th>Description</Th><Th align="right">Amount</Th></tr></thead>
              <tbody>
                {data.recent_expenses.map((e, i) => (
                  <tr key={i}>
                    <Td>{e.date}</Td>
                    <Td><Badge tone="primary">{e.category}</Badge></Td>
                    <Td muted>{e.description}</Td>
                    <Td align="right">₹{e.amount.toLocaleString("en-IN")}</Td>
                  </tr>
                ))}
                {!data.recent_expenses.length && (
                  <tr><Td muted colSpan={4}>No expenses yet</Td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Recent Notes</h3>
          <StickyNote size={17} color={C.textFaint} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {data.recent_notes.map((n, i) => (
            <div key={i} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text, margin: "0 0 6px" }}>{n.title}</p>
              <p style={{ fontSize: 12.5, color: C.textMuted, margin: "0 0 10px", lineHeight: 1.5 }}>{n.description}</p>
              <p style={{ fontSize: 11.5, color: C.textFaint, margin: 0 }}>{n.date}</p>
            </div>
          ))}
          {!data.recent_notes.length && <p style={{ color: C.textMuted, fontSize: 13 }}>No notes yet</p>}
        </div>
      </Card>
    </div>
  );
}
