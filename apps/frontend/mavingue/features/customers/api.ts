import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Customer, CustomerCreate, CustomerUpdate } from "./types";

export const customersApi = {
  list: () => apiGet<Customer[]>(`${endpoints.customer}/`),
  get: (id: number) => apiGet<Customer>(`${endpoints.customer}/${id}`),
  create: (body: CustomerCreate) => apiPost<Customer>(`${endpoints.customer}/`, body),
  update: (id: number, body: CustomerUpdate) => apiPut<Customer>(`${endpoints.customer}/${id}`, body),
  remove: (id: number) => apiDelete<void>(`${endpoints.customer}/${id}`),
};