import client from "./client";

export const listExpenses = (month) =>
  client.get("/expenses", { params: month ? { month } : {} }).then((r) => r.data);
export const createExpense = (payload) => client.post("/expenses", payload).then((r) => r.data);
export const updateExpense = (id, payload) => client.put(`/expenses/${id}`, payload).then((r) => r.data);
export const deleteExpense = (id) => client.delete(`/expenses/${id}`);
