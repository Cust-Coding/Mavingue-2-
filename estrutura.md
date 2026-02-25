# Estrutura do Sistema - EstaleiroMavingue

## 📋 Visão Geral
Projeto full-stack com arquitetura de microsserviços. Frontend em Next.js com Tauri para desktop e Backend em Java Spring Boot.

---

## 🏗️ Estrutura Raiz

```
EstaleiroMavingue/
├── 📄 README.md
├── 📄 estrutura.md
├── 📂 .git/
├── 📄 .gitignore
└── 📂 apps/
    ├── 📂 api/
    │   └── 📂 auth/
    │       └── 📂 app/
    └── 📂 frontend/
        └── 📂 software/
            └── 📂 mavingue/
```

---

## 📱 FRONTEND - ESTRUTURA COMPLETA

### Localização
`apps/frontend/software/mavingue/`

### Raiz Global (Root Files)

```
mavingue/
├── 📄 package.json                    # Dependências Node.js
├── 📄 pnpm-lock.yaml                  # Lock file (package manager)
├── 📄 tsconfig.json                   # TypeScript configuração
├── 📄 next.config.ts                  # Next.js configuração
├── 📄 eslint.config.mjs               # ESLint rules
├── 📄 postcss.config.mjs              # PostCSS/Tailwind config
├── 📄 next-env.d.ts                   # Next.js type declarations
├── 📄 middleware.ts                   # Next.js middleware (auth)
├── 📄 README.md                       # Documentação frontend
└── 📄 Git_&&_GitHub_Basics.md        # Git guide

```

### 📁 app/ - Next.js App Router (Páginas & Layouts)

