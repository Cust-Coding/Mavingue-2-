import { apiGet, apiPatch, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Venda, VendaCreate, VendaStatusUpdate } from "./types";

export const salesApi = {
  list: () => apiGet<Venda[]>(endpoints.vendas),
  get: (id: number) => apiGet<Venda>(`${endpoints.vendas}/${id}`),
  create: (body: VendaCreate) => apiPost<Venda>(endpoints.vendas, body),
  updatePickupStatus: (id: number, body: VendaStatusUpdate) =>
    apiPatch<Venda>(`${endpoints.vendas}/${id}/levantamento`, body),
};
