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
};

export type CustomerUpdate = CustomerCreate;