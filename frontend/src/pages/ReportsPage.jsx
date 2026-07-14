import { useOutletContext } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FileText, FileSpreadsheet, Calendar, CalendarRange } from "lucide-react";
import { Card, PageHeader, Button, StatCard, LoadingBlock, C } from "../components/ui";
import { getWeeklyReport, getMonthlyReport, downloadExport } from "../api/reports";

export default function ReportsPage() {
  const { notify } = useOutletContext();
  const [period, setPeriod] = useState("monthly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = period === "monthly" ? getMonthlyReport : getWeeklyReport;
    fetcher().then(setData).finally(() => setLoading(false));
  }, [period]);

  const handleExport = async (format) => {
    try {
      await downloadExport(period, format);
      notify?.(`${period === "monthly" ? "Monthly" : "Weekly"} report exported as ${format.toUpperCase()}`);
    } catch {
      notify?.("Export failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Weekly and monthly summaries of attendance, salary, and expenses."
        actions={
          <>
            <Button variant={period === "weekly" ? "primary" : "outline"} icon={Calendar} onClick={() => setPeriod("weekly")}>Weekly</Button>
            <Button variant={period === "monthly" ? "primary" : "outline"} icon={CalendarRange} onClick={() => setPeriod("monthly")}>Monthly</Button>
          </>
        }
      />

      {loading || !data ? <LoadingBlock label="Building report…" /> : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            <StatCard icon={Calendar} label="Present Days" value={data.present_days} tone="success" />
            <StatCard icon={Calendar} label="Total Working Hours" value={`${data.total_hours}h`} tone="primary" />
            <StatCard icon={Calendar} label="Overtime Hours" value={`${data.total_ot}h`} tone="warning" />
            <StatCard icon={Calendar} label="Overtime Amount" value={`₹${data.overtime_amount.toLocaleString("en-IN")}`} tone="warning" />
            <StatCard icon={Calendar} label="Total Expenses" value={`₹${data.total_expense.toLocaleString("en-IN")}`} tone="danger" />
            <StatCard icon={Calendar} label="Monthly Salary" value={`₹${data.monthly_salary.toLocaleString("en-IN")}`} tone="primary" />
          </div>

          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 6px" }}>Export this report</h3>
            <p style={{ fontSize: 12.5, color: C.textMuted, margin: "0 0 16px" }}>Includes attendance, working hours, overtime, salary, and expense summaries.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="outline" icon={FileText} onClick={() => handleExport("pdf")}>Export PDF</Button>
              <Button variant="outline" icon={FileSpreadsheet} onClick={() => handleExport("excel")}>Export Excel</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
