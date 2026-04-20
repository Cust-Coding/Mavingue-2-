export type Customer = {
  id: number;
  name: string;
  sex: "HOMEM" | "MULHER";
  phone: string;
  email: string;
  birthDate: string;
  provincia: string;
  cidade: string;
  bairro: string;
  endereco: string;
  nuit?: string | null;
  numeroDocumento?: string | null;
  tipoDocumento?: string | null;
  created?: string;
};

export type CustomerCreate = {
  name: string;
  sex: "HOMEM" | "MULHER";
  phone: string;
  email: string;
  birthDate: string;
  provincia: string;
  cidade: string;
  bairro: string;
  endereco: string;
  nuit?: string | null;
  numeroDocumento?: string | null;
  tipoDocumento?: string | null;
};

export type CustomerUpdate = CustomerCreate;
