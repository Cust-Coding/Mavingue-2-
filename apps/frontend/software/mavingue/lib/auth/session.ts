import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";

export type Role = "ADMIN" | "STAFF" | "CLIENTE";

export type MeResponse = {
  id: string;
  nome: string;
  role: Role;
  permissions: string[];
};

export async function getMe(): Promise<MeResponse> {
  // via proxy (Next -> Spring)
  return http<MeResponse>(`/api/proxy${endpoints.auth.me}`);
}
