import { apiClient } from "../client";
import type { LoginResponse } from "../types/auth.types";

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<LoginResponse>("/auth", { username, password }),
};
