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
