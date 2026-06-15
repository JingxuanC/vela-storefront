# Vela Storefront

AI-generated e-commerce storefront powered by Medusa.js and Vela Engine.

## Architecture

```
User describes their store
       │
       ▼
┌──────────────────────────────┐
│    AI Page Generator         │
│  (Qwen + templates)          │
│  → Next.js components        │
│  → Tailwind styles           │
│  → SEO metadata              │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│      @vela/sdk               │
│  Wraps Medusa Store API      │
│  + Vela AI Engine API        │
└──────┬───────────┬───────────┘
       │           │
       ▼           ▼
  Medusa API    Vela Engine
  (commerce)    (AI analytics)
```

## Quick Start

```bash
npm install @vela/sdk
```

```ts
import { vela } from '@vela/sdk'

// E-commerce (Medusa)
const products = await vela.product.list()
const cart = await vela.cart.create()
await vela.cart.add(cart.id, variantId, quantity)
await vela.checkout.complete(cart.id)

// AI (Vela Engine)
const recs = await vela.ai.recommend(productId)
const ltv = await vela.ai.ltv(customerEmail)
```
