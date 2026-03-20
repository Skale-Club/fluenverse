# Fluenverse

Aplicacao Next.js com landing page, survey de qualificacao, painel administrativo e integracoes com Supabase.

## Rodando localmente

```bash
npm install
npm run dev
```

O projeto sobe em `http://localhost:5000`.

## Variaveis principais

Configure no `.env.local` o que for necessario para o seu ambiente:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

SURVEY_SMTP_HOST=
SURVEY_SMTP_PORT=
SURVEY_SMTP_SECURE=
SURVEY_SMTP_USER=
SURVEY_SMTP_PASS=
SURVEY_FROM_EMAIL=
SURVEY_TO_EMAIL=
```

## Assets publicos

Os assets do front sao resolvidos por `lib/public-assets.ts`, apontando para o bucket configurado no Supabase.

Se precisar reenviar arquivos locais para esse bucket:

```bash
npm run assets:upload-public
```
