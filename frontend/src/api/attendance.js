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
export const listAttendance = (month) =>
  client.get("/attendance", { params: month ? { month } : {} }).then((r) => r.data);
export const addManualAttendance = async (data) => {
  const res = await client.post("/attendance/manual", data);
  return res.data;
};
export const deleteAttendance = async (id) => {
  const res = await client.delete(`/attendance/${id}`);
  return res.data;
};