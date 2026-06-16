# Vela Storefront

**AI-powered e-commerce admin dashboard + landing page.** Remix SSR + React SPA, standalone — no Shopify, no Polaris. Connects to Vela Engine for AI capabilities.

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![SPA Pages](https://img.shields.io/badge/SPA%20pages-18-blue)]()

---

## What is Vela Storefront?

Vela Storefront is the frontend layer of the Vela AI platform. It provides:

| Layer | Technology | What it does |
|-------|-----------|-------------|
| **Landing Page** | Remix SSR | Marketing site at `/` (hero, features, pricing) |
| **Admin Dashboard** | React SPA (18 pages) | AI-powered merchant dashboard at `/app` |
| **AI Chat Widget** | FloatingChat | Storefront AI shopping assistant (SSE) |

Originally built on Shopify (Polaris + AppBridge + OAuth), now fully standalone — all Shopify dependencies removed, replaced with direct API token auth and custom dark theme CSS.

## Architecture

```
velagrow.com / localhost:3000
  │
  ├─ /              → Remix SSR → Landing page (_index.tsx)
  │
  ├─ /app/*         → Remix shell → SPA entry → 18-page React admin
  │   │
  │   ├─ Dashboard      → AI summary, attribution overview, usage stats
  │   ├─ Analytics      → Unified attribution + channel breakdown
  │   ├─ SalesAgent     → AI chat admin (SSE streaming)
  │   ├─ Customers      → LTV + churn risk table
  │   ├─ ContentFactory → AI content generation
  │   ├─ CartRecovery   → Abandoned cart campaigns
  │   ├─ Returns        → Return/exchange management
  │   ├─ Marketing      → RFM segments + flow engine
  │   ├─ ProductsPage   → Product catalog + style config
  │   ├─ Inbox          → Customer conversations
  │   ├─ Observability  → Metrics + logs dashboard
  │   ├─ SeoGeo         → LLMs.txt + schema + visibility
  │   ├─ AutoReply      → Auto-reply configuration
  │   ├─ Notifications  → Notification preferences
  │   ├─ Plans          → Pricing + billing
  │   ├─ ApiKeys        → API key management
  │   ├─ Settings       → General settings
  │   ├─ Onboarding     → Merchant onboarding
  │   └─ SalesAgentSettings → AI agent config
  │
  └─ API calls → Vela Engine (localhost:8000)
       ├─ X-API-Key header auth
       └─ shop_id parameter for tenant isolation
```

## Quick Start

### Prerequisites

- Node.js 20+
- Vela Engine running (or any backend providing `/api/*` endpoints)

### Development

```bash
git clone https://github.com/JingxuanC/vela-storefront.git
cd vela-storefront

# Install
npm install && cd spa && npm install && cd ..

# Start dev (Remix + SPA hot-reload, with API proxy)
npm run dev
# → Remix at localhost:3000 (proxies /api to localhost:8000)
# → SPA at localhost:5174 (Vite HMR)
```

### Production

```bash
npm run build
# → SPA: public/spa-dist/main.js
# → Remix: build/server/index.js + build/client/

PORT=3000 npx remix-serve build/server/index.js
```

### Docker

```bash
docker build -t vela-storefront .
docker run -p 3000:3000   -e VELA_API_URL=http://vela-engine:8000   -e API_TOKEN=***   vela-storefront
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP server port |
| `VELA_API_URL` | `http://localhost:8000` | Vela Engine backend URL |
| `API_TOKEN` | (empty) | X-API-Key for backend auth |
| `INTERNAL_SECRET` | `vela-dev-secret` | Internal auth secret (dev) |
| `NODE_ENV` | `production` | Environment |

## SPA Pages (18)

| Page | File | Key Features |
|------|------|-------------|
| Dashboard | `Dashboard.tsx` | AI summary, usage stats, revenue charts |
| Analytics | `Analytics.tsx` | Attribution breakdown, channel comparison |
| SalesAgent | `SalesAgent.tsx` | SSE streaming chat, admin tools |
| Customers | `Customers.tsx` | LTV scores, churn risk, RFM segments |
| ContentFactory | `ContentFactory.tsx` | AI content generation, scheduling |
| CartRecovery | `CartRecovery.tsx` | Campaign management, analytics |
| Returns | `Returns.tsx` | Return list, approve/reject workflow |
| Marketing | `Marketing.tsx` | Flow engine, trigger configuration |
| ProductsPage | `ProductsPage.tsx` | Product catalog, style presets |
| Inbox | `Inbox.tsx` | Customer conversations, reply |
| Observability | `Observability.tsx` | Metrics, logs, LLM health |
| SeoGeo | `SeoGeo.tsx` | LLMs.txt, product visibility |
| AutoReply | `AutoReply.tsx` | Review auto-reply rules |
| Notifications | `Notifications.tsx` | Email + in-app preferences |
| Plans | `Plans.tsx` | Pricing plans, billing |
| ApiKeys | `ApiKeys.tsx` | API key management |
| Settings | `Settings.tsx` | General configuration |
| Onboarding | `Onboarding.tsx` | Merchant setup wizard |

## Design System

Custom dark theme CSS — no Polaris dependency.

```
CSS Design Tokens:
  --bg-primary:    #08090a
  --bg-raised:     #0f1011
  --bg-elevated:   #161718
  --text-primary:  #f7f8f8
  --text-secondary:#9ca3af
  --accent-amber:  #f59e0b
  --border:        #1f2937
  --shadow:        0 1px 3px rgba(0,0,0,.3)

Font: Inter (Google Fonts)
Charts: Chart.js v4 + react-chartjs-2
```

## Authentication

All API calls use `X-API-Key` header. The token is injected from environment variables into the SPA root div as `data-api-token`.

```html
<div id="root" data-shop="..." data-api-token="..." data-api-base="http://localhost:8000" />
```

## Remix Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `_index.tsx` | Landing page (hero, features, pricing, FAQ) |
| `/app` | `app._index.tsx` | Admin dashboard SPA entry |
| `/app/*` | `app.$.tsx` | Catch-all for SPA client-side routing |
| `/health` | `health.tsx` | Health check (returns "OK") |
| `/.well-known/*` | `$.well-known.$.tsx` | LLMs.txt + SEO files |

## Shopify Migration

This project was extracted from vela-shopify (Shopify App). All Shopify dependencies removed:

| Removed | Replaced With |
|---------|--------------|
| `@shopify/polaris` | Custom dark theme CSS |
| `@shopify/app-bridge-react` | `VelaProvider` + `X-API-Key` |
| `@shopify/shopify-app-remix` | Simple `loader()` in `app.tsx` |
| Shopify OAuth (auth.*.tsx) | URL parameter `shop_id` |
| `shopify.server.ts` | Direct Remix entry |
| Extensions (Liquid + TOML) | Removed entirely |

## Related Projects

| Project | Description |
|---------|-------------|
| [vela-engine](https://github.com/JingxuanC/vela-engine) | AI analytics engine (Go, 215 routes) |
| [vela-shopify](https://github.com/JingxuanC/vela-shopify) | Vela AI for Shopify merchants |
| [vela-infra](https://github.com/JingxuanC/vela-infra) | Docker Compose + deployment |
| [vela-docs](https://github.com/JingxuanC/vela-docs) | Design documents |

## License

MIT
