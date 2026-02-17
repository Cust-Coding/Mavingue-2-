export interface WaterCustomer {
  id: string;
  nome: string;
  contacto: string;
  ferragemId: string;
}

export interface WaterContract {
  id: string;
  customerId: string;
  meterNumber: string;
  active: boolean;
}

export interface WaterReading {
  id: string;
  contractId: string;
  readingDate: string;
  value: number;
}

export interface WaterBill {
  id: string;
  contractId: string;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID";
}

export interface WaterPaymentCreate {
  billId: string;
  amount: number;
  method: "MPESA" | "EMOLA" | "CASH" | "BANK";
}
