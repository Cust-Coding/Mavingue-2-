import { apiGet } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { AuditLog } from "./types";

type AuditFilters = {
  action?: string;
  actorScope?: string;
  actorRole?: string;
  query?: string;
};

export const auditApi = {
  list: (filters: AuditFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value);
      }
    });

    const query = params.toString();
    return apiGet<AuditLog[]>(query ? `${endpoints.auditoria}?${query}` : endpoints.auditoria);
  },
};
