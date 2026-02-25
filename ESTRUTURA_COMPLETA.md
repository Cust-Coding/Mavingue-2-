# Estrutura Completa do Sistema - EstaleiroMavingue

## 📋 Visão Geral
Projeto full-stack com arquitetura de microsserviços. Frontend em Next.js com Tauri para desktop e Backend em Java Spring Boot.

---

## 🏗️ Estrutura Raiz do Projeto

```
EstaleiroMavingue/
├── 📄 README.md                       # Documentação geral
├── 📄 estrutura.md                    # Estrutura detalhada
├── 📄 ESTRUTURA_COMPLETA.md          # Este arquivo
├── 📂 .git/                           # Git repository
├── 📄 .gitignore
└── 📂 apps/
    ├── 📂 api/
    │   └── 📂 auth/
    │       └── 📂 app/               # Backend Spring Boot
    └── 📂 frontend/
        └── 📂 software/
            └── 📂 mavingue/          # Frontend Next.js + Tauri
```

---

# 📱 FRONTEND - DOCUMENTAÇÃO COMPLETA

## Localização: `apps/frontend/software/mavingue/`

### ✅ Ficheiros de Raiz

| Ficheiro | Descrição |
|----------|-----------|
| `package.json` | Dependências e scripts NPM/pnpm |
| `pnpm-lock.yaml` | Lockfile do pnpm |
| `tsconfig.json` | Configuração TypeScript |
| `next.config.ts` | Configuração Next.js |
| `eslint.config.mjs` | Regras ESLint |
| `postcss.config.mjs` | Configuração PostCSS/Tailwind |
| `next-env.d.ts` | Type declarations Next.js |
| `middleware.ts` | Middleware Next.js (autenticação) |
| `README.md` | Documentação do frontend |
| `Git_&&_GitHub_Basics.md` | Guia Git/GitHub |

### 📁 app/ - Next.js App Router (Páginas & Layouts)

#### **Raiz Global**
```
app/
├── layout.tsx                    # Root layout
├── globals.css                   # Estilos globais
└── favicon.ico                   # Favicon do site
```

#### **(protected)/ - Rotas Protegidas**

```
(protected)/
├── layout.tsx                    # Protected wrapper layout

├── admin/                        # 🔧 PAINEL ADMINISTRATIVO
│   ├── page.tsx                  # Admin home
│   ├── layout.tsx                # Admin layout
│   │
│   ├── agua/                     # GESTÃO DE ÁGUA
│   │   ├── page.tsx              # Water overview
│   │   ├── clientes/
│   │   │   └── page.tsx          # Water customers list
│   │   ├── contratos/
│   │   │   └── page.tsx          # Water contracts list
│   │   ├── faturas/
│   │   │   └── page.tsx          # Water invoices list
│   │   └── leituras/
│   │       └── page.tsx          # Water readings list
│   │
│   ├── produtos/                 # GESTÃO DE PRODUTOS
│   │   ├── page.tsx              # Products list
│   │   ├── novo/
│   │   │   └── page.tsx          # Create product form
│   │   └── [id]/
│   │       ├── page.tsx          # Product details
│   │       └── editar/
│   │           └── page.tsx      # Edit product form
│   │
│   ├── stock/                    # GESTÃO DE STOCK
│   │   ├── page.tsx              # Stock dashboard
│   │   └── movimentos/
│   │       └── page.tsx          # Stock movements list
│   │
│   ├── utilizadores/             # GESTÃO DE UTILIZADORES
│   │   ├── page.tsx              # Users list
│   │   ├── novo/
│   │   │   └── page.tsx          # Create user form
│   │   └── [id]/
│   │       ├── page.tsx          # User details
│   │       └── editar/
│   │           └── page.tsx      # Edit user form
│   │
│   ├── vendas/                   # GESTÃO DE VENDAS
│   │   ├── page.tsx              # Sales list
│   │   └── nova/
│   │       └── page.tsx          # Create sale form
│   │
│   └── relatorios/               # RELATÓRIOS
│       ├── page.tsx              # Reports dashboard
│       ├── agua/
│       │   └── page.tsx          # Water reports
│       ├── stock/
│       │   └── page.tsx          # Stock reports
│       └── vendas/
│           └── page.tsx          # Sales reports
│
├── cliente/                      # 👤 PORTAL DO CLIENTE
│   ├── page.tsx                  # Cliente home
│   ├── layout.tsx                # Cliente layout
│   ├── agua/                     # Cliente - Water section
│   │   ├── page.tsx              # Water dashboard
│   │   ├── faturas/
│   │   │   └── page.tsx          # My water invoices
│   │   └── pagamentos/
│   │       └── page.tsx          # Water payments
│   ├── compras/
│   │   └── page.tsx              # My orders/purchases
│   └── perfil/
│       └── page.tsx              # Profile settings
│
├── staff/                        # 👷 PORTAL DO STAFF
│   ├── page.tsx                  # Staff home
│   ├── layout.tsx                # Staff layout
│   ├── agua/
│   │   └── page.tsx              # Staff water management
│   ├── stock/
│   │   └── page.tsx              # Staff stock management
│   └── vendas/
│       └── page.tsx              # Staff sales management
│
└── forbidden/                    # ⛔ ACESSO NEGADO
    └── page.tsx                  # Forbidden page
```

