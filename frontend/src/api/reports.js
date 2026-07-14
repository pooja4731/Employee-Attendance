import client from "./client";

export const getWeeklyReport = () => client.get("/reports/weekly").then((r) => r.data);
export const getMonthlyReport = () => client.get("/reports/monthly").then((r) => r.data);

export const downloadExport = async (period, format) => {
  const res = await client.get(`/reports/export/${format}`, { params: { period }, responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${period}_report.${format === "pdf" ? "pdf" : "xlsx"}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
