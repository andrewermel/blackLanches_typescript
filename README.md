# Black Lanches API - TypeScript

API RESTful para gerenciamento de ingredientes, porções e lanches, com autenticação JWT.

## 🚀 Quick Start

### Instalação

```bash
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blacklanches"
JWT_SECRET=uma_chave_bem_segura
```

### Rodando o Projeto

**Apenas o servidor:**

```bash
npm run dev
```

**Servidor + Frontend (Vite):**

```bash
npm run dev:all
```

**Testes:**

```bash
npm test              # Rodar testes uma vez
npm run test:watch   # Modo watch
```

## 📁 Estrutura do Projeto

```
src/
├── controllers/       # Controladores (validação + resposta)
├── services/         # Lógica de negócios (Prisma)
├── middlewares/      # JWT authentication
├── routes/           # Definição de rotas
├── helpers/          # Funções reutilizáveis (errorHandler, validators)
├── types/            # TypeScript types
├── lib/              # Configurações (PrismaClient)
└── index.ts          # Servidor principal

frontend/
├── src/
│   ├── pages/        # Componentes de página (Login, Register, Ingredientes)
│   ├── App.jsx
│   └── main.jsx
└── vite.config.js
```

## 📚 Stack Tecnológico

- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT (jsonwebtoken)
- **Segurança**: bcryptjs para hashing de senhas
- **Frontend**: React + Vite
- **Testes**: Jest

## 🔌 Endpoints da API

### Autenticação

- `POST /api/v1/auth/login` - Login (retorna JWT)

### Ingredientes

- `POST /api/v1/ingredients` - Criar ingrediente
- `GET /api/v1/ingredients` - Listar ingredientes
- `GET /api/v1/ingredients/:id` - Obter ingrediente
- `PUT /api/v1/ingredients/:id` - Atualizar ingrediente
- `DELETE /api/v1/ingredients/:id` - Deletar ingrediente

### Porções

- `POST /api/v1/portions` - Criar porção
- `GET /api/v1/portions` - Listar porções
- `GET /api/v1/portions/:id` - Obter porção
- `PUT /api/v1/portions/:id` - Atualizar porção
- `DELETE /api/v1/portions/:id` - Deletar porção

### Lanches

- `POST /api/v1/snacks` - Criar lanche
- `GET /api/v1/snacks` - Listar lanches com totais
- `GET /api/v1/snacks/:id` - Obter lanche com totais
- `POST /api/v1/snacks/:snackId/portions/:portionId` - Adicionar porção ao lanche
- `DELETE /api/v1/snacks/:snackId/portions/:portionId` - Remover porção do lanche
- `DELETE /api/v1/snacks/:id` - Deletar lanche

## 🏗️ Padrão de Código (Senior Developer)

### Controllers

Responsáveis por:

1. Validar entrada (usando helpers)
2. Executar lógica do serviço
3. Retornar resposta

```typescript
export const createIngredient = async (req, res) => {
  const { name, weightG, cost } = req.body;

  // Validação centralizada em helpers
  const nameError = validateRequired(name, "Name");
  if (nameError) return sendValidationError(nameError, res);

  try {
    const ingredient = await ingredientService.create(name, weightG, cost);
    return res.status(201).json(ingredient);
  } catch (error) {
    // Erro centralizado
    return handlePrismaError(error, res);
  }
};
```

### Services

Apenas lógica de banco de dados (Prisma):

```typescript
async create(name: string, weightG: number, cost: number) {
  return prisma.ingredient.create({
    data: { name: name.trim(), weightG, cost: new Decimal(cost) },
  });
}
```

### Helpers

Funções reutilizáveis que eliminam boilerplate:

**errorHandler.ts:**

- `handlePrismaError()` - Mapeia erros Prisma para status HTTP
- `handleError()` - Trata erros customizados

**validators.ts:**

- `validateRequired()` - Valida campos obrigatórios
- `validatePositive()` - Valida números positivos
- `validateNonNegative()` - Valida números >= 0
- `sendValidationError()` - Retorna erro de validação

## 🧪 Testes (25/25 ✅)

