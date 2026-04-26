export type Customer = {
  id: number;
  name: string;
  sex: "HOMEM" | "MULHER";
  phone: string;
  email: string | null;
  birthDate: string;
  provincia: string;
  cidade: string;
  bairro: string;
  elegivelConta: boolean;
  contaActiva: boolean;
  temServicoAgua: boolean;
  appUserId: number | null;
  observacoes?: string | null;
  created?: string;
};

export type CustomerCreate = {
  name: string;
  sex: "HOMEM" | "MULHER";
  phone: string;
  email?: string | null;
  birthDate: string;
  provincia: string;
  cidade: string;
  bairro: string;
  elegivelConta?: boolean;
  observacoes?: string | null;
};

export type CustomerUpdate = CustomerCreate;
