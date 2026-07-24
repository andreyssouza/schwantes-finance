# Schwantes Finance

Aplicação web de finanças pessoais para controle de entradas e saídas, com autenticação de usuários, perfil, transações e resumo financeiro.

O projeto é dividido em dois módulos:

- **`sf-web`**: frontend em React + Vite
- **`sf-api`**: backend em Node.js + Express + Prisma

## Funcionalidades

- Cadastro de usuário
- Login com JWT
- Dashboard financeiro
- Cadastro de transações
- Listagem e exclusão de transações
- Resumo financeiro com totais de entrada, saída e saldo
- Edição de perfil
- Alteração de senha

## Stack

### Frontend
- React
- Vite
- React Router DOM
- Axios
- Chart.js
- Recharts
- React Hot Toast
- Lucide React

### Backend
- Node.js
- Express
- Prisma
- PostgreSQL
- JWT
- bcrypt

## Estrutura do projeto

```text
sf-web/
  src/
    App.jsx
    api.js
    main.jsx
    pages/
    assets/
  public/

sf-api/
  src/
    index.js
    app.js
    auth.js
    users.js
    transactions.js
    authMiddleware.js
  prisma/
    schema.prisma
  tests/
```

## Requisitos

- Node.js 18+ ou superior
- npm
- PostgreSQL

## Como rodar o projeto localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/andreyssouza/schwantes-finance.git
cd schwantes-finance
```

### 2. Configurar o backend

Entre na pasta da API:

```bash
cd sf-api
npm install
```

Crie um arquivo `.env` com as variáveis necessárias:

```env
DATABASE_URL="sua_url_de_conexao_postgres"
DIRECT_URL="sua_url_direta_do_postgres"
JWT_SECRET="sua_chave_secreta"
PORT=3333
```

Execute as migrations do Prisma:

```bash
npx prisma migrate dev
```

Inicie o backend:

```bash
npm run dev
```

A API ficará disponível em:

```bash
http://localhost:3333
```

### 3. Configurar o frontend

Abra outro terminal e entre na pasta do web:

```bash
cd sf-web
npm install
```

Inicie o frontend:

```bash
npm run dev
```

O frontend ficará disponível em:

```bash
http://localhost:5173
```

## Scripts disponíveis

### Frontend (`sf-web`)

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend (`sf-api`)

```bash
npm run dev
npm test
```

## Variáveis de ambiente

### Backend
- `DATABASE_URL`: string de conexão com o banco PostgreSQL
- `DIRECT_URL`: conexão direta usada pelo Prisma
- `JWT_SECRET`: chave secreta para assinar tokens JWT
- `PORT`: porta da API, padrão `3333`

### Frontend
- Atualmente a URL da API está configurada em `sf-web/src/api.js`
- Para produção, recomenda-se mover isso para uma variável de ambiente

## API

### Autenticação
- `POST /auth/register`
- `POST /auth/login`

### Usuário
- `GET /users/profile`
- `PUT /users/profile`
- `PUT /users/change-password`

### Transações
- `POST /transactions`
- `GET /transactions`
- `DELETE /transactions/:id`

## Banco de dados

O schema Prisma possui dois modelos principais:

- **User**
  - `id`
  - `name`
  - `email`
  - `password`
  - `createdAt`

- **Transaction**
  - `id`
  - `description`
  - `amount`
  - `type`
  - `category`
  - `date`
  - `userId`

## Observações de produção

Antes de subir para produção, ajuste estes pontos:

- trocar `localhost` por variável de ambiente no frontend
- definir `JWT_SECRET` forte e seguro
- configurar CORS conforme o domínio final
- validar melhor os dados de entrada das rotas
- corrigir o script duplicado de `test` no backend
- documentar o deploy do banco PostgreSQL

## Licença

Projeto sob licença ISC.