```
app/
├── 📄 layout.tsx                      # Root layout global
├── 📄 globals.css                     # Estilos globais
├── 📄 favicon.ico                     # Favicon
│
├── 📂 (protected)/                    # Route group - Páginas protegidas
│   ├── 📄 layout.tsx                  # Protected layout
│   │
│   ├── 📂 admin/                      # Dashboard administrativo
│   │   ├── 📄 page.tsx                # Admin home
│   │   ├── 📄 layout.tsx              # Admin layout
│   │   │
│   │   ├── 📂 agua/                   # Gestão de Água
│   │   │   ├── 📄 page.tsx            # Water list
│   │   │   ├── 📂 clientes/
│   │   │   │   └── 📄 page.tsx        # Water customers
│   │   │   ├── 📂 contratos/
│   │   │   │   └── 📄 page.tsx        # Water contracts
│   │   │   ├── 📂 faturas/
│   │   │   │   └── 📄 page.tsx        # Water invoices
│   │   │   └── 📂 leituras/
│   │   │       └── 📄 page.tsx        # Water readings
│   │   │
│   │   ├── 📂 produtos/               # Gestão de Produtos
│   │   │   ├── 📄 page.tsx            # Products list
│   │   │   ├── 📂 novo/
│   │   │   │   └── 📄 page.tsx        # Create product
│   │   │   └── 📂 [id]/
│   │   │       ├── 📄 editar/
│   │   │       │   └── 📄 page.tsx    # Edit product
│   │   │       └── (product details)
│   │   │
│   │   ├── 📂 stock/                  # Gestão de Stock
│   │   │   ├── 📄 page.tsx            # Stock management
│   │   │   └── 📂 movimentos/
│   │   │       └── 📄 page.tsx        # Stock movements
│   │   │
│   │   ├── 📂 utilizadores/           # Gestão de Utilizadores
│   │   │   ├── 📄 page.tsx            # Users list
│   │   │   ├── 📂 novo/
│   │   │   │   └── 📄 page.tsx        # Create user
│   │   │   └── 📂 [id]/
│   │   │       ├── 📄 editar/
│   │   │       │   └── 📄 page.tsx    # Edit user
│   │   │       └── (user details)
│   │   │
│   │   ├── 📂 vendas/                 # Gestão de Vendas
│   │   │   ├── 📄 page.tsx            # Sales list
│   │   │   └── 📂 nova/
│   │   │       └── 📄 page.tsx        # Create sale
│   │   │
│   │   └── 📂 relatorios/             # Relatórios
│   │       ├── 📄 page.tsx            # Reports home
│   │       ├── 📂 agua/
│   │       │   └── 📄 page.tsx        # Water reports
│   │       ├── 📂 stock/
│   │       │   └── 📄 page.tsx        # Stock reports
│   │       └── 📂 vendas/
│   │           └── 📄 page.tsx        # Sales reports
│   │
│   ├── 📂 cliente/                    # Portal do Cliente
│   │   ├── 📄 page.tsx                # Cliente home
│   │   ├── 📄 layout.tsx              # Cliente layout
│   │   ├── 📂 agua/                   # Cliente - Water section
│   │   │   ├── 📄 page.tsx
│   │   │   ├── 📂 faturas/
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📂 pagamentos/
│   │   │       └── 📄 page.tsx
│   │   ├── 📂 compras/
│   │   │   └── 📄 page.tsx
│   │   └── 📂 perfil/
│   │       └── 📄 page.tsx
│   │
│   ├── 📂 staff/                      # Portal do Staff
│   │   ├── 📄 page.tsx                # Staff home
│   │   ├── 📄 layout.tsx              # Staff layout
│   │   ├── 📂 agua/
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 stock/
│   │   │   └── 📄 page.tsx
│   │   └── 📂 vendas/
│   │       └── 📄 page.tsx
│   │
│   └── 📂 forbidden/                  # Acesso negado
│       └── (access denied page)
│
├── 📂 (public)/                       # Route group - Páginas públicas
│   ├── 📄 page.tsx                    # Home page
│   ├── 📂 auth/                       # Autenticação
│   │   ├── 📂 login/
│   │   │   └── 📄 page.tsx            # Login page
│   │   ├── 📂 logout/
│   │   │   └── 📄 page.tsx            # Logout page
│   │   └── 📂 reset-password/
│   │       └── 📄 page.tsx            # Password reset
│   ├── 📂 catalogo/
│   │   └── 📄 page.tsx                # Products catalog
│
└── 📂 api/                            # API routes (optional proxy)
    └── 📂 proxy/                      # API proxy handlers
```

### 📁 components/ - Componentes Reutilizáveis

```
components/
├── 📂 charts/
│   └── 📄 ExampleChart.tsx            # Gráficos genéricos
│
├── 📂 forms/
│   └── 📄 ExampleForm.tsx             # Formulários genéricos
│
├── 📂 layout/
│   ├── 📄 Breadcrumbs.tsx             # Navegação breadcrumbs
│   ├── 📄 RoleGate.tsx                # Gate de acesso por role
│   ├── 📄 Sidebar.tsx                 # Menu lateral
│   └── 📄 Topbar.tsx                  # Barra superior
│
├── 📂 tables/
│   └── 📄 ExampleTable.tsx            # Tabelas genéricas
│
└── 📂 ui/                             # UI Base Components
    ├── 📄 Button.tsx                  # Botão (primary|secondary|danger)
    ├── 📄 Input.tsx                   # Input text
    ├── 📄 Modal.tsx                   # Modal dialog
    ├── 📄 State.tsx                   # Loading/Empty/Error states
    └── 📄 Toast.tsx                   # Toast notifications
```

### 📁 features/ - Feature Modules (State + API)

