# Estaleiro Mavingue

Monorepo com backend Spring Boot e frontend Next.js para gestão de ferragem + módulo de água.

## Estrutura

- Backend: `apps/api/auth/app`
- Frontend: `apps/frontend/software/mavingue`

## Executar backend (Spring)

```bash
cd apps/api/auth/app
./mvnw spring-boot:run
```

### Testes backend

```bash
cd apps/api/auth/app
./mvnw test
```

## Executar frontend (Next.js)

```bash
cd apps/frontend/software/mavingue
npm install
npm run dev
```

### Build/lint frontend

```bash
cd apps/frontend/software/mavingue
npm run lint
npm run build
```

## Variáveis de ambiente

### Frontend (`apps/frontend/software/mavingue/.env.local`)

- `SPRING_API_BASE_URL=http://localhost:8080`

## Contratos de API usados pelo frontend

Todos os caminhos ficam centralizados em:

- `apps/frontend/software/mavingue/lib/http/endpoints.ts`

Principais grupos:

- Auth: `/auth/login`, `/auth/logout`, `/auth/me`
- Users: `/users`, `/users/{id}`
- Products: `/products`, `/products/{id}`
- Stock: `/stock`, `/stock/alerts`, `/stock/movements`
- Sales: `/sales`, `/sales/{id}`, `/sales/{id}/invoice`
- Water: `/water/customers`, `/water/contracts`, `/water/readings`, `/water/bills`, `/water/payments`
- Reports: `/reports/sales`, `/reports/stock`, `/reports/water`

## Segurança e RBAC

- O frontend usa rota proxy (`/api/proxy/[...path]`) para encaminhar chamadas para o backend.
- O token é persistido em cookie `httpOnly` no proxy.
- Rotas protegidas devem validar perfil com `/auth/me`.
- Perfis esperados:
  - `ADMIN`
  - `STAFF`
  - `CLIENTE`

Para detalhes arquiteturais e RBAC, ver `estrutura.md`.
