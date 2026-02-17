export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },

  products: {
    list: "/products",
    create: "/products",
    byId: (id: string) => `/products/${id}`,
    update: (id: string) => `/products/${id}`,
    remove: (id: string) => `/products/${id}`,
  },

  stock: {
    alerts: "/stock/alerts",
    movements: "/stock/movements",
    createMovement: "/stock/movements",
  },

  sales: {
    list: "/sales",
    create: "/sales",
    byId: (id: string) => `/sales/${id}`,
  },

  water: {
    clients: "/water/clients",
    contracts: "/water/contracts",
    readings: "/water/readings",
    bills: "/water/bills",
    payments: "/water/payments",
  },
};
