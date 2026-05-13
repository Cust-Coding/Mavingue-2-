import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type {
  ClientAccount,
  ClientAccountUpdate,
  ClientCheckoutRequest,
  ClientCustomerUpdate,
  ClientOrder,
  ClientProfile,
} from "./types";
import type { Customer } from "@/features/customers/types";

export const clientApi = {
  profile: () => apiGet<ClientProfile>(endpoints.clientArea.profile),
  updateAccount: (payload: ClientAccountUpdate) =>
    apiPut<ClientAccount>(`${endpoints.clientArea.profile}/account`, payload),
  updateCustomer: (payload: ClientCustomerUpdate) =>
    apiPut<Customer>(`${endpoints.clientArea.profile}/customer`, payload),
  deactivateAccount: () => apiDelete<void>(endpoints.clientArea.deactivateAccount),
  listOrders: () => apiGet<ClientOrder[]>(endpoints.clientArea.compras),
  getOrder: (id: number) => apiGet<ClientOrder>(endpoints.clientArea.compraById(id)),
  checkout: (payload: ClientCheckoutRequest) =>
    apiPost<ClientOrder[]>(endpoints.clientArea.checkout, payload),
};
