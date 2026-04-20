import type { Customer } from "@/features/customers/types";
import type { Venda } from "@/features/sales/types";
import type { Role } from "@/features/users/types";
import type { WaterCustomer } from "@/features/water/types";

export type ClientAccount = {
  id: number;
  nome: string;
  email: string;
  role: Role;
};

export type ClientProfile = {
  account: ClientAccount;
  customer: Customer | null;
  waterCustomer: WaterCustomer | null;
};

export type ClientOrder = Venda;
