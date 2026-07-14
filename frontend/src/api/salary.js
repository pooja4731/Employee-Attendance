import client from "./client";

export const getSalary = () => client.get("/salary").then((r) => r.data);
