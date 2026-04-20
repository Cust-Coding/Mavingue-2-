export type FacturaCompraCreate = {
  produtoId: number;
  funcionarioId: number;
  quantidade: number;
};

export type FacturaCompra = {
  id: number;
  produtoId: number;
  quantidade: number;
  funcionarioId: number;
};
