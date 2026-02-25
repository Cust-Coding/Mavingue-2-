import { apiDelete, apiGet, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Ferragem, FerragemCreate } from "./types";

export const ferragemApi = {
  list: () => apiGet<Ferragem[]>(`${endpoints.ferragem}/`),
  create: (body: FerragemCreate) => apiPost<Ferragem>(`${endpoints.ferragem}/`, body),
  remove: (id: number) => apiDelete<void>(`${endpoints.ferragem}/${id}`),
};