#### **(public)/ - Rotas Públicas**

```
(public)/
├── page.tsx                      # Home page (landing)
│
├── auth/                         # AUTENTICAÇÃO
│   ├── login/
│   │   └── page.tsx              # Login form
│   ├── logout/
│   │   └── page.tsx              # Logout handler
│   └── reset-password/
│       └── page.tsx              # Password reset form
│
└── catalogo/
    └── page.tsx                  # Public products catalog
```

#### **api/ - API Routes (Optional)**

```
api/
└── proxy/                        # API proxy handlers (if needed)
```

### 📁 components/ - Componentes Reutilizáveis

```
components/

├── 📂 charts/
│   ├── ExampleChart.tsx
│   └── (outras variações de gráficos)
│
├── 📂 forms/
│   ├── ExampleForm.tsx
│   └── (LoginForm, ProductForm, etc)
│
├── 📂 layout/
│   ├── Breadcrumbs.tsx           # Navegação breadcrumbs
│   ├── RoleGate.tsx              # Permission gate (role-based)
│   ├── Sidebar.tsx               # Menu lateral
│   └── Topbar.tsx                # Barra superior
│
├── 📂 tables/
│   ├── ExampleTable.tsx
│   └── (ProductsTable, UsersTable, etc)
│
└── 📂 ui/                        # UI Base Components
    ├── Button.tsx                # Botão (variants: primary|secondary|danger)
    ├── Input.tsx                 # Input de texto
    ├── Modal.tsx                 # Modal/Dialog
    ├── State.tsx                 # Loading/Empty/Error states
    └── Toast.tsx                 # Toast notifications
```

### 📁 features/ - Feature Modules (State + API)

Cada feature contém API calls, types, e hooks.

```
features/

├── 📂 auth/
│   ├── api.ts                    # Login, logout, token refresh
│   ├── hooks.ts                  # useAuth() custom hook
│   └── types.ts                  # Auth interfaces
│
├── 📂 products/
│   ├── api.ts                    # CRUD products
│   ├── index.ts                  # Module exports
│   └── types.ts                  # Product interfaces
│
├── 📂 sales/
│   ├── api.ts                    # Sales CRUD
│   ├── index.ts                  # Module exports
│   └── types.ts                  # Sales interfaces
│
├── 📂 stock/
│   ├── api.ts                    # Stock management
│   ├── index.ts                  # Module exports
│   └── types.ts                  # Stock interfaces
│
├── 📂 users/
│   ├── api.ts                    # Users CRUD
│   ├── index.ts                  # Module exports
│   └── types.ts                  # User interfaces
│
└── 📂 water/
    ├── api.ts                    # Water management
    ├── index.ts                  # Module exports
    └── types.ts                  # Water interfaces
```

