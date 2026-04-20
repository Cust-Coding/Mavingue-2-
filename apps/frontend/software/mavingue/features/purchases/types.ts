export type FacturaCompraCreate = {
  produtoId: number;
  funcionarioId?: number;
  quantidade: number;
};

export type FacturaCompra = {
  id: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  funcionarioId: number;
  funcionarioNome: string;
  precoUnitario: number;
  total: number;
  criadoEm?: string | null;
};
