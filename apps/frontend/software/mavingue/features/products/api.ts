import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Product, ProductCreate, ProductUpdate } from "./types";

export async function listProducts(params?: { search?: string; page?: number; size?: number }) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.page != null) q.set("page", String(params.page));
  if (params?.size != null) q.set("size", String(params.size));

  const url = `/api/proxy${endpoints.products.list}${q.toString() ? `?${q}` : ""}`;
  return http<{ items: Product[]; page: number; size: number; total: number }>(url);
}

export async function getProduct(id: string) {
  return http<Product>(`/api/proxy${endpoints.products.byId(id)}`);
}

export async function createProduct(payload: ProductCreate) {
  return http<Product>(`/api/proxy${endpoints.products.create}`, { method: "POST", body: payload });
}

export async function updateProduct(id: string, payload: ProductUpdate) {
  return http<Product>(`/api/proxy${endpoints.products.update(id)}`, { method: "PUT", body: payload });
}

export async function deleteProduct(id: string) {
  return http<{ ok: true }>(`/api/proxy${endpoints.products.remove(id)}`, { method: "DELETE" });
}