### 📁 lib/ - Utilities & Helpers

```
lib/

├── 📂 auth/
│   ├── guards.ts                 # Route guards/middleware
│   ├── rbac.ts                   # Role-Based Access Control
│   └── session.ts                # Session management
│
├── 📂 constants/
│   └── index.ts                  # App-wide constants
│
├── 📂 http/
│   ├── client.ts                 # Axios instance config
│   └── endpoints.ts              # API base URLs
│
└── 📂 utils/
    └── index.ts                  # Helper functions (formatters, validators, etc)
```

### 📁 store/ - State Management (Zustand or Redux)

```
store/
├── auth.store.ts                # Auth state (user, token, roles)
└── ui.store.ts                  # UI state (theme, modals, notifications)
```

### 📁 styles/ - Global Stylesheets

```
styles/
└── globals.css                  # Tailwind + custom CSS
```

### 📁 public/ - Static Assets

```
public/
├── images/                      # Images (PNG, JPG, WebP)
├── icons/                       # Custom icons
├── fonts/                       # Web fonts
└── (outros assets)
```

### 📁 src-tauri/ - Tauri Desktop Application

```
src-tauri/
├── build.rs                     # Rust build script
├── Cargo.toml                   # Rust dependencies
├── tauri.conf.json              # Tauri configuration
│
├── capabilities/
│   └── default.json             # Permission capabilities
│
├── icons/
│   ├── icon.png                 # Icon 512x512
│   ├── icon.icns                # macOS icon
│   ├── icon.ico                 # Windows icon
│   └── (other icon formats)
│
└── src/
    ├── lib.rs                   # Library entry point
    └── main.rs                  # Main entry point
```

### Frontend - Dependências Principais

```json
{
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "typescript": "^5",
    "tailwindcss": "^4",
    "axios": "^1.13.5",
    "clsx": "^2.1.1",
    "framer-motion": "^12.34.0",
    "gsap": "^3.14.2",
    "lucide": "^0.564.0",
    "swiper": "^12.1.0",
    "i18n": "^0.15.3",
    "@tauri-apps/api": "^2.10.1",
    "webpack": "^5.88.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@tauri-apps/cli": "^2.10.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6"
  }
}
```

---

# 🔧 BACKEND - DOCUMENTAÇÃO COMPLETA

## Localização: `apps/api/auth/app/`

### Stack Tecnológico
| Item | Versão |
|------|--------|
| Framework | Spring Boot 4.0.2 |
| Linguagem | Java 21 |
| Build Tool | Maven |
| Database | PostgreSQL |
| Authentication | JWT (JJWT 0.12.6) |
| ORM | JPA/Hibernate |
| Group ID | com.custcoding.estaleiromavingue |
| Artifact ID | App |

### ✅ Ficheiros de Raiz

| Ficheiro | Descrição |
|----------|-----------|
| `mvnw` | Maven wrapper (Linux/Mac) |
| `mvnw.cmd` | Maven wrapper (Windows) |
| `pom.xml` | Dependências Maven e build config |
| `README.md` | Documentação backend |

### 📁 src/main/java - Código Fonte Java

