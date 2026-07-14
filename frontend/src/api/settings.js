import client from "./client";

export const getSettings = () => client.get("/settings").then((r) => r.data);
export const updateSettings = (payload) => client.put("/settings", payload).then((r) => r.data);
