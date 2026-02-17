export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    resetPassword: "/auth/reset-password",
  },
  users: {
    list: "/users",
    create: "/users",
    byId: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    remove: (id: string) => `/users/${id}`,
  },
  products: {
    list: "/products",
    create: "/products",
    byId: (id: string) => `/products/${id}`,
    update: (id: string) => `/products/${id}`,
    remove: (id: string) => `/products/${id}`,
  },
  stock: {
    list: "/stock",
    alerts: "/stock/alerts",
    movements: "/stock/movements",
    createMovement: "/stock/movements",
  },
  sales: {
    list: "/sales",
    create: "/sales",
    byId: (id: string) => `/sales/${id}`,
    invoice: (id: string) => `/sales/${id}/invoice`,
  },
  water: {
    customers: "/water/customers",
    contracts: "/water/contracts",
    readings: "/water/readings",
    bills: "/water/bills",
    billById: (id: string) => `/water/bills/${id}`,
    payments: "/water/payments",
  },
  reports: {
    sales: "/reports/sales",
    stock: "/reports/stock",
    water: "/reports/water",
  },
} as const;