```bash
npm test
```

Cobertura:

- ✅ authController (login, validações)
- ✅ ingredientController (CRUD)
- ✅ portionController (CRUD)
- ✅ snackController (CRUD + porções)
- ✅ authenticateJWT (middleware)

## 🔐 TypeScript Strict Mode

- ✅ `strict: true` habilitado
- ✅ `noUncheckedIndexedAccess` habilitado
- ✅ `exactOptionalPropertyTypes` habilitado
- ✅ Sem `any` types
- ✅ Type guards implementados

## 📊 Tipos Principais

```typescript
// JWT Payload
interface JwtPayload {
  userId: number;
  email: string;
}

// Error Handling
interface PrismaError extends Error {
  code?: string;
}

type PrismaErrorCode = "P2002" | "P2025" | "P2003";
```

## 🔄 Fluxo de Requisição

```
Request
  ↓
[Express Middleware] - CORS, JSON parsing
  ↓
[Validação] - validateRequired(), validatePositive(), etc
  ↓
[Controller] - recebe e valida dados
  ↓
[Service] - executa lógica (Prisma)
  ↓
[Error Handler] - handlePrismaError() ou handleError()
  ↓
Response
```

## 💾 Banco de Dados

### Schema Prisma

```prisma
model Ingredient {
  id      Int @id @default(autoincrement())
  name    String @unique
  weightG Int
  cost    Decimal @db.Decimal(10,4)
}

model Portion {
  id           Int @id @default(autoincrement())
  ingredient   Ingredient @relation(fields: [ingredientId])
  ingredientId Int
  name         String
  weightG      Int
  cost         Decimal @db.Decimal(10,4)
}

model Snack {
  id            Int @id @default(autoincrement())
  name          String @unique
  snackPortions SnackPortion[]
}

model SnackPortion {
  id        Int @id @default(autoincrement())
  snack     Snack @relation(fields: [snackId])
  snackId   Int
  portion   Portion @relation(fields: [portionId])
  portionId Int
}
```

### Migrations

```bash
npx prisma migrate dev        # Criar/aplicar migrations
npx prisma generate          # Gerar Prisma Client
npx prisma studio            # Interface visual do banco
```

## 🎯 Principais Features

✅ **Tipagem TypeScript Completa** - Sem `any` types  
✅ **Error Handling Centralizado** - Um lugar para gerenciar erros  
✅ **Validação Reutilizável** - Helpers para validação comum  
✅ **Código Senior-Grade** - Limpo, simples e manutenível  
✅ **Testes Completos** - 25 testes passando  
✅ **Prisma ORM** - Type-safe database queries  
✅ **JWT Auth** - Autenticação segura  
✅ **CORS Ativado** - Pronto para frontend

## 📝 Padrões de Resposta

### Sucesso

```json
{
  "id": 1,
  "name": "Pão",
  "weightG": 100,
  "cost": "2.5000"
}
```

### Erro

```json
{
  "error": "Name is required."
}
```

### Status HTTP

- `201` - Criado com sucesso
- `200` - OK
- `400` - Validação falhou
- `401` - Unauthorized (JWT inválido)
- `404` - Não encontrado
- `409` - Conflict (ex: email duplicado)
- `500` - Erro interno

## 🚀 Deployment

```bash
# Build para produção
npm run build

# Rodar servidor em produção
NODE_ENV=production npm start
```

## 📞 Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=sua_chave_secreta_super_segura
NODE_ENV=development|production
```

## 🤝 Contribuindo

1. Sempre manter `npm test` passando (25/25)
2. Usar padrão de validação com helpers
3. Centralizar erro handling
4. Manter TypeScript strict mode

## ✨ Melhorias Futuras

- [ ] Rate limiting
- [ ] Cache com Redis
- [ ] Logs estruturados
- [ ] API versioning
- [ ] Documentação Swagger/OpenAPI
- [ ] GraphQL alternativo

---

**Última atualização**: 7 de fevereiro de 2026  
**Versão**: 1.0.0  
**Prisma**: 6.19.2  
**Node**: 24.13.0+
