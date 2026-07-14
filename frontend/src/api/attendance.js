import client from "./client";

export const getToday = () => client.get("/attendance/today").then((r) => r.data);
export const checkIn = (workNote) => client.post("/attendance/checkin", { work_note: workNote }).then((r) => r.data);
export const checkOut = (workNote) => client.post("/attendance/checkout", { work_note: workNote }).then((r) => r.data);
export const listAttendance = (month) =>
  client.get("/attendance", { params: month ? { month } : {} }).then((r) => r.data);
