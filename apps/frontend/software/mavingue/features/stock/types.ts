export type StockItem = {
  produtoId: number;
  produtoNome: string;
  categoria?: string | null;
  precoUnitario: number;
  quantidade: number;
  stockMinimo: number;
  valorEmStock: number;
};

export type StockAdjust = {
  produtoId: number;
  quantidade: number;
  tipo: "ENTRADA" | "SAIDA";
  motivo?: string;
  stockMinimo?: number;
};

export type StockMovement = {
  id: number;
  produtoId: number;
  produtoNome: string;
  categoria?: string | null;
  precoUnitario?: number | null;
  ferragemId: number;
  ferragemNome: string;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: number;
  motivo?: string | null;
  criadoEm?: string | null;
};
