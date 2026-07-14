import { useOutletContext } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, Pencil, Trash2, Receipt } from "lucide-react";
import { Card, PageHeader, Button, Field, Modal, Badge, Th, Td, StatCard, LoadingBlock, C, PIE_COLORS } from "../components/ui";
import { listExpenses, createExpense, updateExpense, deleteExpense } from "../api/expenses";

const CATEGORIES = ["Food", "Transport", "Utilities", "Rent", "Entertainment", "Others"];
const emptyForm = { date: new Date().toISOString().slice(0, 10), category: "Food", description: "", amount: "" };

export default function ExpensesPage() {
  const { notify } = useOutletContext();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listExpenses();
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (e) => {
    setEditing(e);
    setForm({ date: e.date, category: e.category, description: e.description, amount: String(e.amount) });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount || 0) };
      if (editing) {
        await updateExpense(editing.id, payload);
        notify?.("Expense updated");
      } else {
        await createExpense(payload);
        notify?.("Expense added");
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      notify?.(e?.response?.data?.detail || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      notify?.("Expense deleted");
      await load();
    } catch {
      notify?.("Failed to delete expense");
    }
  };

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const pieData = useMemo(() => CATEGORIES.map((cat) => ({
    name: cat, value: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((d) => d.value > 0), [expenses]);

  return (
    <div>
      <PageHeader
        title="Monthly Expenses"
        subtitle="Track and manage your personal spending."
        actions={<Button icon={Plus} onClick={openAdd}>Add Expense</Button>}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <StatCard icon={Receipt} label="Total Expenses" value={`₹${total.toLocaleString("en-IN")}`} tone="danger" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16, marginBottom: 16 }} className="two-col">
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>Expense by Category</h3>
          <div style={{ width: "100%", height: 240 }}>
            {pieData.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5 }} />
                  <Legend wrapperStyle={{ fontSize: 11.5 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: C.textMuted, fontSize: 13, textAlign: "center", paddingTop: 80 }}>No expenses yet</p>}
          </div>
        </Card>

        <Card padded={false}>
          <div style={{ padding: "18px 20px 4px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>All Expenses</h3>
          </div>
          {loading ? <LoadingBlock /> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><Th>Date</Th><Th>Category</Th><Th>Description</Th><Th align="right">Amount</Th><Th align="center">Actions</Th></tr></thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <Td>{e.date}</Td>
                      <Td><Badge tone="primary">{e.category}</Badge></Td>
                      <Td muted>{e.description}</Td>
                      <Td align="right">₹{e.amount.toLocaleString("en-IN")}</Td>
                      <Td align="center">
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button onClick={() => openEdit(e)} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}><Pencil size={14} color={C.text} /></button>
                          <button onClick={() => handleDelete(e.id)} style={{ background: C.dangerSoft, border: "none", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}><Trash2 size={14} color={C.danger} /></button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                  {!expenses.length && <tr><Td muted colSpan={5}>No expenses recorded yet</Td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Expense" : "Add Expense"}>
        <Field label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: "block" }}>Category</span>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="focus-ring" style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 12px", fontSize: 14, background: "#fff" }}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <Field label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Team lunch" />
        <Field label="Amount (₹)" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" />
        <Button full onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editing ? "Save Changes" : "Add Expense"}</Button>
      </Modal>
    </div>
  );
}
