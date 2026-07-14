import React, { useEffect, useState } from "react";
import { Wallet, Clock, Calendar, TrendingUp, Info } from "lucide-react";
import { Card, PageHeader, StatCard, LoadingBlock, C } from "../components/ui";
import { getSalary } from "../api/salary";

export default function SalaryPage() {
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalary().then(setSalary).finally(() => setLoading(false));
  }, []);

  if (loading || !salary) return <LoadingBlock label="Loading salary details…" />;

  const inr = (v) => `₹${v.toLocaleString("en-IN")}`;

  return (
    <div>
      <PageHeader title="Salary" subtitle="View-only summary — auto-calculated from your attendance and settings." />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <StatCard icon={Wallet} label="Monthly Salary" value={inr(salary.monthly_salary)} tone="primary" />
        <StatCard icon={Calendar} label="Daily Salary" value={inr(salary.daily_salary)} tone="primary" />
        <StatCard icon={Clock} label="Hourly Salary" value={inr(salary.hourly_salary)} tone="primary" />
        <StatCard icon={Clock} label="Total Overtime Hours" value={`${salary.total_overtime_hours}h`} tone="warning" />
        <StatCard icon={TrendingUp} label="Overtime Amount" value={inr(salary.overtime_amount)} tone="warning" trend="up" />
        <StatCard icon={Wallet} label="Final Salary" value={inr(salary.final_salary)} tone="success" />
      </div>

      <Card>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Info size={18} color={C.textFaint} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13.5, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>
            Salary figures are calculated automatically from your base monthly salary, overtime rate,
            and this month's attendance records. To change your base salary or overtime rate, go to
            <b> Settings</b>. This page cannot be edited directly.
          </p>
        </div>
      </Card>
    </div>
  );
}
