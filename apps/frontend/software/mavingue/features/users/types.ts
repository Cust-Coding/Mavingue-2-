export type Role = "ADMIN" | "FUNCIONARIO" | "CLIENTE";
export type UserStatus = "PENDENTE_VERIFICACAO" | "PENDENTE_REVISAO" | "ATIVO" | "INATIVO";

export type UserResponse = {
  id: number;
  nome: string;
  email: string | null;
  phone: string;
  role: Role;
  status: UserStatus;
  permissions: string[];
};

export type UserCreateFullRequest = {
  nome: string;
  email?: string | null;
  password?: string | null;
  role: Role;

  sexo: "HOMEM" | "MULHER";
  telefone: string;
  dataNascimento: string;
  provincia: string;
  cidade: string;
  bairro: string;

  elegivelConta?: boolean;
  criarContaAgua?: boolean;
  referenciaLocal?: string | null;
  houseNR?: string | null;
  adressId?: number | null;
};

export type UserUpdateRequest = {
  nome?: string;
  email?: string | null;
  phone?: string;
  password?: string;
  role?: Role;
  status?: UserStatus;
};

export type PermissionDefinition = {
  key: string;
  group: string;
  description: string;
};
