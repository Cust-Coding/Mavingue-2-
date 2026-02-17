import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { StockItem, StockMovement, StockMovementCreate } from "./types";

const base = "/api/proxy";

export function listStock() {
  return http<StockItem[]>(`${base}${endpoints.stock.list}`);
}

export function listStockAlerts() {
  return http<StockItem[]>(`${base}${endpoints.stock.alerts}`);
}

export function listStockMovements() {
  return http<StockMovement[]>(`${base}${endpoints.stock.movements}`);
}

export function createStockMovement(payload: StockMovementCreate) {
  return http<StockMovement>(`${base}${endpoints.stock.createMovement}`, { method: "POST", body: payload });
}
