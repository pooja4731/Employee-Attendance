import client from "./client";

export const getToday = () => client.get("/attendance/today").then((r) => r.data);
export const checkIn = (workNote, checkIn) =>
  client.post("/attendance/checkin", {
    work_note: workNote,
    check_in: checkIn || null,
  }).then((r) => r.data);
export const checkOut = (workNote, checkOut) =>
  client.post("/attendance/checkout", {
    work_note: workNote,
    check_out: checkOut || null,
  }).then((r) => r.data);

// `monthOrRange` can be:
//   - undefined                         -> no filter
//   - "2026-08"                         -> existing month filter (unchanged)
//   - { start_date, end_date }          -> new: date-range filter, used for
//                                          salary-cycle windows that cross
//                                          calendar months (e.g. 5 Aug - 4 Sep)
export const listAttendance = (monthOrRange) => {
  let params = {};
  if (typeof monthOrRange === "string") {
    params = { month: monthOrRange };
  } else if (monthOrRange && typeof monthOrRange === "object") {
    params = monthOrRange;
  }
  return client.get("/attendance", { params }).then((r) => r.data);
};

export const addManualAttendance = async (data) => {
  const res = await client.post("/attendance/manual", data);
  return res.data;
};
export const deleteAttendance = async (id) => {
  const res = await client.delete(`/attendance/${id}`);
  return res.data;
};

export const updateAttendanceType = async (data) => {
  const res = await client.post("/attendance/type", data);
  return res.data;
};