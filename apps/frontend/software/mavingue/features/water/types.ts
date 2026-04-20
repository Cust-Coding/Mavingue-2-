export interface WaterCustomer {
  id: number;
  name: string;
  phone: string;
  email: string;
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
  houseNR: string | null;
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
  valorTotal: number;
  estadoPagamento: "PENDENTE" | "PAGO" | "ATRASADO" | string;
  formaPagamento: "CARTEIRA_MOVEL" | "CARTAO" | "DINHEIRO_FISICO" | string;
  consumidorId: number;
  consumidorNome: string;
  houseNR: string | null;
  leituraId: number;
}

export interface WaterBillPaymentCreate {
  formaPagamento: "CARTEIRA_MOVEL" | "CARTAO" | "DINHEIRO_FISICO";
}

export interface WaterRequestDecision {
  observacoes?: string;
}

export interface WaterRequestCompletion {
  houseNR: string;
  adressId: number;
}

export interface WaterRequestCreate {
  referenciaLocal: string;
  observacoes?: string;
}

export interface AddressItem {
  id: number;
  name: string;
  bairro: string;
}
