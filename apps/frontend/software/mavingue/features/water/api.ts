import { apiGet, apiPatch, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import type {
  AddressItem,
  WaterBill,
  WaterBillPaymentCreate,
  WaterContract,
  WaterCustomer,
  WaterReading,
  WaterRequestCompletion,
  WaterRequestCreate,
  WaterRequestDecision,
} from "./types";

export const listWaterCustomers = () => apiGet<WaterCustomer[]>(endpoints.customerWater);
export const listPendingWaterCustomers = () => apiGet<WaterCustomer[]>(endpoints.customerWaterPending);
export const listWaterContracts = () => apiGet<WaterContract[]>(endpoints.ligacoesAgua);
export const listWaterReadings = (ligacaoId?: number) =>
  apiGet<WaterReading[]>(ligacaoId ? endpoints.leiturasAguaByLigacao(ligacaoId) : endpoints.leiturasAgua);
export const listWaterBills = () => apiGet<WaterBill[]>(endpoints.facturasAgua);
export const getWaterBill = (id: number) => apiGet<WaterBill>(endpoints.facturaAguaById(id));
export const payWaterBill = (id: number, payload: WaterBillPaymentCreate) =>
  apiPatch<WaterBill>(endpoints.facturaAguaPagamento(id), payload);
export const approveWaterRequest = (id: number, payload?: WaterRequestDecision) =>
  apiPatch<WaterCustomer>(endpoints.customerWaterApprove(id), payload ?? {});
export const rejectWaterRequest = (id: number, payload?: WaterRequestDecision) =>
  apiPatch<WaterCustomer>(endpoints.customerWaterReject(id), payload ?? {});
export const createWaterContract = (payload: { consumidorId: number }) =>
  apiPost<WaterContract>(endpoints.ligacoesAgua, payload);
export const updateWaterContractState = (id: number, payload: { estado: "ATIVA" | "CORTADA" }) =>
  apiPatch<WaterContract>(endpoints.ligacaoAguaEstado(id), payload);
export const createWaterReading = (payload: { ligacaoId: number; leituraActual: number; precoM3: number }) =>
  apiPost<WaterReading>(endpoints.leiturasAgua, payload);
export const listAddresses = () => apiGet<AddressItem[]>(`${endpoints.address}/`);

export const listClientWaterContracts = () => apiGet<WaterContract[]>(endpoints.clientArea.aguaLigacoes);
export const listClientWaterReadings = () => apiGet<WaterReading[]>(endpoints.clientArea.aguaLeituras);
export const listClientWaterBills = () => apiGet<WaterBill[]>(endpoints.clientArea.aguaFacturas);
export const payClientWaterBill = (id: number, payload: WaterBillPaymentCreate) =>
  apiPatch<WaterBill>(endpoints.clientArea.aguaFacturaPagamento(id), payload);
export const createClientWaterRequest = (payload: WaterRequestCreate) =>
  apiPost<WaterCustomer>(endpoints.clientArea.aguaSolicitacoes, payload);
export const completeClientWaterRequest = (id: number, payload: WaterRequestCompletion) =>
  apiPatch<WaterCustomer>(endpoints.clientArea.aguaSolicitacaoById(id), payload);
