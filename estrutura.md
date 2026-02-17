# Estrutura da solução

## Visão geral

- **Backend**: Spring Boot com endpoints REST para autenticação, catálogo, stock, vendas, água e relatórios.
- **Frontend**: Next.js App Router com áreas públicas e protegidas por perfil.
- **Integração**: frontend chama **apenas** `/api/proxy/[...path]`; o proxy encaminha para Spring.

## Camadas frontend

1. `app/*`: páginas e layouts.
2. `features/*`: clientes tipados por domínio (`users`, `products`, `stock`, `sales`, `water`).
3. `lib/http/*`: cliente HTTP e mapa central de endpoints.
4. `components/ui/*`: componentes reutilizáveis.

## RBAC aplicado

- `ADMIN`
  - Gestão total (utilizadores, produtos, stock, vendas, água, relatórios).
- `STAFF`
  - Operação diária (vendas, stock, leituras/faturação/pagamentos de água), sem criação de utilizadores/produtos.
- `CLIENTE`
  - Visualização própria (compras, faturas de água, pagamentos).

## Fluxo de autenticação

1. Login envia credenciais para `/api/proxy/auth/login`.
2. Proxy grava `access_token` em cookie `httpOnly`.
3. Proxy injeta `Authorization: Bearer <token>` no encaminhamento para backend.
4. Layouts protegidos consultam `/auth/me` para validar sessão/perfil.
