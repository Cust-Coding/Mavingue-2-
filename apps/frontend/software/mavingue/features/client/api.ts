import { apiGet, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { ClientCheckoutRequest, ClientOrder, ClientProfile } from "./types";

export const clientApi = {
  profile: () => apiGet<ClientProfile>(endpoints.clientArea.profile),
  listOrders: () => apiGet<ClientOrder[]>(endpoints.clientArea.compras),
  getOrder: (id: number) => apiGet<ClientOrder>(endpoints.clientArea.compraById(id)),
  checkout: (payload: ClientCheckoutRequest) =>
    apiPost<ClientOrder[]>(endpoints.clientArea.checkout, payload),
};
