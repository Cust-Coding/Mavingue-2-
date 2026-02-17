import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { User, UserUpsert } from "./types";

const base = "/api/proxy";

export function listUsers() {
  return http<User[]>(`${base}${endpoints.users.list}`);
}

export function getUser(id: string) {
  return http<User>(`${base}${endpoints.users.byId(id)}`);
}

export function createUser(payload: UserUpsert) {
  return http<User>(`${base}${endpoints.users.create}`, { method: "POST", body: payload });
}

export function updateUser(id: string, payload: UserUpsert) {
  return http<User>(`${base}${endpoints.users.update(id)}`, { method: "PUT", body: payload });
}

export function removeUser(id: string) {
  return http<{ ok: true }>(`${base}${endpoints.users.remove(id)}`, { method: "DELETE" });
}
