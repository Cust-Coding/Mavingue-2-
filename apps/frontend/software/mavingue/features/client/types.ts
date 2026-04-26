import type { Customer } from "@/features/customers/types";
import type { Venda } from "@/features/sales/types";
import type { Role, UserStatus } from "@/features/users/types";
import type { WaterCustomer } from "@/features/water/types";

export type ClientAccount = {
  id: number;
  nome: string;
  email: string | null;
  phone: string;
  role: Role;
  status: UserStatus;
  permissions: string[];
};

export type ClientProfile = {
  account: ClientAccount;
  customer: Customer | null;
  waterCustomer: WaterCustomer | null;
  waterCustomers: WaterCustomer[];
};

export type ClientOrder = Venda;

export type ClientCheckoutItem = {
  produtoId: number;
  quantidade: number;
};

export type ClientCheckoutRequest = {
  items: ClientCheckoutItem[];
  formaPagamento: "CARTEIRA_MOVEL" | "CARTAO" | "DINHEIRO_FISICO";
};
