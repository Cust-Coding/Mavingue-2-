export type Product = { id: number; name: string; description: string; price: number; urlImg: string };
export type ProductCreate = { name: string; description: string; price: number; urlImg: string };
export type ProductUpdate = Partial<ProductCreate>;
