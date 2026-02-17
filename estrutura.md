# Estrutura completa do projeto (versão detalhada)

Resumo rápido
- Monorepo com back-end Java (Spring/Maven) e front-end Next.js + Tauri (desktop).
- Objetivo: aplicação de gestão (vendas, stock, água, utilizadores).

---
## Árvore completa do repositório (base: d:\github\EstaleiroMavingue) ✅
```
/ (repo root)
├─ .gitignore
├─ README.md
├─ estrutura.md
├─ apps/
│  ├─ README,md
│  ├─ api/
│  │  ├─ README.md
│  │  └─ auth/
│  │     └─ app/
│  │         ├─ .gitignore
│  │         ├─ .gitattributes
│  │         ├─ mvnw
│  │         ├─ mvnw.cmd
│  │         ├─ pom.xml
│  │         ├─ .mvn/
│  │         │  └─ wrapper/maven-wrapper.properties
│  │         └─ src/
│  │             ├─ main/
│  │             │  ├─ resources/application.yaml
│  │             │  └─ java/com/custcoding/estaleiromavingue/App/
│  │             │      ├─ AppApplication.java
│  │             │      ├─ controllers/
│  │             │      │  ├─ AdressController.java
│  │             │      │  ├─ CustomerController.java
│  │             │      │  ├─ CustomerWaterController.java
│  │             │      │  ├─ FerragemController.java
│  │             │      │  └─ ProductController.java
│  │             │      ├─ services/
│  │             │      │  ├─ AdressService.java
│  │             │      │  ├─ CustomerService.java
│  │             │      │  ├─ CustomerWaterService.java (se existir)
│  │             │      │  ├─ FerragemService.java
│  │             │      │  └─ ProductService.java
│  │             │      ├─ repositories/
│  │             │      │  ├─ AdressRepository.java
│  │             │      │  ├─ CustomerRepository.java
│  │             │      │  ├─ FerragemRepository.java
│  │             │      │  └─ ProductRepository.java
│  │             │      ├─ models/
│  │             │      │  ├─ Adress.java
│  │             │      │  ├─ CustomerProduct.java
│  │             │      │  ├─ CustomerWater.java
│  │             │      │  ├─ FacturaAgua.java
│  │             │      │  ├─ FacturaCompra.java
│  │             │      │  ├─ Ferragem.java
│  │             │      │  ├─ FM.java
│  │             │      │  ├─ Funcionario.java
│  │             │      │  ├─ ItemVenda.java
│  │             │      │  ├─ LeituraAgua.java
│  │             │      │  ├─ LigacaoAgua.java
│  │             │      │  ├─ MovimentoStock.java
│  │             │      │  ├─ Owner.java
│  │             │      │  ├─ Product.java
│  │             │      │  ├─ Stock.java
│  │             │      │  ├─ User.java
│  │             │      │  └─ Venda.java
│  │             │      ├─ dtos/
│  │             │      │  ├─ adress/AdressCreateDTO.java
│  │             │      │  ├─ adress/AdressResponseDTO.java
│  │             │      │  ├─ customer/CustomerCreateDTO.java
│  │             │      │  ├─ customer/CustomerResponseDTO.java
│  │             │      │  ├─ customer_water/CustomerWaterCreateDTO.java
│  │             │      │  └─ product/ProductCreateDTO.java
│  │             │      ├─ dtos/ferragem/
│  │             │      │  ├─ FerragemCreateDTO.java
│  │             │      │  └─ FerragemResponseDTO.java
│  │             │      ├─ dtos/product/ProductResponseDTO.java
│  │             │      ├─ mappers/
│  │             │      │  ├─ AdressMapper.java
│  │             │      │  ├─ CustomerMapper.java
│  │             │      │  ├─ FerragemMapper.java
│  │             │      │  └─ ProductMapper.java
│  │             │      └─ models/status/
│  │             │         ├─ EstadoLigacao.java
│  │             │         ├─ EstadoPagamento.java
│  │             │         ├─ FormaPagamento.java
│  │             │         ├─ TipoMovimento.java
│  │             │         └─ Unit.java
│  │             └─ test/
│  │                 └─ java/com/custcoding/estaleiromavingue/App/
│  │                     └─ AppApplicationTests.java
│  └─ (outros serviços backend, se houver)
├─ apps/frontend/
│  └─ software/
│     └─ mavingue/
│         ├─ .gitignore
│         ├─ README.md
│         ├─ package.json
│         ├─ package-lock.json
│         ├─ pnpm-lock.yaml
│         ├─ tsconfig.json
│         ├─ next.config.ts
│         ├─ postcss.config.mjs
│         ├─ eslint.config.mjs
│         ├─ middleware.ts
│         ├─ Git_&&_GitHub_Basics.md
│         ├─ public/
│         │  ├─ intro.jpg
│         │  └─ shoping.svg
│         ├─ src-tauri/
│         │  ├─ .gitignore
│         │  ├─ build.rs
│         │  ├─ Cargo.toml
│         │  ├─ capabilities/default.json
│         │  ├─ tauri.conf.json
│         │  └─ icons/
│         │      ├─ icon.png
│         │      ├─ icon.ico
│         │      ├─ icon.icns
│         │      ├─ StoreLogo.png
│         │      ├─ Square*.png
│         │      └─ 32x32.png
│         ├─ src-tauri/src/
│         │  ├─ lib.rs
│         │  └─ main.rs
│         ├─ app/
│         │  ├─ globals.css
│         │  ├─ layout.tsx
│         │  ├─ favicon.ico
│         │  ├─ api/proxy/[...path]/route.ts
│         │  ├─ (public)/
│         │  │  ├─ page.tsx
│         │  │  └─ auth/
│         │  │     ├─ login/page.tsx
│         │  │     ├─ logout/page.tsx
│         │  │     └─ reset-password/page.tsx
│         │  │  └─ catalogo/page.tsx
│         │  └─ (protected)/
│         │     ├─ layout.tsx
│         │     ├─ forbidden/page.tsx
│         │     ├─ staff/
│         │     │  ├─ layout.tsx
│         │     │  ├─ page.tsx
│         │     │  ├─ vendas/
│         │     │  │  ├─ page.tsx
│         │     │  │  └─ nova/page.tsx
│         │     │  └─ stock/
│         │     │     ├─ page.tsx
│         │     │     └─ movimentos/page.tsx
│         │     ├─ cliente/
│         │     │  ├─ layout.tsx
│         │     │  ├─ page.tsx
│         │     │  ├─ compras/[id]/page.tsx
│         │     │  └─ perfil/page.tsx
│         │     └─ admin/
│         │        ├─ layout.tsx
│         │        ├─ page.tsx
│         │        ├─ utiliizadores/
│         │        │  ├─ page.tsx
│         │        │  ├─ novo/page.tsx
│         │        │  └─ [id]/editar/page.tsx
│         │        ├─ produtos/
│         │        │  ├─ page.tsx
│         │        │  ├─ novo/page.tsx
│         │        │  └─ [id]/editar/page.tsx
│         │        ├─ stock/
│         │        │  ├─ page.tsx
│         │        │  └─ movimentos/page.tsx
│         │        └─ relatorios/
│         │           ├─ page.tsx
│         │           ├─ vendas/page.tsx
│         │           ├─ stock/page.tsx
│         │           └─ agua/page.tsx
│         ├─ components/
│         │  ├─ charts/ExampleChart.tsx
│         │  ├─ forms/ExampleForm.tsx
│         │  ├─ layout/
│         │  │  ├─ Breadcrumbs.tsx
│         │  │  ├─ RoleGate.tsx
│         │  │  ├─ Sidebar.tsx
│         │  │  └─ Topbar.tsx
│         │  ├─ tables/ExampleTable.tsx
│         │  └─ ui/
│         │     ├─ Button.tsx
│         │     ├─ Input.tsx
│         │     ├─ Modal.tsx
│         │     ├─ State.tsx
│         │     └─ Toast.tsx
│         ├─ features/
│         │  ├─ auth/
│         │  │  ├─ api.ts
│         │  │  ├─ hooks.ts
│         │  │  └─ types.ts
│         │  ├─ products/
│         │  │  ├─ index.ts
│         │  │  ├─ api.ts
│         │  │  └─ types.ts
│         │  ├─ sales/index.ts
│         │  ├─ stock/index.ts
│         │  ├─ users/index.ts
│         │  └─ water/index.ts
│         ├─ lib/
│         │  ├─ auth/
│         │  │  ├─ guards.ts
│         │  │  ├─ rbac.ts
│         │  │  └─ session.ts
│         │  ├─ constants/index.ts
│         │  └─ http/
│         │     ├─ client.ts
│         │     └─ endpoints.ts
│         ├─ store/
│         │  ├─ auth.store.ts
│         │  └─ ui.store.ts
│         └─ styles/
│            └─ globals.css
└─ (outros diretórios sugeridos)
```

