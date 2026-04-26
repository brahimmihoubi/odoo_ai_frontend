import { api } from "./client";

export const getCRM = () => api("/crm/");

export const createLead = (data) =>
  api("/crm/", {
    method: "POST",
    body: JSON.stringify(data),
  });