```
features/
├── 📂 auth/                           # Autenticação
│   ├── 📄 api.ts                      # Auth API calls
│   ├── 📄 hooks.ts                    # useAuth hook
│   └── 📄 types.ts                    # TypeScript types
│
├── 📂 products/                       # Produtos
│   ├── 📄 api.ts                      # Product API
│   ├── 📄 index.ts                    # Export module
│   └── 📄 types.ts                    # Product types
│
├── 📂 sales/                          # Vendas
│   ├── 📄 api.ts                      # Sales API
│   ├── 📄 index.ts                    # Export module
│   └── 📄 types.ts                    # Sales types
│
├── 📂 stock/                          # Stock
│   ├── 📄 api.ts                      # Stock API
│   ├── 📄 index.ts                    # Export module
│   └── 📄 types.ts                    # Stock types
│
├── 📂 users/                          # Utilizadores
│   ├── 📄 api.ts                      # Users API
│   ├── 📄 index.ts                    # Export module
│   └── 📄 types.ts                    # User types
│
└── 📂 water/                          # Água
    ├── 📄 api.ts                      # Water API
    ├── 📄 index.ts                    # Export module
    └── 📄 types.ts                    # Water types
```

### 📁 lib/ - Utilities & Helpers

```
lib/
├── 📂 auth/                           # Authentication utilities
│   ├── 📄 guards.ts                   # Route guards
│   ├── 📄 rbac.ts                     # Role-based access control
│   └── 📄 session.ts                  # Session management
│
├── 📂 constants/
│   └── 📄 index.ts                    # App constants
│
├── 📂 http/                           # HTTP utilities
│   ├── 📄 client.ts                   # Axios instance
│   └── 📄 endpoints.ts                # API endpoints URLs
│
└── 📂 utils/
    └── 📄 index.ts                    # Utility functions
```

### 📁 store/ - State Management

```
store/
├── 📄 auth.store.ts                   # Auth state (Zustand/Redux)
└── 📄 ui.store.ts                     # UI state (theme, modals, etc)
```

### 📁 styles/ - Stylesheets

```
styles/
└── 📄 globals.css                     # Tailwind + global styles
```

### 📁 public/ - Static Assets

```
public/
├── 📂 images/                         # Images (various)
├── 📂 icons/                          # Icon assets
├── 📄 (favicon files)
└── (outros assets estáticos)
```

### 📁 src-tauri/ - Tauri Desktop Runtime

```
src-tauri/
├── 📄 build.rs                        # Build script
├── 📄 Cargo.toml                      # Rust dependencies
├── 📄 tauri.conf.json                 # Tauri configuration
│
├── 📂 capabilities/
│   └── 📄 default.json                # Permission capabilities
│
├── 📂 icons/
│   ├── 📄 icon.png
│   ├── 📄 icon.icns                   # macOS icon
│   └── (other icon formats)
│
└── 📂 src/                            # Rust source
    ├── 📄 lib.rs                      # Library entry
    └── 📄 main.rs                     # Main entry point
```

### Frontend - Dependências (package.json)

```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.10.1",
    "axios": "^1.13.5",
    "clsx": "^2.1.1",
    "framer-motion": "^12.34.0",
    "gsap": "^3.14.2",
    "i18n": "^0.15.3",
    "lucide": "^0.564.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "swiper": "^12.1.0",
    "webpack": "^5.88.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@tauri-apps/cli": "^2.10.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## 🔧 API BACKEND - ESTRUTURA COMPLETA

### Localização
`apps/api/auth/app/`

### Stack Tecnológico (Java)
- **Framework**: Spring Boot 4.0.2
- **Linguagem**: Java 21
- **Build Tool**: Maven
- **Database**: PostgreSQL
- **Autenticação**: JWT (JJWT 0.12.6)
- **Group ID**: com.custcoding.estaleiromavingue
- **Artifact ID**: App

### Raiz Global (Root Files)

```
auth/
├── 📄 mvnw                            # Maven wrapper (Linux/Mac)
├── 📄 mvnw.cmd                        # Maven wrapper (Windows)
├── 📄 pom.xml                         # Maven dependencies & config
└── 📄 README.md                       # Backend documentation
```

### 📁 src/main/java - FONTE JAVA COMPLETA

```
src/main/java/com/custcoding/estaleiromavingue/App/

