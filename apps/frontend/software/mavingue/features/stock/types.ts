export type StockItem = {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
};

export type StockAdjust = {
  produtoId: number;
  quantidade: number;
  tipo: "ENTRADA" | "SAIDA";
  motivo?: string;
};

export type StockMovement = {
  id: number;
  produtoId: number;
  produtoNome: string;
  ferragemId: number;
  ferragemNome: string;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: number;
  motivo?: string | null;
  criadoEm?: string | null;
};
