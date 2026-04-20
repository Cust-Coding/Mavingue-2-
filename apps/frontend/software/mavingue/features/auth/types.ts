export type Role = "ADMIN" | "STAFF" | "FUNCIONARIO" | "CLIENTE";
export type LoginRequest = { username: string; password: string };
export type LoginResponse = { token: string; role: Role };
