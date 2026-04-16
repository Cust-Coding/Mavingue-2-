export const endpoints = {
  auth: {
    login: "/api/auth/login",
    me: "/api/auth/me",
  },

  products: "/api/products",
  ferragem: "/api/ferragem",
  customer: "/api/customer",
  stock: "/api/stock",
  stockAdjust: "/api/stock/adjust",
  vendas: "/api/vendas",
  compras: "/api/facturas-compra",
  address: "/api/address",

  // existe no backend, mas o controller não expõe CRUD no momento (tu confirmaste via findstr)
  customerWater: "/api/customer-water",
};