import { apiGet, apiPost, apiPut } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { ProductCategory, ProductCategoryCreate, ProductCategoryUpdate } from "./types";

export const categoriesApi = {
  list: () => apiGet<ProductCategory[]>(endpoints.productCategories),
  create: (body: ProductCategoryCreate) => apiPost<ProductCategory>(endpoints.productCategories, body),
  update: (id: number, body: ProductCategoryUpdate) => apiPut<ProductCategory>(`${endpoints.productCategories}/${id}`, body),
};
