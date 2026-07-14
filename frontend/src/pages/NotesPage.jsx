import { useOutletContext } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, StickyNote } from "lucide-react";
import { Card, PageHeader, Button, Field, Modal, LoadingBlock, C } from "../components/ui";
import { listNotes, createNote, updateNote, deleteNote } from "../api/notes";

const emptyForm = { title: "", description: "" };

export default function NotesPage() {
  const { notify } = useOutletContext();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async (q) => {
    setLoading(true);
    try {
      const data = await listNotes(q || undefined);
      setNotes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (n) => { setEditing(n); setForm({ title: n.title, description: n.description }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateNote(editing.id, form);
        notify?.("Note updated");
      } else {
        await createNote(form);
        notify?.("Note added");
      }
      setModalOpen(false);
      await load(search);
    } catch {
      notify?.("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      notify?.("Note deleted");
      await load(search);
    } catch {
      notify?.("Failed to delete note");
    }
  };

  return (
    <div>
      <PageHeader
        title="Notes"
        subtitle="Quick notes and reminders, saved automatically."
        actions={<Button icon={Plus} onClick={openAdd}>Add Note</Button>}
      />

      <div style={{ maxWidth: 340, marginBottom: 18 }}>
        <Field label="Search notes" icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or description…" />
      </div>

      {loading ? <LoadingBlock /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {notes.map((n) => (
            <Card key={n.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>{n.title}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => openEdit(n)} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, padding: 5, cursor: "pointer", display: "flex" }}><Pencil size={13} color={C.text} /></button>
                  <button onClick={() => handleDelete(n.id)} style={{ background: C.dangerSoft, border: "none", borderRadius: 8, padding: 5, cursor: "pointer", display: "flex" }}><Trash2 size={13} color={C.danger} /></button>
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: C.textMuted, margin: "0 0 10px", lineHeight: 1.5 }}>{n.description}</p>
              <p style={{ fontSize: 11.5, color: C.textFaint, margin: 0 }}>{n.date}</p>
            </Card>
          ))}
          {!notes.length && (
            <Card style={{ gridColumn: "1 / -1", textAlign: "center", color: C.textMuted }}>
              <StickyNote size={24} color={C.textFaint} style={{ margin: "0 auto 8px" }} />
              No notes found
            </Card>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Note" : "Add Note"}>
        <Field label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Client call follow-up" />
        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6, display: "block" }}>Description</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            className="focus-ring"
            style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
            placeholder="Details…"
          />
        </label>
        <Button full onClick={handleSave} disabled={saving || !form.title}>{saving ? "Saving…" : editing ? "Save Changes" : "Add Note"}</Button>
      </Modal>
    </div>
  );
}