├── 📄 AppApplication.java             # Spring Boot main class

├── 📂 auth/                           # AUTENTICAÇÃO
│   ├── 📄 AuthController.java
│   ├── 📄 AuthService.java
│   └── 📂 dto/
│       ├── 📄 LoginRequest.java
│       ├── 📄 LoginResponse.java
│       └── 📄 MeResponse.java
│
├── 📂 users/                          # GESTÃO DE UTILIZADORES
│   ├── 📄 AppUser.java                # Entity
│   ├── 📄 AppUserController.java
│   ├── 📄 AppUserService.java
│   ├── 📄 AppUserRepository.java
│   ├── 📄 UsersController.java
│   ├── 📄 UsersService.java
│   ├── 📄 Role.java                   # Enum (ADMIN, STAFF, CLIENTE)
│   └── 📂 dto/
│       ├── 📄 UserCreateDTO.java
│       ├── 📄 UserCreateRequest.java
│       ├── 📄 UserResponse.java
│       ├── 📄 UserResponseDTO.java
│       ├── 📄 UserUpdateDTO.java
│       └── 📄 UserUpdateRequest.java
│
├── 📂 products/                       # GESTÃO DE PRODUTOS
│   ├── 📄 Product.java                # Entity
│   ├── 📄 ProductController.java
│   ├── 📄 ProductsController.java
│   ├── 📄 ProductService.java
│   ├── 📄 ProductsService.java
│   ├── 📄 ProductRepository.java
│   └── 📂 dto/
│       ├── 📄 ProductCreateDTO.java
│       ├── 📄 ProductCreateRequest.java
│       ├── 📄 ProductResponse.java
│       ├── 📄 ProductResponseDTO.java
│       ├── 📄 ProductUpdateDTO.java
│       └── 📄 ProductUpdateRequest.java
│
├── 📂 models/                         # ENTIDADES DE NEGÓCIO
│   ├── 📄 Adress.java                 # Endereços
│   ├── 📄 CustomerProduct.java        # Relação Cliente-Produto
│   ├── 📄 CustomerWater.java          # Cliente com Ligação Água
│   ├── 📄 FacturaAgua.java            # Faturas de Água
│   ├── 📄 FacturaCompra.java          # Faturas de Compra
│   ├── 📄 Ferragem.java               # Hardware/Ferramentas
│   ├── 📄 FM.java
│   ├── 📄 Funcionario.java            # Funcionários/Staff
│   ├── 📄 ItemVenda.java              # Itens de Venda
│   ├── 📄 LeituraAgua.java            # Leituras de Consumo
│   ├── 📄 LigacaoAgua.java            # Ligações de Água
│   ├── 📄 MovimentoStock.java         # Movimentos de Inventário
│   ├── 📄 Owner.java                  # Proprietários
│   ├── 📄 Product.java                # Produtos
│   ├── 📄 Stock.java                  # Stock/Inventário
│   ├── 📄 User.java
│   ├── 📄 Venda.java                  # Vendas/Pedidos
│   └── 📂 status/                     # Enums de Status
│       ├── 📄 EstadoLigacao.java      # ATIVO, INATIVO, SUSPENSO
│       ├── 📄 EstadoPagamento.java    # PAGO, PENDENTE, ATRASADO
│       ├── 📄 FormaPagamento.java     # DINHEIRO, CHEQUE, CARTAO, ...
│       ├── 📄 TipoMovimento.java      # ENTRADA, SAIDA
│       └── 📄 Unit.java               # KG, LITRO, METRO, UNIDADE
│
├── 📂 controllers/                    # ENDPOINTS REST
│   ├── 📄 AdressController.java
│   ├── 📄 CustomerController.java
│   ├── 📄 CustomerWaterController.java
│   ├── 📄 FerragemController.java
│   └── 📄 ProductController.java
│
├── 📂 services/                       # LÓGICA DE NEGÓCIO
│   ├── 📄 AdressService.java
│   ├── 📄 CustomerService.java
│   ├── 📄 FerragemService.java
│   └── 📄 ProductService.java
│
├── 📂 repositories/                   # DATA ACCESS LAYER (JPA)
│   ├── 📄 AdressRepository.java       # extends JpaRepository
│   ├── 📄 CustomerRepository.java
│   ├── 📄 FerragemRepository.java
│   ├── 📄 FuncionarioRepository.java
│   ├── 📄 ProductRepository.java
│   └── 📄 ProprietarioRepository.java
│
├── 📂 dtos/                           # DATA TRANSFER OBJECTS
│   ├── 📂 adress/
│   │   ├── 📄 AdressCreateDTO.java
│   │   └── 📄 AdressResponseDTO.java
│   ├── 📂 customer/
│   │   ├── 📄 CustomerCreateDTO.java
│   │   └── 📄 CustomerResponseDTO.java
│   ├── 📂 customer_water/
│   │   ├── 📄 CustomerWaterCreateDTO.java
│   │   └── 📄 CustomerWaterResponseDTO.java
│   ├── 📂 ferragem/
│   │   ├── 📄 FerragemCreateDTO.java
│   │   └── 📄 FerragemResponseDTO.java
│   └── 📂 product/
│       ├── 📄 ProductCreateDTO.java
│       └── 📄 ProductResponseDTO.java
│
├── 📂 security/                       # JWT & AUTENTICAÇÃO
│   ├── 📄 JwtAuthFilter.java          # Request filter para JWT
│   └── 📄 JwtService.java             # Token generation/validation
│
├── 📂 mappers/                        # ENTITY ↔ DTO CONVERSION
│   ├── 📄 AdressMapper.java
│   ├── 📄 CustomerMapper.java
│   ├── 📄 FerragemMapper.java
│   └── 📄 ProductMapper.java
│
├── 📂 config/                         # CONFIGURAÇÃO SPRING
│   ├── 📄 SecurityConfig.java         # Spring Security setup
│   ├── 📄 CorsConfig.java             # CORS configuration
│   └── 📄 SeedData.java               # Data initialization
│
├── 📂 common/                         # UTILITÁRIOS COMUNS
│   ├── 📄 ApiError.java               # Error response model
│   ├── 📄 GlobalExceptionHandler.java # @ControllerAdvice
│   └── 📄 SeedData.java
│
└── 📂 errors/                         # TRATAMENTO DE ERROS
    ├── 📄 ApiError.java
    └── 📄 GlobalExceptionHandler.java
