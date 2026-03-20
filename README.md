# Fluenverse - Base Next.js

Estrutura genérica para iniciar um projeto com Next.js (App Router) e TypeScript.

## Rodando localmente

```bash
npm install
npm run dev
```

Aplicação em `http://localhost:3000`.

## Envio de survey por e-mail

O submit do survey chama `POST /api/survey` e envia o resultado por SMTP.

Configure no `.env.local`:

```bash
SURVEY_SMTP_HOST=smtp.gmail.com
SURVEY_SMTP_PORT=587
SURVEY_SMTP_SECURE=false
SURVEY_SMTP_USER=seu-usuario-smtp
SURVEY_SMTP_PASS=sua-senha-ou-app-password
SURVEY_FROM_EMAIL=Fluenverse@gmail.com
SURVEY_TO_EMAIL=Fluenverse@gmail.com
```

## Estrutura

```text
.
|-- app/
|   |-- about/page.tsx
|   |-- api/health/route.ts
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   `-- section.tsx
|-- lib/
|   `-- utils.ts
|-- public/
|   `-- logo.svg
|-- .eslintrc.json
|-- next.config.mjs
|-- package.json
|-- tsconfig.json
`-- README.md
```
