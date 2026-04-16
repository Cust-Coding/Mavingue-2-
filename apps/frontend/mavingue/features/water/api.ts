import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { WaterBill, WaterContract, WaterCustomer, WaterPaymentCreate, WaterReading } from "./types";

const base = "/api/proxy";

export const listWaterCustomers = () => http<WaterCustomer[]>(`${base}${endpoints.water.customers}`);
export const listWaterContracts = () => http<WaterContract[]>(`${base}${endpoints.water.contracts}`);
export const listWaterReadings = () => http<WaterReading[]>(`${base}${endpoints.water.readings}`);
export const listWaterBills = () => http<WaterBill[]>(`${base}${endpoints.water.bills}`);
export const getWaterBill = (id: string) => http<WaterBill>(`${base}${endpoints.water.billById(id)}`);

export const createWaterPayment = (payload: WaterPaymentCreate) =>
  http<{ ok: true }>(`${base}${endpoints.water.payments}`, { method: "POST", body: payload });
