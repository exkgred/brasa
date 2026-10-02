# Brasa

Roguelike de cartas da forja. Você é o último foleiro de **Caldeira** e desce ao **Cinzeiro** para roubar brasa viva. As cartas são chapas de aço em CSS/SVG — golpe, guarda, fluxo e escória.

Backend em NestJS (Clean Architecture), frontend em React + Vite, PostgreSQL e Prisma.

---

## O que o jogo faz

- Quatro classes: Foleiro, Malhador, Guarda-fogo e Temperador
- Você monta o baralho (10–14 cartas, no máximo 2 iguais) antes de descer
- Run no mapa: combate → banca → combate → descanso → **Fornalha Fria**
- Combate por turnos: mana da classe, compre 5, bloco e queima
- Recompensa de carta, loja de sucata, descanso (+25 vida)
- Ranking das runs
- Demo na Vercel com o motor no `localStorage`

---

## Arquitetura

```text
Controller
  → Use Case
    → Engine (domínio puro, determinístico)
      → Prisma (run JSON + scores)
```

O motor (`domain/game`) é a fonte da regra. Jest cobre combate, loja e ranking. O front da demo importa o mesmo motor.

---

## Tecnologias

- **Backend:** Node.js 20, NestJS 10, TypeScript strict, Prisma, PostgreSQL 16, Passport JWT, Jest
- **Frontend:** React 18, Vite, Tailwind, Zustand, Axios
- **Demo:** Vercel estática com `VITE_DEMO=true`

---

## Como rodar

Pré-requisitos: Node.js ≥ 20, Docker Compose, npm.

### 1. Postgres

Na raiz `brasa/`:

```bash
docker compose up -d postgres
```

Porta **5438**.

### 2. Backend (porta 3006)

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

- API: http://localhost:3006/api/v1
- Health: http://localhost:3006/api/v1/health
- Swagger: http://localhost:3006/api/docs

### 3. Frontend (porta 5177)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App: http://localhost:5177

### Conta seed

| Email | Senha |
|-------|-------|
| player@brasa.dev | password123 |

## Demo na Vercel (estática)

O frontend sobe sozinho, sem Nest/Postgres. Com `VITE_DEMO=true` o Axios usa um adapter no navegador (run, combate e ranking no `localStorage`).

1. No [Vercel](https://vercel.com/new) importe o repositório
2. Preset **Services**: deixe só o serviço `frontend` (Vite, pasta `frontend/`). Não adicione o Nest.
3. Se a tela pedir `vercel.json`, use o da raiz (já declara só o frontend)
4. Variável: `VITE_DEMO=true` (já vem em `frontend/.env.production`)

Login da demo: `player@brasa.dev` / `password123`.

Demo: [https://frontend-puce-one-23.vercel.app/](https://frontend-puce-one-23.vercel.app/)

## Testes

```bash
cd backend
npm test
npm run test:cov
npm run lint
```
