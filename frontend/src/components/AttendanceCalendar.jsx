// import React, { useState } from "react";
// import { updateAttendanceType } from "../api/attendance";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";

// export default function AttendanceCalendar({ history, salaryCycleStartDay }) {
//   const [selectedDate, setSelectedDate] = useState(new Date());

//   const [attendanceType, setAttendanceType] = useState("Present");
//   const [leaveReason, setLeaveReason] = useState("");
//   const [showEditor, setShowEditor] = useState(false);

//   const getRecord = (date) => {
//     const d = date.toISOString().split("T")[0];
//     return history.find((r) => r.date === d);
//   };

//   const tileContent = ({ date, view }) => {
//     if (view !== "month") return null;

//     const record = getRecord(date);

//     if (!record) return null;

//     let color = "#22C55E";

//     switch (record.attendance_type) {
//       case "Leave":
//         color = "#FACC15";
//         break;

//       case "Holiday":
//         color = "#A855F7";
//         break;

//       case "Weekend Working":
//         color = "#3B82F6";
//         break;

//       case "Half Day":
//         color = "#FB923C";
//         break;

//       default:
//         if (record.status === "Absent") {
//           color = "#EF4444";
//         }
//     }

//     return (
//       <div
//         style={{
//           width: 8,
//           height: 8,
//           borderRadius: "50%",
//           background: color,
//           margin: "4px auto 0",
//         }}
//       />
//     );
//   };

//   const summary = React.useMemo(() => {
//     const present = history.filter((r) => r.status === "Present").length;

//     const absent = history.filter((r) => r.status === "Absent").length;

//     const manual = history.filter(
//       (r) => r.work_note && r.work_note.toLowerCase().includes("manual"),
//     ).length;

//     const workingHours = history.reduce(
//       (sum, r) => sum + (r.working_hours || 0),
//       0,
//     );

//     const overtime = history.reduce(
//       (sum, r) => sum + (r.overtime_hours || 0),
//       0,
//     );

//     return {
//       present,
//       absent,
//       manual,
//       workingHours,
//       overtime,
//     };
//   }, [history]);

//   const selected = getRecord(selectedDate) || {
//     date: selectedDate.toISOString().split("T")[0],
//     attendance_type: "Present",
//     leave_reason: "",
//     status: "-",
//     check_in: "-",
//     check_out: "-",
//     working_hours_display: "-",
//     work_note: "",
//   };
//   React.useEffect(() => {
//     if (selected) {
//       setAttendanceType(selected.attendance_type || "Present");
//       setLeaveReason(selected.leave_reason || "");
//     } else {
//       setAttendanceType("Present");
//       setLeaveReason("");
//     }
//   }, [selectedDate, selected]);

//   return (
//     <div
//       style={{
//         display: "flex",
//         gap: 25,
//         alignItems: "stretch",
//         marginTop: 20,
//       }}
//     >
//       {/* LEFT */}
//       <div
//         style={{
//           flex: 1.2,
//           background: "#fff",
//           borderRadius: 15,
//           padding: 20,
//           boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
//         }}
//       >
//         <h3
//           style={{
//             marginBottom: 20,
//             fontWeight: 700,
//             color: "#1E293B",
//           }}
//         >
//           📅 Attendance Calendar
//         </h3>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//           }}
//         >
//           <Calendar
//             value={selectedDate}
//             onChange={(date) => {
//               setSelectedDate(date);
//               setShowEditor(true);
//             }}
//             tileContent={tileContent}
//           />
//         </div>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             marginTop: 20,
//             fontSize: 14,
//             flexWrap: "wrap",
//           }}
//         >
//           <span>🟢 Present</span>
//           <span>🔴 Absent</span>
//           <span>🔵 Manual</span>
//           <span>🟡 Leave</span>
//         </div>
//       </div>

//       {/* RIGHT */}
//       <div
//         style={{
//           flex: 1,
//           background: "#fff",
//           borderRadius: 15,
//           padding: 25,
//           boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
//         }}
//       >
//         <h3
//           style={{
//             marginTop: 0,
//             marginBottom: 20,
//             color: "#1E293B",
//           }}
//         >
//           📊 Monthly Summary
//         </h3>

//         {salaryCycleStartDay && (
//           <div
//             style={{
//               background: "#EEF4FF",
//               padding: 15,
//               borderRadius: 10,
//               marginBottom: 25,
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 13,
//                 color: "#666",
//               }}
//             >
//               Salary Cycle
//             </div>