```

### 📁 src/main/resources - CONFIGURAÇÕES

```
src/main/resources/
└── 📄 application.yaml                # Spring Boot config
```

### 📁 src/test/java - TESTES UNITÁRIOS

```
src/test/java/com/
└── (Testes das classes principais)
```

### 📁 target/ - BUILD OUTPUT

```
target/
├── 📂 classes/                        # Classes compiladas
│   ├── 📄 application.yaml
│   └── 📂 com/custcoding/
│       └── (compiled .class files)
├── 📂 generated-sources/
│   └── 📂 annotations/
└── (outras pastas de build)
```

### Backend - Dependências Maven (pom.xml)

```xml
<dependencies>
  <!-- CORE FRAMEWORK -->
  <spring-boot-starter-web/>          <!-- REST API -->
  <spring-boot-starter-data-jpa/>     <!-- ORM/JPA -->
  <spring-boot-starter-validation/>   <!-- Bean validation -->
  <spring-boot-starter-security/>     <!-- Security -->

  <!-- DATABASE -->
  <postgresql/>                        <!-- PostgreSQL driver -->

  <!-- JWT AUTHENTICATION -->
  <jjwt-api>0.12.6</jjwt-api>        <!-- JWT API -->
  <jjwt-impl>0.12.6</jjwt-impl>      <!-- JWT impl -->
  <jjwt-jackson>0.12.6</jjwt-jackson><!-- Jackson support -->

  <!-- UTILITIES -->
  <lombok/>                            <!-- Annotations -->

  <!-- TESTING -->
  <spring-boot-starter-test/>         <!-- JUnit, Mockito -->
