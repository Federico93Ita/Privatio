# Privatio - Informazioni Progetto

## URL Produzione
- **Sito**: https://privatio.vercel.app
- **Vercel Dashboard**: https://vercel.com/federicos-projects-c77c6a95/privatio
- **GitHub Repo**: https://github.com/Federico93Ita/Privatio

## Credenziali Test

| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | admin@privatio.it | Admin123! |
| Venditore | venditore@test.it | Seller123! |
| Acquirente | acquirente@test.it | Buyer123! |
| Agenzia | admin@immobiliaresangiorgio.it | Agency123! |

## Database (Supabase)
- **Host**: aws-1-eu-west-1.pooler.supabase.com
- **Porta pooler (pgbouncer)**: 6543
- **Porta diretta**: 5432
- **Database**: postgres
- **User**: postgres.tvdudzwevbnaxzlroaxy
- **DATABASE_URL** (con pgbouncer): `postgresql://postgres.tvdudzwevbnaxzlroaxy:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- **DIRECT_URL** (per migrations/seed): `postgresql://postgres.tvdudzwevbnaxzlroaxy:[PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`

> La password del database e' quella configurata su Vercel nelle Environment Variables.

## Stack Tecnologico
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js (Google OAuth + Credentials)
- **Email**: Resend
- **Pagamenti**: Stripe
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Comandi Utili

```bash
# Avviare il dev server
npm run dev

# Eseguire il seed del database
npx prisma db seed

# Seed su database di produzione (dalla cartella del progetto)
DATABASE_URL="[DIRECT_URL_DA_VERCEL]" npx prisma db seed

# Generare il client Prisma
npx prisma generate

# Creare una nuova migration
npx prisma migrate dev --name nome_migration

# Build di produzione
npx next build

# Vedere lo stato del database
npx prisma studio
```

## Variabili d'Ambiente (Vercel)
Le seguenti variabili sono configurate su Vercel:

| Variabile | Descrizione | Stato |
|-----------|-------------|-------|
| DATABASE_URL | Connessione DB (pgbouncer) | Configurata |
| DIRECT_URL | Connessione DB (diretta) | Configurata |
| NEXTAUTH_URL | URL del sito | Configurata |
| NEXTAUTH_SECRET | Secret per sessioni | Configurata |
| NEXT_PUBLIC_APP_URL | URL pubblica app | Configurata |
| GOOGLE_CLIENT_ID | OAuth Google | Configurata |
| GOOGLE_CLIENT_SECRET | OAuth Google | Configurata |
| NEXT_PUBLIC_SUPABASE_URL | URL Supabase | Configurata |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Chiave pubblica Supabase | Configurata |
| SUPABASE_SERVICE_KEY | Chiave servizio Supabase | Configurata |
| RESEND_API_KEY | API key per email | Da configurare |
| STRIPE_SECRET_KEY | Stripe secret | Da configurare |
| STRIPE_WEBHOOK_SECRET | Stripe webhook | Da configurare |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Stripe pubblica | Da configurare |
| NEXT_PUBLIC_GA_ID | Google Analytics | Da configurare |
| CONTACT_EMAIL | Email contatti | Da configurare |

## Pagine Principali

| Pagina | URL | Stato |
|--------|-----|-------|
| Homepage | / | Funzionante |
| Cerca immobili | /cerca | Funzionante |
| Come funziona | /come-funziona | Funzionante |
| Vendi casa | /vendi | Funzionante |
| Per acquirenti | /per-acquirenti | Funzionante |
| Contatti | /contatti | Funzionante |
| Privacy Policy | /privacy-policy | Funzionante |
| Cookie Policy | /cookie-policy | Funzionante |
| Termini di Servizio | /termini-di-servizio | Funzionante |
| Login | /accedi | Funzionante |
| Registrazione | /registrati | Funzionante |
| Admin Dashboard | /admin | Protetta (ADMIN) |
| Dashboard Venditore | /dashboard/venditore | Protetta (auth) |
| Dashboard Agenzia | /dashboard/agenzia | Protetta (auth) |

## Dati Demo (Seed)
10 proprietà in tutta Italia:
- Milano Centro - Appartamento (385.000 EUR)
- Monza - Villa con giardino (720.000 EUR)
- Roma Prati - Attico panoramico (890.000 EUR)
- Torino Crocetta - Trilocale (198.000 EUR)
- Firenze Colline - Casa indipendente (520.000 EUR)
- Bologna Centro - Bilocale (165.000 EUR)
- Cernobbio (Como) - Villa vista lago (1.850.000 EUR)
- Milano Navigli - Loft industriale (430.000 EUR)
- Napoli Vomero - Mansarda (245.000 EUR)
- Padova - Quadrilocale (275.000 EUR)

2 agenzie: Immobiliare San Giorgio (Milano), Casa Roma Immobiliare (Roma)
