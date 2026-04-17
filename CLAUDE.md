# Privatio — Istruzioni Progetto

## Cos'è Privatio
Marketplace immobiliare italiano dove i venditori pubblicano immobili gratis e le agenzie convenzionate pagano un abbonamento mensile per zona per gestirli. Zero commissioni per il venditore.

## Modello di Business
- **Revenue**: solo dalle agenzie (abbonamento mensile per zona via Stripe)
- **Venditori**: usano la piattaforma gratis, 0% commissioni. Pubblicano l'immobile, scelgono un'agenzia entro 48h oppure il sistema assegna automaticamente
- **Acquirenti**: accesso gratuito. Eventuale commissione agenzia (2-2.5%) negoziata direttamente con l'agenzia
- **Agenzie**: pagano per presidiare zone geografiche (max 3 zone, max agenzie per zona). Devono firmare contratto zero-commissioni

## Territori (Modello V3 — Microzone OMI)
Zone basate su microzone OMI (Osservatorio Mercato Immobiliare), stile immobiliare.it.
~490+ microzone per ~80+ città, con classificazione per fascia OMI (C/B/D/E/R).

3 tier non sovrapposti, copertura totale Italia:
- **BASE** (€99-249/mese): comuni <20k abitanti, max 2-4 agenzie, visibilità standard
- **URBANA** (€299-699/mese): zone D/E in città >20k, max 3-6 agenzie, visibilità prioritaria
- **PREMIUM** (€699-2.990/mese): zone C/B in città >20k, max 4-7 agenzie, profilo in evidenza
- Formula prezzo: basePrice(pop) × moltFascia(OMI) × boostPrezzo(€/m²) × boostNTN
- Le agenzie possono espandersi a qualsiasi zona entro 1 km dalla sede (la fascia determina solo il prezzo)
- Point-in-polygon per assegnazione precisa con boundary GeoJSON

## Matchmaking — scelta venditore + fallback 48h
1. Durante il caricamento dell'immobile il venditore sceglie direttamente l'agenzia tra quelle attive nella zona
2. Se entro 48h nessuna scelta: geolocalizza immobile → trova zona → filtra agenzie attive
3. Ranking di fallback: piano più alto → minor carico di lavoro → rating più alto
4. Assegnazione automatica all'agenzia top-ranking con email notifica

## Stack Tecnico
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: PostgreSQL su Supabase
- **ORM**: Prisma
- **Auth**: NextAuth.js (Google OAuth + Credentials)
- **Pagamenti**: Stripe (subscriptions)
- **Email**: Resend (da configurare)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS
- **Monitoring**: Sentry

## Struttura Progetto
```
/ (root)                    → Codice sorgente Next.js
├── src/app/                → Pages (App Router)
│   ├── (public)/           → Pagine pubbliche
│   ├── admin/              → Dashboard admin
│   ├── dashboard/          → Dashboard venditore/agenzia
│   ├── api/                → API routes (stripe, auth, ecc.)
│   └── vendi/              → Flow pubblicazione immobile
├── src/components/         → React components
├── src/lib/                → Business logic
│   ├── stripe.ts           → Integrazione Stripe + checkout
│   ├── matchmaking.ts      → Assegnazione automatica immobili
│   ├── zone-pricing.ts     → Calcolo prezzi zone
│   └── zones.ts            → Logica zone/territori
├── prisma/                 → Schema DB + migrations
├── scripts/                → Import zone (import-zones.ts, import-omi.ts)
└── privatio-docs/                    → Documenti separati dal codice
    ├── contratti/                    → Contratti, T&C, documenti legali
    ├── marketing/                    → Materiale marketing generale
    │   ├── instagram-posts/          → ⬇️ OUTPUT: post Instagram generati
    │   └── materiale/                → ⬇️ OUTPUT: brochure, PDF, presentazioni
    └── business-plan/                → ⬇️ OUTPUT: business plan, proiezioni, report
```

## Pagine Principali
- `/` Homepage
- `/cerca` Ricerca immobili
- `/come-funziona` Spiegazione flusso
- `/vendi` Flow per venditori
- `/per-acquirenti` Info per acquirenti
- `/accedi` `/registrati` Auth
- `/registra-agenzia` Registrazione agenzia (con token approvazione)
- `/admin` Dashboard admin
- `/dashboard/venditore` Dashboard venditore
- `/dashboard/agenzia` Dashboard agenzia

## URL & Riferimenti
- **Produzione**: https://privatio.it
- **GitHub**: https://github.com/Federico93Ita/Privatio
- **Vercel**: https://vercel.com/federicos-projects-c77c6a95/privatio

## Competitor
- Immobiliare.it / Idealista (grandi portali)
- Casavo / Dove.it (proptech/instant buyer)
- Agenzie tradizionali (modello agenzia-centrico con commissioni alte)

## Cartelle di Output
Quando creiamo contenuti insieme, i file vanno SEMPRE nella cartella giusta:
- **Post Instagram** → `privatio-docs/marketing/instagram-posts/`
- **Materiale marketing** (brochure, PDF, presentazioni agenzie, volantini) → `privatio-docs/marketing/materiale/`
- **Business plan, proiezioni, report** → `privatio-docs/business-plan/`
- **Contratti, documenti legali** → `privatio-docs/contratti/`

## Skill Personalizzate
Il progetto include skill dedicate in `.claude/skills/`:
- **instagram-posts**: genera post Instagram (concept, visual, caption, hashtag) con tono Privatio
- **marketing-agenzie**: crea brochure, presentazioni, volantini, one-pager per agenzie e venditori
- **business-plan**: genera/aggiorna business plan, proiezioni finanziarie, report per bandi e investitori
- **outreach-agenzie**: genera email, script chiamata, messaggi LinkedIn/WhatsApp per acquisire agenzie partner
- **seo-contenuti**: genera articoli blog, testi pagine, meta description e piani editoriali SEO
- **email-marketing**: crea email transazionali, sequenze onboarding, newsletter e campagne per tutti i target

Ogni skill conosce già il contesto Privatio, il tono di voce, il pricing e salva automaticamente nella cartella di output corretta.

## Come Lavorare
- **Lingua**: sempre italiano nelle conversazioni
- **Stile**: spiega brevemente cosa farai, poi procedi senza aspettare conferma
- **Output**: salva sempre i file generati nella cartella di output corretta (vedi sopra)
- **Codice**: TypeScript, App Router conventions, Tailwind per styling
- **Da configurare**: Stripe, Resend, Google Analytics (variabili su Vercel già predisposte)
- **Lancio target**: Aprile/Maggio 2026
