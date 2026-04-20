import { apiGet } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { ClientOrder, ClientProfile } from "./types";

export const clientApi = {
  profile: () => apiGet<ClientProfile>(endpoints.clientArea.profile),
  listOrders: () => apiGet<ClientOrder[]>(endpoints.clientArea.compras),
  getOrder: (id: number) => apiGet<ClientOrder>(endpoints.clientArea.compraById(id)),
};
