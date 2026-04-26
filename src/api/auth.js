import { api } from "./client";

export const login = async (username, password) => {
  const res = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  localStorage.setItem("token", res.access_token);
  return res;
};