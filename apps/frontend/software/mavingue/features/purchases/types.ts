export type FormaPagamento = "CARTEIRA_MOVEL" | "CARTAO" | "DINHEIRO_FISICO";

export type FacturaCompraCreate = {
  funcionarioId?: number;
  produtoId?: number;
  quantidade?: number;
  formaPagamento?: FormaPagamento;
  valorPago?: number;
  items?: FacturaCompraItemCreate[];
};

export type FacturaCompraItemCreate = {
  produtoId: number;
  quantidade: number;
};

export type FacturaCompraItem = {
  produtoId: number;
  produtoNome: string;
  categoria?: string | null;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
};

export type FacturaCompra = {
  id: number;
  produtoId: number;
  produtoNome: string;
  categoria?: string | null;
  quantidade: number;
  funcionarioId: number;
  funcionarioNome: string;
  precoUnitario: number;
  total: number;
  formaPagamento?: FormaPagamento | null;
  valorPago?: number | null;
  troco?: number | null;
  criadoEm?: string | null;
  totalItens?: number;
  items?: FacturaCompraItem[];
};
