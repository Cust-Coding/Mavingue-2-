export type Product = { id: number; name: string; description?: string; price: number };
export type ProductCreate = { name: string; description?: string; price: number };
export type ProductUpdate = Partial<ProductCreate>;