import { apiClient } from "../client";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),

  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post("/auth/register", data),
};
