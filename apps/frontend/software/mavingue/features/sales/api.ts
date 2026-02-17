import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { Sale, SaleCreate } from "./types";

const base = "/api/proxy";

export function listSales() {
  return http<Sale[]>(`${base}${endpoints.sales.list}`);
}

export function getSale(id: string) {
  return http<Sale>(`${base}${endpoints.sales.byId(id)}`);
}

export function createSale(payload: SaleCreate) {
  return http<Sale>(`${base}${endpoints.sales.create}`, { method: "POST", body: payload });
}

export function getSaleInvoice(id: string) {
  return http<Record<string, unknown>>(`${base}${endpoints.sales.invoice(id)}`);
}
