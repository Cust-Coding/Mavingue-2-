# Estaleiro Mavingue

a interface de vendas esta muito bonita quero que voce adicione a mesma inrterface em novos produtos, editar produtos,  editar perfil. agora uma coisa que precisa mudar e a forma que os produtos sao comprados, deve permitir comprar varios produtos, procurar em categorias e adicionar e depois fazer realizar compra na parte da gestao claro nao do cliente que ja esta bom. a parte de stock ainda esta mal feito nao parece proficional tambem o mesmo em registrar vendas que esta horrivel e nada proficional e alem do mais deve permitir selecionar varios produto e filtrar por categorias, nao deve mostrar um selector mais sim os cardes mais pequenos para pooder selecionar e determinar a quantidade de um deles e ver o preco total se for a pagar com valor fisico deve permitir digitar quanto vai pagar e mostrar trocos por exemplo total deu 250 e a pessoa me entrega 400mt deve mostrar troco 150 e isso tudo deve registrar e deve mostrar o valor total dos produtos e o valor total de compra tipo. no sistema vai mostrar valor dos produtos 10000mt se a cada compra vai remover e mostrar valor total 9200 e valor restante de produtos e pode ver detalhes e ver os produtos comprados, total d cada produto e muito mais, isso deve estar completo e proficional esse sistema, claro isso sera permissoes e devemos poder atribuir essas permissoes para poder ter uma pessoa que so ve isso de relatorio e cria um novo link chamado auditoria onde vai mostrar logs e deve filtrar por exemplo so quero ver as pessoas que fizeram login e deve mostrar outro filtro se foram clientes ou funcionario. mas os logs do resto devem ser na parte dos funcionariso nao do cliente

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
