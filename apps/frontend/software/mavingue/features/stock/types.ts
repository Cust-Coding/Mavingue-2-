export type StockItem = {
  id: number;
  quantidade: number;
  stockMinimo: number;
  produto?: any;
  ferragem?: any;
};

export type StockAdjust = {
  produtoId: number;
  quantidade: number;
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE";
  motivo?: string;
  ferragemId?: number;
};