```
src/main/java/com/custcoding/estaleiromavingue/App/

├── 📄 AppApplication.java            # Spring Boot main class (@SpringBootApplication)
│
├── 📂 auth/                          # AUTENTICAÇÃO
│   ├── 📄 AuthController.java        # @RestController /auth
│   ├── 📄 AuthService.java           # @Service (login logic)
│   └── 📂 dto/
│       ├── 📄 LoginRequest.java      # Request body
│       ├── 📄 LoginResponse.java     # Response com JWT token
│       └── 📄 MeResponse.java        # Current user info
│
├── 📂 users/                         # GESTÃO DE UTILIZADORES
│   ├── 📄 AppUser.java               # @Entity (User table)
│   ├── 📄 AppUserController.java     # @RestController /app-users
│   ├── 📄 AppUserService.java        # @Service (business logic)
│   ├── 📄 AppUserRepository.java     # @Repository (extends JpaRepository)
│   ├── 📄 UsersController.java       # @RestController /users
│   ├── 📄 UsersService.java
│   ├── 📄 Role.java                  # @Enum (ADMIN, STAFF, CLIENTE)
│   └── 📂 dto/
│       ├── 📄 UserCreateDTO.java
│       ├── 📄 UserCreateRequest.java
│       ├── 📄 UserResponse.java
│       ├── 📄 UserResponseDTO.java
│       ├── 📄 UserUpdateDTO.java
│       └── 📄 UserUpdateRequest.java
│
├── 📂 products/                      # GESTÃO DE PRODUTOS
│   ├── 📄 Product.java               # @Entity
│   ├── 📄 ProductController.java     # @RestController /products
│   ├── 📄 ProductsController.java    # Alternative controller
│   ├── 📄 ProductService.java        # @Service
│   ├── 📄 ProductsService.java
│   ├── 📄 ProductRepository.java     # @Repository
│   └── 📂 dto/
│       ├── 📄 ProductCreateDTO.java
│       ├── 📄 ProductCreateRequest.java
│       ├── 📄 ProductResponse.java
│       ├── 📄 ProductResponseDTO.java
│       ├── 📄 ProductUpdateDTO.java
│       └── 📄 ProductUpdateRequest.java
│
├── 📂 models/                        # ENTIDADES DE NEGÓCIO
│   ├── 📄 Adress.java                # @Entity (Endereços)
│   ├── 📄 CustomerProduct.java       # @Entity (Cliente-Produto)
│   ├── 📄 CustomerWater.java         # @Entity (Cliente Água)
│   ├── 📄 FacturaAgua.java           # @Entity (Fatura Água)
│   ├── 📄 FacturaCompra.java         # @Entity (Fatura Compra)
│   ├── 📄 Ferragem.java              # @Entity (Hardware)
│   ├── 📄 FM.java
│   ├── 📄 Funcionario.java           # @Entity (Funcionários)
│   ├── 📄 ItemVenda.java             # @Entity (Item de Venda)
│   ├── 📄 LeituraAgua.java           # @Entity (Leitura Consumo)
│   ├── 📄 LigacaoAgua.java           # @Entity (Ligação Água)
│   ├── 📄 MovimentoStock.java        # @Entity (Movimento Stock)
│   ├── 📄 Owner.java                 # @Entity (Proprietários)
│   ├── 📄 Stock.java                 # @Entity (Inventário)
│   ├── 📄 User.java
│   ├── 📄 Venda.java                 # @Entity (Vendas)
│   └── 📂 status/                    # Enums de Status
│       ├── 📄 EstadoLigacao.java     # ATIVO, INATIVO, SUSPENSO
│       ├── 📄 EstadoPagamento.java   # PAGO, PENDENTE, ATRASADO
│       ├── 📄 FormaPagamento.java    # DINHEIRO, CHEQUE, CARTAO, TRANSFERENCIA
│       ├── 📄 TipoMovimento.java     # ENTRADA, SAIDA
│       └── 📄 Unit.java              # KG, LITRO, METRO, UNIDADE
│
├── 📂 controllers/                   # REST ENDPOINTS
│   ├── 📄 AdressController.java      # GET/POST/PUT/DELETE /adress
│   ├── 📄 CustomerController.java    # GET/POST /customers
│   ├── 📄 CustomerWaterController.java # GET /customers/{id}/water
│   ├── 📄 FerragemController.java    # GET/POST /ferragem
│   └── 📄 ProductController.java     # GET/POST /products
│
├── 📂 services/                      # LÓGICA DE NEGÓCIO
│   ├── 📄 AdressService.java         # @Service
│   ├── 📄 CustomerService.java
│   ├── 📄 FerragemService.java
│   └── 📄 ProductService.java
│
├── 📂 repositories/                  # DATA ACCESS - JPA
│   ├── 📄 AdressRepository.java      # extends JpaRepository<Address, Long>
│   ├── 📄 CustomerRepository.java
│   ├── 📄 FerragemRepository.java
│   ├── 📄 FuncionarioRepository.java
│   ├── 📄 ProductRepository.java
│   └── 📄 ProprietarioRepository.java
│
├── 📂 dtos/                          # DATA TRANSFER OBJECTS
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
├── 📂 security/                      # JWT & SEGURANÇA
│   ├── 📄 JwtAuthFilter.java         # @Component (OncePerRequestFilter)
│   └── 📄 JwtService.java            # @Service (generate/validate JWT)
│
├── 📂 mappers/                       # ENTITY ↔ DTO CONVERSION
│   ├── 📄 AdressMapper.java
│   ├── 📄 CustomerMapper.java
│   ├── 📄 FerragemMapper.java
│   └── 📄 ProductMapper.java
│
├── 📂 config/                        # CONFIGURAÇÃO SPRING
│   ├── 📄 SecurityConfig.java        # @Configuration (Spring Security)
│   ├── 📄 CorsConfig.java            # CORS setup
│   └── 📄 SeedData.java              # Data initialization
│
├── 📂 common/                        # UTILITÁRIOS COMUNS
│   ├── 📄 ApiError.java              # Error response model
│   ├── 📄 GlobalExceptionHandler.java # @ControllerAdvice
│   └── 📄 SeedData.java
│
└── 📂 errors/                        # TRATAMENTO DE ERROS
    ├── 📄 ApiError.java
    └── 📄 GlobalExceptionHandler.java
```

