import client from "./client";

export const listNotes = (search) =>
  client.get("/notes", { params: search ? { search } : {} }).then((r) => r.data);
export const createNote = (payload) => client.post("/notes", payload).then((r) => r.data);
export const updateNote = (id, payload) => client.put(`/notes/${id}`, payload).then((r) => r.data);
export const deleteNote = (id) => client.delete(`/notes/${id}`);
