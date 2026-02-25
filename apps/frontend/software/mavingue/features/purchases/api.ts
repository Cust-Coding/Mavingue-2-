import { apiGet, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { FacturaCompraCreate } from "./types";

export const purchasesApi = {
  list: () => apiGet<any[]>(endpoints.compras),
  get: (id: number) => apiGet<any>(`${endpoints.compras}/${id}`),
  create: (body: FacturaCompraCreate) => apiPost<any>(endpoints.compras, body),
};