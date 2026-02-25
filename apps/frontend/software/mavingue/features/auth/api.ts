import { apiGet, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { LoginRequest, LoginResponse } from "./types";

export const authApi = {
  login: (body: LoginRequest) => apiPost<LoginResponse>(endpoints.auth.login, body),
  me: () => apiGet<any>(endpoints.auth.me),
};