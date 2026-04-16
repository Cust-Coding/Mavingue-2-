export type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  created?: string;
};

export type CustomerCreate = {
  name: string;
  phone: string;
  email: string;
};

export type CustomerUpdate = CustomerCreate;