import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type {
  PermissionDefinition,
  UserCreateFullRequest,
  UserResponse,
  UserStatus,
  UserUpdateRequest,
} from "./types";

export async function listUsers(): Promise<UserResponse[]> {
  return apiGet<UserResponse[]>(endpoints.users);
}

export async function listPendingUsers(): Promise<UserResponse[]> {
  return apiGet<UserResponse[]>(`${endpoints.users}/pending`);
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

export async function updateUserStatus(id: number, status: UserStatus): Promise<UserResponse> {
  return apiPatch<UserResponse>(`${endpoints.users}/${id}/status`, { status });
}

export async function resetUserPassword(id: number, newPassword?: string): Promise<UserResponse> {
  return apiPost<UserResponse>(`${endpoints.users}/${id}/reset-password`, newPassword ? { newPassword } : {});
}

export async function listPermissionCatalog(): Promise<PermissionDefinition[]> {
  return apiGet<PermissionDefinition[]>(`${endpoints.users}/permissions/catalog`);
}

export async function getUserPermissions(id: number): Promise<string[]> {
  return apiGet<string[]>(`${endpoints.users}/${id}/permissions`);
}

export async function updateUserPermissions(id: number, permissions: string[]): Promise<UserResponse> {
  return apiPut<UserResponse>(`${endpoints.users}/${id}/permissions`, { permissions });
}

export async function deleteUser(id: number): Promise<void> {
  return apiDelete<void>(`${endpoints.users}/${id}`);
}