</dependencies>
```

### application.yaml - Configuração Completa

```yaml
server:
  port: 8080

spring:
  application:
    name: EstaleiroMavingue

  datasource:
    url: jdbc:postgresql://localhost:5432/mavingue
    username: postgres
    password: 852654
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update                 # Auto-create/update schema
    properties:
      hibernate:
        format_sql: true               # Pretty print SQL
        dialect: org.hibernate.dialect.PostgreSQLDialect
    show-sql: true
    open-in-view: false

  jackson:
    serialization:
      write-dates-as-timestamps: false

app:
  jwt:
    secret: "fdsfu^%&^%DSgfUY^F&DS FDSsdfds46fds46f5sfds^&"
    expiresMinutes: 120
    algorithms: HS256

logging:
  level:
    root: INFO
    com.custcoding: DEBUG
```

---
      ddl-auto: update  # Auto-schema management
    properties:
      hibernate:
        format_sql: true
    open-in-view: false

app:
  jwt:
    secret: "fdsfu^%&^%DSgfUY^F&DS FDSsdfds46fds46f5sfds^&"
    expiresMinutes: 120
```

---

## 📊 Entidades & Modelos de Dados

### Principais Entidades

| Entidade | Descrição | Repositório |
|----------|-----------|-------------|
| **AppUser** | Utilizador da aplicação | AppUserRepository |
| **User** | Utilizador genérico | - |
| **Product** | Produto do catálogo | ProductRepository |
| **Adress** | Endereço | AdressRepository |
| **Funcionario** | Funcionário/Staff | FuncionarioRepository |
| **Owner** | Proprietário | ProprietarioRepository |
| **Ferragem** | Hardware/Ferramenta | FerragemRepository |

### Entidades de Negócio

| Entidade | Descrição |
|----------|-----------|
| **Venda** | Venda/Pedido |
| **ItemVenda** | Item individual da venda |
| **Stock** | Inventário de produtos |
| **MovimentoStock** | Entrada/Saída de stock |
| **FacturaCompra** | Fatura de compra |
| **FacturaAgua** | Fatura de water/água |
| **LigacaoAgua** | Ligação de abastecimento de agua |
| **LeituraAgua** | Leitura de consumo |
| **CustomerWater** | Cliente com ligação de agua |
| **CustomerProduct** | Relação cliente-produto |

### Enums de Status

| Enum | Valores | Uso |
|------|---------|-----|
| **EstadoLigacao** | ATIVO, INATIVO, SUSPENSO | Ligação de água |
| **EstadoPagamento** | PAGO, PENDENTE, ATRASADO | Facturas/Vendas |
| **FormaPagamento** | DINHEIRO, CHEQUE, CARTAO, ... | Transações |
| **TipoMovimento** | ENTRADA, SAIDA | Movimentos stock |
| **Unit** | KG, LITRO, METRO, UNIDADE | Unidade de medida |

---

## 🔐 Segurança & Autenticação

### JWT Flow

1. **LoginRequest** → AuthController
2. AuthService valida credenciais
3. **JwtService** gera token JWT
4. **LoginResponse** retorna token ao cliente
5. **JwtAuthFilter** valida token em requisições subsequentes
6. **SecurityConfig** configura chain de segurança

### Recursos Protegidos
- Todos os endpoints, exceto login e públicos
- Token enviado no header: `Authorization: Bearer <token>`

---

## 🔗 API Endpoints (Resumo)

### Autenticação
- `POST /auth/login` - Login (LoginRequest → LoginResponse)
- `GET /auth/me` - Informações do utilizador (MeResponse)

