export const endpoints = {
  auth: {
    login: "/api/auth/login",
    me: "/api/auth/me",
    register: "/api/auth/register",
    verifyCode: "/api/auth/verify-code",
    resendToken: "/api/auth/resend-token",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
  },

  users: "/api/users",
  products: "/api/products",
  ferragem: "/api/ferragem",
  customer: "/api/customer",
  stock: "/api/stock",
  stockAdjust: "/api/stock/adjust",
  stockByProduto: (id: number) => `/api/stock/produto/${id}`,
  vendas: "/api/vendas",
  compras: "/api/facturas-compra",
  address: "/api/address",
  customerWater: "/api/customer-water",
  leiturasAgua: "/api/leituras-agua",
  leiturasAguaByLigacao: (id: number) => `/api/leituras-agua?ligacaoId=${id}`,
  ligacoesAgua: "/api/ligacoes-agua",
  ligacaoAguaEstado: (id: number) => `/api/ligacoes-agua/${id}/estado`,
  facturasAgua: "/api/facturas-agua",
  facturaAguaById: (id: number) => `/api/facturas-agua/${id}`,
  facturaAguaPagamento: (id: number) => `/api/facturas-agua/${id}/pagamento`,

  clientArea: {
    profile: "/api/client-area/profile",
    compras: "/api/client-area/compras",
    compraById: (id: number) => `/api/client-area/compras/${id}`,
    aguaLigacoes: "/api/client-area/agua/ligacoes",
    aguaLeituras: "/api/client-area/agua/leituras",
    aguaFacturas: "/api/client-area/agua/facturas",
    aguaFacturaPagamento: (id: number) => `/api/client-area/agua/facturas/${id}/pagamento`,
  },

  meta: {
    sexos: "/api/meta/sexos",
  },
};
