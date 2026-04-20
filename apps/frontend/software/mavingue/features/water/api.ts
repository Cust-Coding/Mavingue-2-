import { apiGet, apiPatch } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type { WaterBill, WaterBillPaymentCreate, WaterContract, WaterCustomer, WaterReading } from "./types";

export const listWaterCustomers = () => apiGet<WaterCustomer[]>(endpoints.customerWater);
export const listWaterContracts = () => apiGet<WaterContract[]>(endpoints.ligacoesAgua);
export const listWaterReadings = (ligacaoId?: number) =>
  apiGet<WaterReading[]>(ligacaoId ? endpoints.leiturasAguaByLigacao(ligacaoId) : endpoints.leiturasAgua);
export const listWaterBills = () => apiGet<WaterBill[]>(endpoints.facturasAgua);
export const getWaterBill = (id: number) => apiGet<WaterBill>(endpoints.facturaAguaById(id));
export const payWaterBill = (id: number, payload: WaterBillPaymentCreate) =>
  apiPatch<WaterBill>(endpoints.facturaAguaPagamento(id), payload);

export const listClientWaterContracts = () => apiGet<WaterContract[]>(endpoints.clientArea.aguaLigacoes);
export const listClientWaterReadings = () => apiGet<WaterReading[]>(endpoints.clientArea.aguaLeituras);
export const listClientWaterBills = () => apiGet<WaterBill[]>(endpoints.clientArea.aguaFacturas);
export const payClientWaterBill = (id: number, payload: WaterBillPaymentCreate) =>
  apiPatch<WaterBill>(endpoints.clientArea.aguaFacturaPagamento(id), payload);
