import { apiGet, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Venda, VendaCreate } from "./types";

export const salesApi = {
  list: () => apiGet<Venda[]>(endpoints.vendas),
  get: (id: number) => apiGet<Venda>(`${endpoints.vendas}/${id}`),
  create: (body: VendaCreate) => apiPost<Venda>(endpoints.vendas, body),
};
