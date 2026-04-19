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

  // Users (Admin)
  users: "/api/users",

  // Products (Admin)
  products: "/api/products",

  // Ferragem (Admin)
  ferragem: "/api/ferragem",

  // Customers (Admin/Staff)
  customer: "/api/customer",

  // Stock (Admin/Staff)
  stock: "/api/stock",
  stockAdjust: "/api/stock/adjust",
  stockByProduto: (id: number) => `/api/stock/produto/${id}`,

  // Vendas (Admin/Staff)
  vendas: "/api/vendas",

  // Compras (Admin/Staff)
  compras: "/api/facturas-compra",

  // Address
  address: "/api/address",

  // Customer Water
  customerWater: "/api/customer-water",

  // Water
  water: {
    customers: "/api/water/customers",
    contracts: "/api/water/contracts",
    readings: "/api/water/readings",
    bills: "/api/water/bills",
    billById: (id: string) => `/api/water/bills/${id}`,
    payments: "/api/water/payments",
  },

  // Leituras Água
  leiturasAgua: "/api/leituras-agua",
  leiturasAguaByLigacao: (id: number) => `/api/leituras-agua?ligacaoId=${id}`,

  // Ligações Água
  ligacoesAgua: "/api/ligacoes-agua",
  ligacaoAguaEstado: (id: number) => `/api/ligacoes-agua/${id}/estado`,

  // Meta
  meta: {
    sexos: "/api/meta/sexos",
  },
};