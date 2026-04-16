export type Role = "ADMIN" | "FUNCIONARIO" | "CLIENTE";

export type UserResponse = {
  id: number;
  nome: string;
  email: string;
  role: Role;
};

export type UserCreateFullRequest = {
  nome: string;
  email: string;
  password: string;
  role: Role;

  sexo: "HOMEM" | "MULHER";
  telefone: string;
  dataNascimento: string; 
  provincia: string;
  cidade: string;
  bairro: string;
  endereco: string;

  nuit?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
};