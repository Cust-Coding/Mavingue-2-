export type ProductCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ProductCategoryCreate = {
  name: string;
  description?: string | null;
};

export type ProductCategoryUpdate = ProductCategoryCreate;

export type ProductCategoryOption = {
  value: string;
  label: string;
};
