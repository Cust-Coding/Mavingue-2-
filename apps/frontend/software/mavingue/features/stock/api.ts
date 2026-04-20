import { apiGet, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { StockAdjust, StockItem, StockMovement } from "./types";

export const stockApi = {
  list: () => apiGet<StockItem[]>(endpoints.stock),
  byProduto: (produtoId: number) => apiGet<StockItem>(`${endpoints.stock}/produto/${produtoId}`),
  movements: () => apiGet<StockMovement[]>(endpoints.stockMovements),
  adjust: (body: StockAdjust) => apiPost<any>(endpoints.stockAdjust, body),
};
