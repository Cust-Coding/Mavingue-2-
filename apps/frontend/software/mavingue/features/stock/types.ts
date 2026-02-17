export interface StockItem {
  productId: string;
  productName: string;
  quantity: number;
  minStock: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number;
  reason?: string;
  createdAt: string;
}

export interface StockMovementCreate {
  productId: string;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number;
  reason?: string;
}