//             <div
//               style={{
//                 fontSize: 18,
//                 fontWeight: "bold",
//                 color: "#2563EB",
//               }}
//             >
//               Every month from Day {salaryCycleStartDay}
//             </div>
//           </div>
//         )}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: 15,
//             marginBottom: 25,
//           }}
//         >
//           <div
//             style={{
//               background: "#ECFDF5",
//               padding: 15,
//               borderRadius: 10,
//             }}
//           >
//             <div style={{ color: "#16A34A", fontSize: 13 }}>Present</div>

//             <h2>{summary.present}</h2>
//           </div>

//           <div
//             style={{
//               background: "#FEF2F2",
//               padding: 15,
//               borderRadius: 10,
//             }}
//           >
//             <div style={{ color: "#DC2626", fontSize: 13 }}>Absent</div>

//             <h2>{summary.absent}</h2>
//           </div>

//           <div
//             style={{
//               background: "#EFF6FF",
//               padding: 15,
//               borderRadius: 10,
//             }}
//           >
//             <div style={{ color: "#2563EB", fontSize: 13 }}>Working Hours</div>

//             <h2>{summary.workingHours.toFixed(1)}h</h2>
//           </div>

//           <div
//             style={{
//               background: "#FFF7ED",
//               padding: 15,
//               borderRadius: 10,
//             }}
//           >
//             <div style={{ color: "#EA580C", fontSize: 13 }}>Overtime</div>

//             <h2>{summary.overtime.toFixed(1)}h</h2>
//           </div>
//         </div>

//         <hr />
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect, useMemo } from "react";
import { updateAttendanceType, listAttendance } from "../api/attendance";
import { Badge, Button, Field, statusTone } from "./ui";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Local (not UTC) YYYY-MM-DD formatting - date.toISOString() shifts the date
// backwards for IST/UTC+ timezones and was mismatching records to the wrong day.
function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// JS mirror of app/utils/salary_cycle.py get_salary_cycle - same rules,
// no hardcoded month lengths (uses Date's own day-in-month rollover).
function getSalaryCycle(refDate, startDay) {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const day = refDate.getDate();

  let startYear = year;
  let startMonth = month;
  if (day < startDay) {
    if (month === 0) {
      startYear = year - 1;
      startMonth = 11;
    } else {
      startMonth = month - 1;
    }
  }

  const daysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
  const actualStartDay = Math.min(startDay, daysInStartMonth);
  const cycleStart = new Date(startYear, startMonth, actualStartDay);

  let nextYear = startYear;
  let nextMonth = startMonth + 1;
  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear += 1;
  }
  const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
  const actualNextStartDay = Math.min(startDay, daysInNextMonth);
  const nextCycleStart = new Date(nextYear, nextMonth, actualNextStartDay);

  const cycleEnd = new Date(nextCycleStart);
  cycleEnd.setDate(cycleEnd.getDate() - 1);

  return { cycleStart, cycleEnd };
}

const DAY_TYPES = ["Present", "Leave", "Holiday", "Weekend Working", "Half Day", "Absent"];

const TYPE_COLORS = {
  Leave: "#FACC15",
  Holiday: "#A855F7",
  "Weekend Working": "#3B82F6",
  "Half Day": "#FB923C",
  Absent: "#EF4444",
  Present: "#22C55E",
};