### Utilizadores
- `GET /users` - Listar utilizadores
- `POST /app-users` - Criar utilizador
- `GET /app-users/{id}` - Obter utilizador
- `PUT /app-users/{id}` - Atualizar utilizador
- `DELETE /app-users/{id}` - Eliminar utilizador

### Produtos
- `GET /products` - Listar produtos
- `POST /products` - Criar produto
- `GET /products/{id}` - Obter produto
- `PUT /products/{id}` - Atualizar produto
- `DELETE /products/{id}` - Eliminar produto

### Clientes
- `GET /customers` - Listar clientes
- `POST /customers` - Criar cliente
- `GET /customers/{id}` - Obter cliente

### Áqua (Water)
- `GET /customers/{id}/water` - Dados de agua do cliente
- `POST /water-readings` - Registar leitura

### Ferragem
- `GET /ferragem` - Listar ferramenta/hardware
- `POST /ferragem` - Criar ferragem

### Endereços
- `GET /adress` - Listar endereços
- `POST /adress` - Criar endereço
- `DELETE /adress/{id}` - Eliminar endereço

---

## 🛠️ Padrões & Arquitetura

### Arquitetura em Camadas

```
Controller (REST endpoints)
    ↓
Service (Business logic)
    ↓
Repository (Data access via JPA)
    ↓
Entity/Model (Database Table)
```

### Padrões Utilizados

1. **DTO Pattern** - Transfer objects para API
2. **Mapper Pattern** - Entity ↔ DTO conversão
3. **Repository Pattern** - Data access abstraction
4. **Service Layer** - Business logic encapsulation
5. **Global Exception Handling** - Consistent error responses
6. **RBAC** - Role-based access control via Role enum
7. **JWT Authentication** - Stateless security

### Validação

- **Spring Validation** (`spring-boot-starter-validation`)
- Annotations: `@NotNull`, `@NotBlank`, `@Size`, etc
- Global exception handler para validation errors

---

## 🔄 Fluxo de Dados Backend

```
HTTP Request
    ↓
JwtAuthFilter (validate token)
    ↓
SecurityConfig (check permissions)
    ↓
Controller (route to handler)
    ↓
Service (business logic)
    ↓
Mapper (DTO → Entity)
    ↓
Repository (JPA query)
    ↓
PostgreSQL Database
    ↓
(Response back through stack)
    ↓
Mapper (Entity → DTO)
    ↓
Controller (return JSON)
    ↓
HTTP Response
```

---

## 📝 Configuração de Ambiente

### Database
- **Host**: localhost:5432
- **Database**: mavingue
- **User**: postgres
- **Password**: 852654

### JWT
- **Secret Key**: `fdsfu^%&^%DSgfUY^F&DS FDSsdfds46fds46f5sfds^&`
- **Expiration**: 120 minutos

### Hibernate
- **DDL**: `update` (auto-schema)
- **SQL Formatting**: enabled

---

## 🚀 Build & Deploy

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run

# Test
mvn test

