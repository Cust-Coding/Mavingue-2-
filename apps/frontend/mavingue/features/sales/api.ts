import { apiGet, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { VendaCreate } from "./types";

export const salesApi = {
  list: () => apiGet<any[]>(endpoints.vendas),
  get: (id: number) => apiGet<any>(`${endpoints.vendas}/${id}`),
  create: (body: VendaCreate) => apiPost<any>(endpoints.vendas, body),
};