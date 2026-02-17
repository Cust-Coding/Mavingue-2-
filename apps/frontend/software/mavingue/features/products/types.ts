export type Product = {
  id: string;
  nome: string;
  sku?: string;
  preco: number;
  unidade?: string;     // ex: "un", "kg"
  ativo: boolean;
  createdAt?: string;
};

export type ProductCreate = Omit<Product, "id" | "createdAt">;
export type ProductUpdate = Partial<ProductCreate>;
