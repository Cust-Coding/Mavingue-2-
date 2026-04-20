import { apiGet, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { FacturaCompra, FacturaCompraCreate } from "./types";

export const purchasesApi = {
  list: () => apiGet<FacturaCompra[]>(endpoints.compras),
  get: (id: number) => apiGet<FacturaCompra>(`${endpoints.compras}/${id}`),
  create: (body: FacturaCompraCreate) => apiPost<FacturaCompra>(endpoints.compras, body),
};
