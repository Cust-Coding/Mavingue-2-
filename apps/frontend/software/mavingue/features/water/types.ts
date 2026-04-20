export interface WaterCustomer {
  id: number;
  name: string;
  phone: string;
  email: string;
  houseNR: string;
  adress: string | null;
  created?: string;
}

export interface WaterContract {
  id: number;
  data: string;
  estado: "ATIVA" | "INATIVA" | "SUSPENSA" | string;
  consumidorId: number;
  consumidorNome: string;
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
  leituraId: number;
}

export interface WaterBillPaymentCreate {
  formaPagamento: "CARTEIRA_MOVEL" | "CARTAO" | "DINHEIRO_FISICO";
}