### 📁 src/main/resources - Configuração

```
src/main/resources/
└── application.yaml
```

**application.yaml Completo:**

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
      ddl-auto: update               # update | create | create-drop | validate
    properties:
      hibernate:
        format_sql: true
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
    org.hibernate.SQL: DEBUG
```

### 📁 src/test/java - Testes Unitários

```
src/test/java/com/custcoding/estaleiromavingue/App/
├── (JUnit tests)
├── (Integration tests)
└── (Controller tests)
```

### 📁 target/ - Build Output

```
target/
├── classes/                         # Compiled .class files
│   ├── application.yaml
│   └── com/custcoding/
│       └── (compiled classes)
├── generated-sources/
│   └── annotations/
├── surefire-reports/                # Test reports
└── (other build artifacts)
```

### Backend - Dependências Maven Completas

Arquivo: `pom.xml`

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.0.2</version>
  </parent>

  <groupId>com.custcoding.estaleiromavingue</groupId>
  <artifactId>App</artifactId>
  <version>0.0.1-SNAPSHOT</version>

  <properties>
    <java.version>21</java.version>
  </properties>

  <dependencies>
    <!-- WEB -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- JPA -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- VALIDATION -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- SECURITY -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- DATABASE -->
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
    </dependency>

    <!-- JWT -->
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-api</artifactId>
      <version>0.12.6</version>
    </dependency>
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-impl</artifactId>
      <version>0.12.6</version>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-jackson</artifactId>
      <version>0.12.6</version>
      <scope>runtime</scope>
    </dependency>

    <!-- LOMBOK -->
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>

    <!-- TESTING -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

---

## 📊 Entidades & Modelos de Dados

### Principais Entidades com Repositórios

| Entidade | Descrição | Repositório | Table |
|----------|-----------|-------------|-------|
| **AppUser** | Utilizador da app | AppUserRepository | app_user |
| **User** | User genérico | - | user |
| **Product** | Produto | ProductRepository | product |
| **Adress** | Endereço | AdressRepository | adress |
| **Funcionario** | Staff | FuncionarioRepository | funcionario |
| **Owner** | Proprietário | ProprietarioRepository | owner |
| **Ferragem** | Hardware | FerragemRepository | ferragem |

### Entidades de Negócio / Transacionais

| Entidade | Descrição | Relacionado |
|----------|-----------|-----------|
| **Venda** | Venda/Pedido | 1:N com ItemVenda |
| **ItemVenda** | Item individual | N:1 com Venda |
| **Stock** | Inventário | 1:1 com Product |
| **MovimentoStock** | Entrada/Saída | N:1 com Stock |
| **FacturaCompra** | Fatura compra | N:1 com Fornecedor |
| **FacturaAgua** | Fatura água | N:1 com LigacaoAgua |
| **LigacaoAgua** | Ligação água | N:1 com CustomerWater |
| **LeituraAgua** | Leitura consumo | N:1 com LigacaoAgua |
| **CustomerWater** | Cliente-Água | N:1 com AppUser |
| **CustomerProduct** | Cliente-Produto | N:1 com Product |

### Enums de Status

```java
EstadoLigacao {
  ATIVO, INATIVO, SUSPENSO
}

