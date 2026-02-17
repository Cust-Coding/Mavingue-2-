export interface Sale {
  id: string;
  customerId?: string | null;
  ferragemId: string;
  total: number;
  status: "CONFIRMED" | "PENDING_PICKUP";
  createdAt: string;
}

export interface SaleItemCreate {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleCreate {
  customerId?: string;
  ferragemId: string;
  items: SaleItemCreate[];
}
