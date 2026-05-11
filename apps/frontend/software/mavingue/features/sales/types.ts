export type FormaPagamento = "CARTEIRA_MOVEL" | "CARTAO" | "DINHEIRO_FISICO";
export type EstadoLevantamento =
  | "AGUARDANDO_PREPARACAO"
  | "PRONTO_PARA_LEVANTAMENTO"
  | "LEVANTADO";

export type VendaCreate = {
  produtoId?: number;
  clienteId?: number;
  funcionarioId?: number;
  quantidade?: number;
  formaPagamento: FormaPagamento;
  items?: VendaItemCreate[];
  valorPago?: number;
};

export type VendaItemCreate = {
  produtoId: number;
  quantidade: number;
};

export type VendaItem = {
  produtoId: number;
  produtoNome: string;
  categoria?: string | null;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
};

export type VendaStatusUpdate = {
  estadoLevantamento: EstadoLevantamento;
  levantamentoNotas?: string;
};

export type Venda = {
  id: number;
  produtoId: number;
  produtoNome: string;
  categoria?: string | null;
  clienteId: number;
  clienteNome: string;
  funcionarioId: number;
  funcionarioNome: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
  formaPagamento: FormaPagamento;
  estadoLevantamento: EstadoLevantamento;
  levantamentoNotas?: string | null;
  valorPago?: number | null;
  troco?: number | null;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
  levantadoEm?: string | null;
  totalItens?: number;
  items?: VendaItem[];
};