EstadoPagamento {
  PAGO, PENDENTE, ATRASADO
}

FormaPagamento {
  DINHEIRO, CHEQUE, CARTAO, TRANSFERENCIA
}

TipoMovimento {
  ENTRADA, SAIDA
}

Unit {
  KG, LITRO, METRO, UNIDADE, CAIXA
}

Role {
  ADMIN, STAFF, CLIENTE
}
```

---

## 🔐 Segurança & Autenticação JWT

### JWT Flow Completo

```
1. User login request
   POST /auth/login
   Body: { username, password }
          ↓
2. AuthController.login()
   → AuthService.authenticate()
   → Validate credentials
          ↓
3. JwtService.generateToken()
   → Create JWT with claims
   → Sign with secret
          ↓
4. LoginResponse
   { token, user, expiresIn }
   ← Return to client
          ↓
5. Subsequent requests
   Header: Authorization: Bearer <token>
          ↓
6. JwtAuthFilter
   → Extract token
   → Validate signature
   → Validate expiration
   → Extract claims
          ↓
7. SecurityConfig
   → Set user context
   → Check permissions
          ↓
8. Allow/Deny request
```

### Configuração JWT

- **Secret**: `fdsfu^%&^%DSgfUY^F&DS FDSsdfds46fds46f5sfds^&`
- **Expiração**: 120 minutos
- **Algoritmo**: HS256

---

## 🔗 API Endpoints Completos

### Autenticação
```
POST   /auth/login                  # LoginRequest → LoginResponse
GET    /auth/me                     # MeResponse (user info)
```

### Utilizadores
```
GET    /users                       # List all users
POST   /app-users                   # Create user (UserCreateRequest)
GET    /app-users/{id}              # Get user by ID
PUT    /app-users/{id}              # Update user
DELETE /app-users/{id}              # Delete user
```

### Produtos
```
GET    /products                    # List products
POST   /products                    # Create product
GET    /products/{id}               # Get product
PUT    /products/{id}               # Update product
DELETE /products/{id}               # Delete product
```

### Clientes
```
GET    /customers                   # List customers
POST   /customers                   # Create customer
GET    /customers/{id}              # Get customer
GET    /customers/{id}/water        # Water data
```

### Água (Water)
```
GET    /customers/{id}/water        # Customer water info
POST   /water-readings              # Create reading
GET    /water-readings              # List readings
GET    /ligacoes-agua               # List connections
GET    /facturas-agua               # List water invoices
```

### Ferragem (Hardware)
```
GET    /ferragem                    # List hardware
POST   /ferragem                    # Create hardware
GET    /ferragem/{id}               # Get hardware
PUT    /ferragem/{id}               # Update hardware
DELETE /ferragem/{id}               # Delete hardware
```

### Endereços
```
GET    /adress                      # List addresses
POST   /adress                      # Create address
GET    /adress/{id}                 # Get address
PUT    /adress/{id}                 # Update address
DELETE /adress/{id}                 # Delete address
```

---

## 🛠️ Padrões & Arquitetura Backend

### Layered Architecture

```
┌─────────────────────────────────┐
│    REST Controller Layer         │
│  (@RestController, @PostMapping) │
└────────────────┬────────────────┘
                 ↓
