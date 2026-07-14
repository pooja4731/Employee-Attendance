import client from "./client";

export const registerUser = (payload) => client.post("/auth/register", payload).then((r) => r.data);

export const loginUser = (email, password) =>
  client.post("/auth/login-json", { email, password }).then((r) => r.data);

export const getProfile = () => client.get("/auth/profile").then((r) => r.data);

export const updateProfile = (payload) => client.put("/auth/profile", payload).then((r) => r.data);

export const changePassword = (payload) => client.put("/auth/change-password", payload).then((r) => r.data);
