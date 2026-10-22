This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# portfolio-latest

## Database and Email setup

This app uses Neon (PostgreSQL) with Drizzle ORM and Brevo (Sendinblue) for emails.

1) Environment variables

Create a `.env.local` file based on `.env.example`:

```
DATABASE_URL=postgresql://USER:PASS@HOST/dbname?sslmode=require
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=you@example.com
BREVO_SENDER_NAME=Your Name
CONTACT_TO_EMAIL=you@example.com
```

2) Drizzle setup

- Schema: `db/schema.ts` (projects table)
- Config: `drizzle.config.ts`

Generate and apply migrations (requires DATABASE_URL):

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

3) Server API

- GET /api/projects: returns projects from DB
- POST /api/contact: sends contact email via Brevo

4) Server actions

- `app/actions.ts`: `getData()` (raw Neon) and `getProjects()` (Drizzle)


5) Supabase keep-alive

A separate Supabase Postgres instance (not used by the app) gets paused after 7 days without activity. `scripts/keep-supabase-alive.ts` runs a read-only `select 1` against it, and `.github/workflows/supabase-keepalive.yml` runs it every Monday at 09:00 UTC.

- Requires `SUPABASE_KEEPALIVE_DATABASE_URL` (in `.env.local` locally, and as a GitHub Actions repository secret)
- Run manually: `npm run keepalive:supabase`