┌─────────────────────────────────┐
│    Service Layer                │
│  (@Service, business logic)     │
└────────────────┬────────────────┘
                 ↓
┌─────────────────────────────────┐
│    Mapper Layer                 │
│  (Entity ↔ DTO conversion)      │
└────────────────┬────────────────┘
                 ↓
┌─────────────────────────────────┐
│    Repository Layer             │
│  (JpaRepository, DB queries)    │
└────────────────┬────────────────┘
                 ↓
┌─────────────────────────────────┐
│    Entity/Model Layer           │
│  (@Entity, @Table)              │
└────────────────┬────────────────┘
                 ↓
┌─────────────────────────────────┐
│    PostgreSQL Database          │
└─────────────────────────────────┘
```

### Design Patterns Utilizados

1. **DTO Pattern** - Separate DTOs for requests/responses
2. **Mapper Pattern** - Entity↔DTO conversion helpers
3. **Repository Pattern** - JpaRepository abstraction
4. **Service Layer** - Encapsulate business logic
5. **Controller Layer** - REST endpoint exposure
6. **Global Exception Handling** - @ControllerAdvice
7. **JWT Authentication** - Stateless security
8. **RBAC** - Role-based access control

---

## 🚀 Build & Deploy Commands

```bash
# Build
mvn clean install
mvn clean package

# Run
mvn spring-boot:run

# Test
mvn test
mvn verify

# Skip tests
mvn clean package -DskipTests

# Create executable JAR
mvn clean package
java -jar target/App-0.0.1-SNAPSHOT.jar

# Run on specific port
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=9090"
```

---

## 💾 Database Configuration

### PostgreSQL Connection

```
Host: localhost
Port: 5432
Database: mavingue
Username: postgres
Password: 852654
```

### Hibernate Configuration

| Setting | Value |
|---------|-------|
| DDL Auto | update (auto-modify schema) |
| Format SQL | true |
| Show SQL | true |
| Dialect | PostgreSQLDialect |
| Open in View | false |

---

## 📱 Frontend Scripts

```bash
# Development
npm run dev              # Next.js dev server + HMR

# Build
npm run build            # Production build

# Production
npm run start            # Start server

# Linting
npm run lint             # Check code quality

# Tauri (Desktop)
npm run tauri:dev        # Dev desktop app
npm run tauri:build      # Build desktop app
```

---

## 📥 Instalação & Setup

### Frontend
```bash
cd apps/frontend/software/mavingue
pnpm install            # or npm install
npm run dev             # Start dev server
# Open http://localhost:3000
```

### Backend
```bash
cd apps/api/auth/app
mvn clean install
mvn spring-boot:run
# Server on http://localhost:8080
```

---

## 🔗 Integração Frontend-Backend

### HTTP Client Setup

**Frontend** (`lib/http/client.ts`):
```typescript
const client = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
```

### API Features Integration

Each feature module calls backend:

```
features/auth/api.ts        → POST /auth/login
features/users/api.ts       → GET/POST /app-users
features/products/api.ts    → GET/POST /products
features/sales/api.ts       → GET/POST /vendas
features/stock/api.ts       → GET/POST /stock
features/water/api.ts       → GET/POST /agua
```

---

## 📝 Git Workflow

```
main (production)
  ↓
develop (staging)
  ↓
feature/ (new features)
hotfix/ (urgent fixes)
```

---

*Última atualização: 17 de Fevereiro de 2026*
*Versão: 1.0 - Estrutura Completa*
