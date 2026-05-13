export interface WaterCustomer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  referenciaLocal: string | null;
  houseNR: string | null;
  adressId: number | null;
  adress: string | null;
  estado: "PENDENTE_APROVACAO" | "AGUARDANDO_DADOS_CASA" | "ATIVO" | "REJEITADO" | string;
  pedidoAgua: boolean;
  activo: boolean;
  observacoes?: string | null;
  created?: string;
}

export interface WaterContract {
  id: number;
  data: string;
  estado: "ATIVA" | "CORTADA" | string;
  consumidorId: number;
  consumidorNome: string;
  referenciaLocal: string | null;
  houseNR: string | null;
  adress: string | null;
  phone: string | null;
  email: string | null;
  funcionarioId: number;
  funcionarioNome: string;
}

export interface WaterReading {
  id: number;
  data: string;
  leituraAnterior: number;
  leituraActual: number;
  consumoM3: number;
  valorPagar: number;
  ligacaoId: number;
}

export interface WaterBill {
  id: number;
  data: string;
  taxaFixa: number;
  valor: number;
  valorFactura: number;
  valorTotal: number;
  percentualMulta?: number | null;
  multaValor?: number | null;
  dividaValor?: number | null;
  estadoPagamento: "PENDENTE" | "PAGO" | "ATRASADO" | string;
  formaPagamento: "CARTEIRA_MOVEL" | "CARTAO" | "DINHEIRO_FISICO" | string;
  valorPago?: number | null;
  troco?: number | null;
  consumidorId: number;
  consumidorNome: string;
  houseNR: string | null;
  leituraId: number;
  ligacaoId?: number | null;
  leituraAnterior?: number | null;
  leituraActual?: number | null;
  consumoM3?: number | null;
}

export interface WaterBillPaymentCreate {
  formaPagamento: "CARTEIRA_MOVEL" | "CARTAO" | "DINHEIRO_FISICO";
  valorPago?: number;
  facturaIds?: number[];
}

export interface WaterBillPenaltyApply {
  facturaIds?: number[];
}

export interface WaterBillingRule {
  id: number | null;
  precoM3: number;
  taxaFixa: number;
  percentualMulta?: number | null;
  descricao: string | null;
  activo: boolean;
  criadoEm?: string | null;
}

export interface WaterBillingRuleCreate {
  precoM3: number;
  taxaFixa?: number | null;
  percentualMulta?: number | null;
  descricao?: string | null;
}

export interface WaterRequestDecision {
  houseNR?: string;
  adressId?: number;
  observacoes?: string;
}

export interface WaterRequestCompletion {
  houseNR: string;
  adressId: number;
}

export interface WaterRequestCreate {
  referenciaLocal: string;
  houseNR?: string | null;
  adressId?: number | null;
  observacoes?: string;
}

export interface WaterCustomerCreate {
  name: string;
  phone: string;
  email?: string | null;
  houseNR?: string | null;
  customerId?: number | null;
  adressId?: number | null;
  referenciaLocal: string;
  observacoes?: string | null;
}

export interface WaterCustomerActivation {
  houseNR: string;
  adressId: number;
  observacoes?: string | null;
}

export interface AddressItem {
  id: number;
  name: string;
  bairro: string;
}
