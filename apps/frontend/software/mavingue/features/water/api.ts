import { apiGet, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { WaterBill, WaterContract, WaterCustomer, WaterPaymentCreate, WaterReading } from "./types";

const base = "/api/proxy";

export const listWaterCustomers = () => apiGet<WaterCustomer[]>(`${base}${endpoints.water.customers}`);
export const listWaterContracts = () => apiGet<WaterContract[]>(`${base}${endpoints.water.contracts}`);
export const listWaterReadings = () => apiGet<WaterReading[]>(`${base}${endpoints.water.readings}`);
export const listWaterBills = () => apiGet<WaterBill[]>(`${base}${endpoints.water.bills}`);
export const getWaterBill = (id: string) => apiGet<WaterBill>(`${base}${endpoints.water.billById(id)}`);

export const createWaterPayment = (payload: WaterPaymentCreate) =>
  apiPost<{ ok: true }>(`${base}${endpoints.water.payments}`, payload);
