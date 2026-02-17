export type Role = "ADMIN" | "STAFF" | "CLIENTE";

export interface User {
  id: string;
  nome: string;
  username: string;
  role: Role;
  ferragemId?: string | null;
  ativo: boolean;
}

export interface UserUpsert {
  nome: string;
  username: string;
  senha?: string;
  role: Role;
  ferragemId?: string | null;
  ativo: boolean;
}
