import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { UserCreateFullRequest, UserResponse, UserUpdateRequest } from "./types";

export async function listUsers(): Promise<UserResponse[]> {
  return apiGet<UserResponse[]>(endpoints.users);
}

export async function getUser(id: number): Promise<UserResponse> {
  return apiGet<UserResponse>(`${endpoints.users}/${id}`);
}

export async function createUser(payload: UserCreateFullRequest): Promise<UserResponse> {
  return apiPost<UserResponse>(endpoints.users, payload);
}

export async function updateUser(id: number, payload: UserUpdateRequest): Promise<UserResponse> {
  return apiPut<UserResponse>(`${endpoints.users}/${id}`, payload);
}

export async function deleteUser(id: number): Promise<void> {
  return apiDelete<void>(`${endpoints.users}/${id}`);
}