# Package
mvn clean package
```

---

---

## 🗂️ Estrutura de Módulos & Funcionalidades

### Frontend - Organização por Features

| Feature | Caminho | Responsabilidade |
|---------|---------|-----------------|
| **Auth** | `features/auth/` | Autenticação, login, JWT |
| **Users** | `features/users/` | Gestão de utilizadores |
| **Products** | `features/products/` | Catálogo e gestão de produtos |
| **Stock** | `features/stock/` | Controle de inventário |
| **Sales** | `features/sales/` | Gestão de vendas/pedidos |
| **Water** | `features/water/` | Gestão de recursos hídricos |

### Frontend - Páginas (App Router)

**Protegidas** (`(protected)/`):
- `/admin` - Dashboard administrativo
  - `/admin/agua` - Gestão de água
  - `/admin/produtos` - Gestão de produtos
  - `/admin/stock` - Gestão de stock
  - `/admin/utilizadores` - Gestão de utilizadores
  - `/admin/vendas` - Gestão de vendas
  - `/admin/relatorios` - Relatórios
- `/cliente` - Portal do cliente
- `/staff` - Portal do staff
- `/forbidden` - Página de acesso negado

**Públicas** (`(public)/`):
- `/` - Home page
- `/auth` - Autenticação
- `/catalogo` - Catálogo público

---

## 🔐 Controle de Acesso (RBAC)

**Arquivo**: `lib/auth/rbac.ts`

Roles suportados:
- `ADMIN` - Acesso total
- `STAFF` - Gestão operacional
- `CLIENTE` - Acesso ao portal de cliente

---

## 🔌 Integração API

**Cliente HTTP**: `lib/http/client.ts` (Axios)

**Endpoints Base**: `lib/http/endpoints.ts`

Cada feature possui:
- `api.ts` - Chamadas HTTP
- `types.ts` - TypeScript interfaces
- `hooks.ts` (apenas auth) - React hooks customizados

---

## 📦 Estado Global (Store)

**Tecnologia**: Zustand (ou similar)

- `auth.store.ts` - Autenticação e sessão
- `ui.store.ts` - Estado da UI (tema, modais, etc.)

---

## 🎨 Componentes Reutilizáveis

### UI Base
- `Button.tsx` - Botão (primário, secundário, danger)
- `Input.tsx` - Input de texto
- `Modal.tsx` - Modal dialog
- `Toast.tsx` - Notificações
- `State.tsx` - Carregamento/vazio/erro

### Layout
- `Topbar.tsx` - Barra superior
- `Sidebar.tsx` - Menu lateral
- `Breadcrumbs.tsx` - Navegação de breadcrumbs
- `RoleGate.tsx` - Gate de acesso por role

### Compostos
- `ExampleChart.tsx` - Gráficos
- `ExampleForm.tsx` - Formulários
- `ExampleTable.tsx` - Tabelas

---

## 🖥️ Desktop (Tauri)

**Localização**: `src-tauri/`

- Wrapper desktop para aplicação Next.js
- Configurado em `tauri.conf.json`
- Runtime Rust em `src/lib.rs` e `src/main.rs`

---

## 🔄 Fluxo de Dados

```
User Request
    ↓
Next.js Pages/Layout
    ↓
Components (UI)
    ↓
Features API calls (axios)
    ↓
HTTP Client (lib/http/client.ts)
    ↓
Backend API (Java Spring Boot)
    ↓
Database
```

---

## 🚀 Scripts Disponíveis

```bash
# Frontend
npm run dev        # Desenvolvimento Next.js
npm run build      # Build para produção
npm run start      # Iniciar servidor
npm run lint       # Linting com ESLint

# Desktop (Tauri)
npm run tauri:dev  # Desenvolvimento desktop
npm run tauri:build # Build desktop

# Backend (Maven)
mvn clean build    # Build Java
mvn test          # Testes
```

---

## 🔗 Principais Configurações

| Arquivo | Proposito |
|---------|-----------|
| `next.config.ts` | Configuração Next.js |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.ts` | Tailwind CSS config |
| `eslint.config.mjs` | ESLint rules |
| `middleware.ts` | Next.js middleware (auth) |
| `tauri.conf.json` | Configuração Tauri |
| `pom.xml` | Dependências Maven/Java |
| `application.yaml` | Configuração Spring Boot |

---

## 📝 Notas Importantes

1. **Autenticação**: Gerenciada em `lib/auth/` com proteção via middleware
2. **Estilo**: Tailwind CSS + PostCSS
3. **Animações**: Framer Motion + GSAP
4. **i18n**: Suporte multi-idioma configurado
5. **Componentes**: Lucide para ícones
6. **Carrossel**: Swiper para sliders
7. **Desktop**: Tauri para versão nativa Windows/Linux/Mac

---

*Última atualização: 17 de Fevereiro de 2026*
