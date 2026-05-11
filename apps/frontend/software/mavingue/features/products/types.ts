export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: string | null;
  urlImg: string;
  stockDisponivel: number;
};
export type ProductCreate = { name: string; description: string; price: number; category?: string | null; urlImg: string };
export type ProductUpdate = Partial<ProductCreate>;
