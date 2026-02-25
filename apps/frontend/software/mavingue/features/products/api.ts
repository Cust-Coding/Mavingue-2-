import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Product, ProductCreate, ProductUpdate } from "./types";

export const productsApi = {
  list: () => apiGet<Product[]>(endpoints.products),
  get: (id: number) => apiGet<Product>(`${endpoints.products}/${id}`),
  create: (body: ProductCreate) => apiPost<Product>(endpoints.products, body),
  update: (id: number, body: ProductUpdate) => apiPut<Product>(`${endpoints.products}/${id}`, body),
  remove: (id: number) => apiDelete<void>(`${endpoints.products}/${id}`),
};