---
## Descrição — o que há em cada área 🔍
- `apps/api/auth/app` — serviço backend (Spring Boot): modelos (`models`), DTOs (`dtos`), controllers, services e repositórios. Ponto de partida: `AppApplication.java` e `application.yaml`.
- `apps/frontend/software/mavingue` — aplicação Next.js + Tauri; tem rotas App Router (`app/`), componentes reutilizáveis (`components/`), lógica por funcionalidade (`features/`), utilitários (`lib/`) e integração desktop (`src-tauri/`).
- `src-tauri` — manifest Rust e ícones para empacotamento com Tauri.

## Arquivos importantes (revise primeiro) 📌
- `apps/api/auth/app/pom.xml` — build/backend dependencies
- `apps/api/auth/app/src/main/resources/application.yaml` — configs do Spring
- `apps/frontend/software/mavingue/package.json` — scripts (dev/build/tauri)
- `apps/frontend/software/mavingue/src-tauri/tauri.conf.json` e `Cargo.toml` — empacotamento desktop
- `apps/frontend/software/mavingue/app/api/proxy/[...path]/route.ts` — proxy API (dev)

## Observações / itens **faltantes** recomendados ⚠️
- Falta `.env.example` na raíz do front-end e do backend (recomendado).
- Não há `Dockerfile` nem `docker-compose.yml` (útil para deploy/local testing).
- Sem workflows em `.github/workflows/` (CI/CD) — sugerir GitHub Actions para lint/build/test.
- Testes E2E ausentes (p.ex. Playwright / Cypress) — importante para fluxos críticos.

## Como executar localmente (Windows) ▶️
1) Backend (auth service)
   - cd `apps/api/auth/app`
   - `mvnw.cmd spring-boot:run`
2) Front-end (web)
   - cd `apps/frontend/software/mavingue`
   - `pnpm install`
   - `pnpm dev`
3) Tauri (desktop, dev)
   - cd `apps/frontend/software/mavingue`
   - `pnpm tauri dev`
4) Builds de produção
   - Backend: `mvnw.cmd package`
   - Front-end web: `pnpm build`
   - Tauri: `pnpm build` (ver `package.json`)

---
## Próximos passos — escolha uma opção ✅
1. Gerar scaffold de ficheiros/pastas que faltam (ex.: `.env.example`, `Dockerfile`, CI).  
2. Implementar conteúdo mínimo (stubs) para front-end + back-end e garantir `pnpm dev` + `mvnw.cmd spring-boot:run` funcionarem.  
3. Mapear endpoints REST (documentação OpenAPI / Postman).  

Diga qual opção prefere e eu executo a próxima ação. 🔧