export default function AttendanceCalendar({
  history,
  salaryCycleStartDay,
  monthlySalary,
  overtimeRate,
  onChanged,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEditor, setShowEditor] = useState(false);
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const [editType, setEditType] = useState("Present");
  const [editReason, setEditReason] = useState("");
  const [saving, setSaving] = useState(false);

  const [windowHistory, setWindowHistory] = useState([]);
  const [windowLoading, setWindowLoading] = useState(false);

  const effectiveStartDay = salaryCycleStartDay || 1;

  const { cycleStart, cycleEnd } = useMemo(
    () => getSalaryCycle(new Date(activeStartDate.getFullYear(), activeStartDate.getMonth(), 15), effectiveStartDay),
    [activeStartDate, effectiveStartDay],
  );

  // Refetch the attendance for the currently visible salary cycle whenever
  // the visible month or the cycle start day changes - no page refresh needed.
  useEffect(() => {
    let cancelled = false;
    setWindowLoading(true);
    listAttendance({ start_date: toDateStr(cycleStart), end_date: toDateStr(cycleEnd) })
      .then((data) => {
        if (!cancelled) setWindowHistory(data || []);
      })
      .catch(() => {
        if (!cancelled) setWindowHistory([]);
      })
      .finally(() => {
        if (!cancelled) setWindowLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cycleStart.getTime(), cycleEnd.getTime()]);

  // Merge the month-filtered history from the parent (fast, already loaded)
  // with the cycle-range fetch above (accurate across month boundaries).
  const records = useMemo(() => {
    const map = {};
    (history || []).forEach((r) => {
      map[r.date] = r;
    });
    (windowHistory || []).forEach((r) => {
      map[r.date] = r;
    });
    return map;
  }, [history, windowHistory]);

  const getRecord = (date) => records[toDateStr(date)];

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const record = getRecord(date);
    if (!record) return null;

    let color = TYPE_COLORS[record.attendance_type] || "#22C55E";
    if (!TYPE_COLORS[record.attendance_type] && record.status === "Absent") {
      color = "#EF4444";
    }

    return (
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          margin: "4px auto 0",
        }}
      />
    );
  };

  const cycleDays = useMemo(
    () => Math.round((cycleEnd - cycleStart) / 86400000) + 1,
    [cycleStart, cycleEnd],
  );

  // Cycle-scoped summary (Feature 4) - recalculates whenever windowHistory
  // (i.e. the visible salary cycle) changes.
  const summary = useMemo(() => {
    const counts = {
      Present: 0,
      Absent: 0,
      Leave: 0,
      Holiday: 0,
      "Weekend Working": 0,
      "Half Day": 0,
    };
    let workingHours = 0;
    let overtime = 0;

    windowHistory.forEach((r) => {
      const type = counts.hasOwnProperty(r.attendance_type) ? r.attendance_type : r.status;
      if (counts.hasOwnProperty(type)) counts[type] += 1;
      workingHours += r.working_hours || 0;
      overtime += r.overtime_hours || 0;
    });

    const workingDays = cycleDays - counts.Holiday;
    const overtimeAmount = overtime * (overtimeRate || 0);
    const estimatedSalary = monthlySalary ? monthlySalary + overtimeAmount : null;

    return { ...counts, workingHours, overtime, workingDays, estimatedSalary };
  }, [windowHistory, cycleDays, overtimeRate, monthlySalary]);

  const isFuture = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d > today;
  };

  const selected = getRecord(selectedDate);
  const future = isFuture(selectedDate);

  useEffect(() => {
    if (selected) {
      setEditType(selected.attendance_type || "Present");
      setEditReason(selected.leave_reason || "");
    } else {
      setEditType("Present");
      setEditReason("");
    }
  }, [selectedDate, selected]);

  const handleSaveType = async () => {
    setSaving(true);
    try {
      await updateAttendanceType({
        date: toDateStr(selectedDate),
        attendance_type: editType,
        leave_reason: editReason,
      });
      // Refresh this cycle's window immediately (no page reload)
      const data = await listAttendance({
        start_date: toDateStr(cycleStart),
        end_date: toDateStr(cycleEnd),
      });
      setWindowHistory(data || []);
      onChanged?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Click-to-view / edit card - shown above the calendar (Feature 2 & 3) */}
      {showEditor && (
        <div
          style={{
            background: "#fff",
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ margin: 0, color: "#1E293B" }}>{toDateStr(selectedDate)}</h4>
            <Badge tone={future ? "primary" : statusTone(selected?.status || "Absent")}>
              {future
                ? selected
                  ? selected.attendance_type
                  : "Working Day"
                : selected
                ? selected.attendance_type || selected.status
                : "Absent"}
            </Badge>
          </div>

          {!future && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12,
                marginBottom: 16,
                fontSize: 13.5,
              }}
            >
              <div>
                <div style={{ color: "#94A3B8" }}>Check In</div>
                <div style={{ fontWeight: 600 }}>{selected?.check_in || "—"}</div>
              </div>
              <div>
                <div style={{ color: "#94A3B8" }}>Check Out</div>
                <div style={{ fontWeight: 600 }}>{selected?.check_out || "—"}</div>
              </div>
              <div>
                <div style={{ color: "#94A3B8" }}>Working Hours</div>
                <div style={{ fontWeight: 600 }}>{selected?.working_hours_display || "0h 00m"}</div>
              </div>
              <div>
                <div style={{ color: "#94A3B8" }}>OT Hours</div>
                <div style={{ fontWeight: 600 }}>{selected?.overtime_display || "0h 00m"}</div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ color: "#94A3B8" }}>Work Note</div>
                <div style={{ fontWeight: 600 }}>{selected?.work_note || "—"}</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ minWidth: 180 }}>
              <label style={{ fontSize: 12.5, color: "#64748B", display: "block", marginBottom: 6 }}>
                Mark as
              </label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                }}
              >
                {DAY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ minWidth: 220, flex: 1 }}>
              <Field
                label="Reason (optional)"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="e.g. Sick leave, Diwali, client escalation…"
              />
            </div>
            <Button onClick={handleSaveType} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 25, alignItems: "stretch", marginTop: 20, flexWrap: "wrap" }}>
        {/* LEFT */}
        <div
          style={{
            flex: 1.2,
            minWidth: 300,
            background: "#fff",
            borderRadius: 15,
            padding: 20,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ marginBottom: 20, fontWeight: 700, color: "#1E293B" }}>📅 Attendance Calendar</h3>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Calendar
              value={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setShowEditor(true);
              }}
              onActiveStartDateChange={({ activeStartDate: d }) => d && setActiveStartDate(d)}
              tileContent={tileContent}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 14, flexWrap: "wrap" }}>
            <span>🟢 Present</span>
            <span>🔴 Absent</span>
            <span>🟡 Leave</span>
            <span>🟣 Holiday</span>
            <span>🔵 Weekend Working</span>
            <span>🟠 Half Day</span>
          </div>
        </div>

        {/* RIGHT */}
        <div
          style={{
            flex: 1,
            minWidth: 280,
            background: "#fff",
            borderRadius: 15,
            padding: 25,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1E293B" }}>
            📊 Cycle Summary {windowLoading && <span style={{ fontSize: 12, color: "#94A3B8" }}>(updating…)</span>}
          </h3>

          <div style={{ background: "#EEF4FF", padding: 15, borderRadius: 10, marginBottom: 25 }}>
            <div style={{ fontSize: 13, color: "#666" }}>Salary Cycle</div>
            <div style={{ fontSize: 16, fontWeight: "bold", color: "#2563EB" }}>
              {toDateStr(cycleStart)} → {toDateStr(cycleEnd)}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
            <SummaryStat label="Present" value={summary.Present} color="#16A34A" bg="#ECFDF5" />
            <SummaryStat label="Absent" value={summary.Absent} color="#DC2626" bg="#FEF2F2" />
            <SummaryStat label="Leave" value={summary.Leave} color="#CA8A04" bg="#FEFCE8" />
            <SummaryStat label="Holiday" value={summary.Holiday} color="#7E22CE" bg="#FAF5FF" />
            <SummaryStat label="Weekend Working" value={summary["Weekend Working"]} color="#2563EB" bg="#EFF6FF" />
            <SummaryStat label="Half Day" value={summary["Half Day"]} color="#EA580C" bg="#FFF7ED" />
            <SummaryStat label="Working Hours" value={`${summary.workingHours.toFixed(1)}h`} color="#2563EB" bg="#EFF6FF" />
            <SummaryStat label="OT Hours" value={`${summary.overtime.toFixed(1)}h`} color="#EA580C" bg="#FFF7ED" />
          </div>

          <div style={{ fontSize: 13.5, color: "#475569", marginBottom: 8 }}>
            Working Days in Cycle: <b>{summary.workingDays}</b> / {cycleDays}
          </div>

          {summary.estimatedSalary != null && (
            <div style={{ background: "#ECFDF5", padding: 15, borderRadius: 10, marginTop: 10 }}>
              <div style={{ color: "#16A34A", fontSize: 13 }}>Estimated Salary (this cycle)</div>
              <h2 style={{ margin: "4px 0 0" }}>₹{summary.estimatedSalary.toLocaleString("en-IN")}</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, color, bg }) {
  return (
    <div style={{ background: bg, padding: 15, borderRadius: 10 }}>
      <div style={{ color, fontSize: 13 }}>{label}</div>
      <h2 style={{ margin: "4px 0 0" }}>{value}</h2>
    </div>
  );
}