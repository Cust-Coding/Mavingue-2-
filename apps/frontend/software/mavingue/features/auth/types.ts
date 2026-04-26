export type Role = "ADMIN" | "STAFF" | "FUNCIONARIO" | "CLIENTE";
export type LoginRequest = { identifier: string; password: string };
export type LoginResponse = { token: string };
