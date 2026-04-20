export type FormaPagamento = "CARTEIRA_MOVEL" | "CARTAO" | "DINHEIRO_FISICO";

export type VendaCreate = {
  produtoId: number;
  clienteId: number;
  funcionarioId: number;
  quantidade: number;
  formaPagamento: FormaPagamento;
};

export type Venda = {
  id: number;
  produtoId: number;
  produtoNome: string;
  clienteId: number;
  funcionarioId: number;
  quantidade: number;
  precoUnitario: number;
  total: number;
  formaPagamento: FormaPagamento;
};
