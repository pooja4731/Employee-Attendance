import { useOutletContext } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import {
  FileText,
  FileSpreadsheet,
  Timer,
  ClipboardList,
  CheckCircle2,
  LogOut,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Card,
  PageHeader,
  StatCard,
  Badge,
  statusTone,
  Th,
  Td,
  Button,
  Field,
  LoadingBlock,
  Modal,
  C,
} from "../components/ui";
import {
  getToday,
  checkIn,
  checkOut,
  listAttendance,
  addManualAttendance,
  deleteAttendance,
} from "../api/attendance";
import { downloadExport } from "../api/reports";

function useLiveTimer(checkInIso, active) {
  const [elapsed, setElapsed] = useState("0h 00m 00s");
  useEffect(() => {
    if (!active || !checkInIso) return;
    const tick = () => {
      const diff = Date.now() - new Date(checkInIso).getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [checkInIso, active]);
  return elapsed;
}

export default function AttendancePage() {
  const { notify } = useOutletContext();
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [workNote, setWorkNote] = useState("");
  const [month, setMonth] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [showManual, setShowManual] = useState(false);

  const [manual, setManual] = useState({
    date: "",
    check_in: "",
    check_out: "",
    work_note: "",
  });

  const isActive = today && today.check_in && !today.check_out;
  const liveTimer = useLiveTimer(today?.check_in_iso, isActive);

  const load = async () => {
    setLoading(true);
    try {
      const [t, h] = await Promise.all([
        getToday(),
        listAttendance(month || undefined),
      ]);
      setToday(t);
      setHistory(h);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [month]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    setBusy(true);
    try {
      await checkIn(workNote);
      notify?.("Checked in successfully");
      setWorkNote("");
      await load();
    } catch (e) {
      notify?.(e?.response?.data?.detail || "Check-in failed");
    } finally {
      setBusy(false);
    }
  };

  const handleCheckOut = async () => {
    setBusy(true);
    try {
      await checkOut(workNote);
      notify?.("Checked out successfully");
      setWorkNote("");
      await load();
    } catch (e) {
      notify?.(e?.response?.data?.detail || "Check-out failed");
    } finally {
      setBusy(false);
    }
  };

  const handleManualSave = async () => {
    try {
      await addManualAttendance(manual);

      notify?.("Attendance Added Successfully");

      setShowManual(false);

      setManual({
        date: "",
        check_in: "",
        check_out: "",
        work_note: "",
      });

      load();
    } catch (e) {
      notify?.(e?.response?.data?.detail || "Failed");
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (!window.confirm("Delete this attendance?")) return;

    try {
      await deleteAttendance(id);

      notify?.("Attendance Deleted");

      load();
    } catch {
      notify?.("Delete Failed");
    }
  };

  const totalWorkingDays = useMemo(
    () => history.filter((a) => a.status !== "Absent").length,
    [history],
  );
  const totalOT = useMemo(() => {
    const totalHours = history.reduce((s, a) => s + (a.overtime_hours || 0), 0);
    const h = Math.floor(totalHours);
    const m = Math.round((totalHours - h) * 60);
    return `${h}h ${String(m).padStart(2, "0")}m`;
  }, [history]);

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Your daily check-in and check-out history."
        actions={
          <>
            <Button onClick={() => setShowManual(true)}>
              + Add Attendance
            </Button>

            <Button
              variant="outline"
              icon={FileText}
              onClick={() => downloadExport("monthly", "pdf")}
            >
              Export PDF
            </Button>

            <Button
              variant="outline"
              icon={FileSpreadsheet}
              onClick={() => downloadExport("monthly", "excel")}
            >
              Export Excel
            </Button>
          </>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "600",
          }}
        >
          <div>Date : {currentTime.toLocaleDateString("en-IN")}</div>

          <div>Time : {currentTime.toLocaleTimeString("en-IN")}</div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        {!today || !today.check_in ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p style={{ fontSize: 14, color: C.textMuted, margin: "0 0 16px" }}>
              You haven't checked in today.
            </p>
            <div style={{ maxWidth: 360, margin: "0 auto 16px" }}>
              <Field
                label="Today's Work (optional)"
                value={workNote}
                onChange={(e) => setWorkNote(e.target.value)}
                placeholder="e.g. Fixed website bugs"
              />
            </div>
            <Button
              size="lg"
              icon={CheckCircle2}
              onClick={handleCheckIn}
              disabled={busy}
            >
              {busy ? "Checking in…" : "Check In"}
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 12.5,
                  color: C.textMuted,
                  margin: "0 0 4px",
                }}
              >
                Check In Time
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.text,
                  margin: 0,
                }}
              >
                {today.check_in}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 12.5,
                  color: C.textMuted,
                  margin: "0 0 4px",
                }}
              >
                {isActive ? "Live Working Timer" : "Total Working Hours"}
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.primary,
                  margin: 0,
                }}
              >
                {isActive ? liveTimer : today.working_hours_display}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: 12.5,
                  color: C.textMuted,
                  margin: "0 0 4px",
                }}
              >
                Current Status
              </p>
              <Badge tone={isActive ? "warning" : statusTone(today.status)}>
                {isActive ? "In Progress" : today.status}
              </Badge>
            </div>
            {isActive ? (
              <div style={{ minWidth: 260 }}>
                <Field
                  label="Today's Work"
                  value={workNote}
                  onChange={(e) => setWorkNote(e.target.value)}
                  placeholder="e.g. Client meeting"
                />
                <Button
                  icon={LogOut}
                  variant="danger"
                  onClick={handleCheckOut}
                  disabled={busy}
                >
                  {busy ? "Checking out…" : "Check Out"}
                </Button>
              </div>
            ) : (
              <div>
                <p
                  style={{
                    fontSize: 12.5,
                    color: C.textMuted,
                    margin: "0 0 4px",
                  }}
                >
                  Check Out Time
                </p>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: C.text,
                    margin: 0,
                  }}
                >
                  {today.check_out}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      <div
        style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}
      >
        <StatCard
          icon={ClipboardList}
          label="Total Working Days"
          value={totalWorkingDays}
          tone="primary"
        />
        <StatCard
          icon={Timer}
          label="Total Overtime Hours"
          value={totalOT}
          tone="warning"
        />
      </div>

      <div style={{ marginBottom: 12, maxWidth: 220 }}>
        <Field
          label="Filter by month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingBlock />
      ) : (
        <Card padded={false}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Check In</Th>
                  <Th>Check Out</Th>
                  <Th>Working Hours</Th>
                  <Th>Overtime</Th>
                  <Th align="center">Status</Th>
                  <Th>Today's Work</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id}>
                    <Td>{r.date}</Td>
                    <Td muted>{r.check_in || "—"}</Td>
                    <Td muted>{r.check_out || "—"}</Td>
                    <Td>{r.working_hours_display}</Td>
                    <Td>{r.overtime_display}</Td>
                    <Td align="center">
                      <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                    </Td>
                    <Td muted>{r.work_note || "—"}</Td>
                    <Td>
                      <button
                        onClick={() => handleDeleteAttendance(r.id)}
                        style={{
                          background: "#FEE2E2",
                          border: "none",
                          padding: 6,
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={16} color="red" />
                      </button>
                    </Td>
                  </tr>
                ))}
                {!history.length && (
                  <tr>
                    <Td muted colSpan={7}>
                      No attendance records for this period
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={showManual}
        onClose={() => setShowManual(false)}
        title="Manual Attendance"
      >
        <Field
          label="Date"
          type="date"
          value={manual.date}
          onChange={(e) => setManual({ ...manual, date: e.target.value })}
        />

        <Field
          label="Check In"
          type="time"
          value={manual.check_in}
          onChange={(e) => setManual({ ...manual, check_in: e.target.value })}
        />

        <Field
          label="Check Out"
          type="time"
          value={manual.check_out}
          onChange={(e) => setManual({ ...manual, check_out: e.target.value })}
        />

        <Field
          label="Work Note"
          value={manual.work_note}
          onChange={(e) => setManual({ ...manual, work_note: e.target.value })}
        />

        <Button full onClick={handleManualSave}>
          Save Attendance
        </Button>
      </Modal>
    </div>
  );
}
