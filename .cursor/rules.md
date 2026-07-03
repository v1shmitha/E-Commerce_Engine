# Cursor Project Rules — Configurable Commerce Engine

## Project Overview

This is a config-driven, reusable e-commerce engine built with Next.js 15 App Router, Supabase (PostgreSQL), Prisma ORM, Tailwind CSS, and shadcn/ui. The first deployment is a Sri Lankan online clothing store. The architecture is designed so that switching to a different store type (electronics, furniture, food) requires only a new config file — no engine code changes.

Payment processing is handled by PayHere (Sri Lanka, Central Bank approved). Currency is LKR throughout. The app is hosted on Vercel with the Supabase project in the Singapore region.

---

## Tech Stack

- Framework: Next.js 15 (App Router, TypeScript, Turbopack)
- Database: Supabase (PostgreSQL, Singapore region)
- ORM: Prisma with @prisma/client
- Auth: Supabase Auth with @supabase/ssr
- Styling: Tailwind CSS + shadcn/ui components
- State: Zustand (cart)
- Forms: React Hook Form + Zod
- Payments: PayHere (Sri Lanka) — NOT Stripe
- Email: Resend + React Email
- Charts: Recharts
- Icons: lucide-react
- Package manager: pnpm
- Hosting: Vercel
- Storage: Supabase Storage (product images)

---

## Folder Structure

```
/
├── config/
│   └── stores/
│       └── clothing.config.ts      ← active store config (swap per client)
│
├── engine/                         ← core engine, never edited per client
│   ├── components/
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── VariantPicker.tsx   ← reads variantAxes from config
│   │   │   └── ProductDetail.tsx
│   │   ├── listing/
│   │   │   ├── FilterPanel.tsx     ← reads filters from config
│   │   │   └── ProductGrid.tsx
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── layout/
│   ├── hooks/
│   │   ├── useStore.ts             ← exposes storeConfig via context
│   │   ├── useCart.ts
│   │   └── useVariants.ts
│   ├── lib/
│   │   ├── payhere.ts
│   │   ├── supabase.ts
│   │   └── prisma.ts
│   └── api/
│       ├── products.ts
│       ├── orders.ts
│       └── customers.ts
│
├── app/
│   ├── (store)/                    ← public storefront routes
│   └── (admin)/                    ← protected admin dashboard routes
│
└── prisma/
    └── schema.prisma               ← generic, store-agnostic schema
```

---

## Core Architecture Rules

### 1. Config-driven — never hardcode store-specific values

The store config file is the single source of truth for everything that differs between store types. Always read from config, never hardcode.

```typescript
// WRONG — hardcoded for clothing
const filters = ["size", "colour", "gender"]

// CORRECT — reads from config
const { filters } = useStore()
```

The active store config is at `config/stores/clothing.config.ts`. It exports:

```typescript
export const storeConfig = {
  name: string
  currency: "LKR"
  locale: "en-LK"
  theme: { primaryColor, accentColor, font }
  productFields: {
    hasVariants: boolean
    variantAxes: string[]    // e.g. ["size", "colour"] or ["storage", "colour"]
    extraFields: string[]    // e.g. ["material", "careInstructions"]
    hasGender: boolean
  }
  filters: string[]          // e.g. ["category", "size", "colour", "price"]
  shipping: { freeThreshold: number, flatRate: number }
  layout: { productCard, listingGrid, homepage }
  categories: string[]
}
```

### 2. Generic Prisma schema — no store-specific fields

ProductVariant uses `attributes Json` not hardcoded size/colour columns. Product uses `metadata Json` not hardcoded extraFields.

```prisma
model ProductVariant {
  id         String  @id @default(cuid())
  productId  String
  sku        String  @unique
  stock      Int     @default(0)
  price      Decimal @db.Decimal(10, 2)
  attributes Json    @default("{}")
  // clothing: { "size": "M", "colour": "Black" }
  // electronics: { "storage": "256GB", "colour": "Silver" }
}

model Product {
  id        String  @id @default(cuid())
  name      String
  slug      String  @unique
  basePrice Decimal @db.Decimal(10, 2)
  metadata  Json    @default("{}")
  // clothing: { "material": "Cotton", "gender": "Women" }
  // electronics: { "brand": "Samsung", "warranty": "1 year" }
}
```

### 3. Money — always Decimal, never Float

All LKR amounts use `Decimal @db.Decimal(10, 2)` in Prisma. Never use `Float` or JavaScript `number` for money calculations. Display with: `new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(amount)`

### 4. PayHere — not Stripe

This project uses PayHere for payments. Key differences from Stripe:

- Hash is generated server-side using MD5: `MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret))`
- Payment is triggered client-side via the PayHere JS SDK (onsite checkout, no redirect)
- Webhook equivalent is the `notify_url` — a server-to-server POST from PayHere after payment
- Status codes: 2 = completed, 0 = failed, -1 = cancelled, -2 = chargedback
- Currency: always "LKR"
- Requires a public domain for notify_url (use ngrok in development)
- Local wallets (eZ Cash, Genie, Frimi, iPay) are enabled via PayHere dashboard — no extra code

Never suggest Stripe, Stripe Elements, or Stripe webhooks. Use PayHere equivalents only.

### 5. Supabase Auth pattern

Use `@supabase/ssr` for all auth. Never use `@supabase/auth-helpers-nextjs` (deprecated).

Server components:

```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
```

Client components:

```typescript
import { createBrowserClient } from "@supabase/ssr"
```

Admin route protection goes in `middleware.ts` — check session and verify role === "ADMIN".

### 6. Next.js 15 App Router patterns

- Use server components by default. Add "use client" only when needed (event handlers, hooks, browser APIs)
- Data fetching in server components directly with Prisma — no useEffect fetching
- Mutations via Next.js server actions (not API routes where possible)
- API routes only for: PayHere notify URL, PayHere hash generation, and any third-party webhook
- Use `next/image` for all product images with Supabase Storage URLs

### 7. useStore hook

Always access config via the useStore hook in client components or directly from `engine/lib/config.ts` in server components and API routes.

```typescript
// Client component
const { productFields, filters, shipping } = useStore()

// Server component or API route
import { storeConfig } from "@/engine/lib/config"
```

---

## Component Behaviour Rules

### VariantPicker

Must read `variantAxes` from config and render dynamically. For clothing this renders a size button group and a colour swatch grid. For electronics it renders storage options and colour swatches. The component must not have any hardcoded "size" or "colour" strings.

### FilterPanel

Must read `filters` from config and render each filter type dynamically. Supported filter types: "category", "size", "colour", "gender", "price", "brand", "warranty". Each filter type has its own sub-component. The panel itself has no hardcoded filters.

### ProductCard

Must read `layout.productCard` from config to choose the card variant:

- "fashion" — large image, minimal text, hover zoom
- "tech" — image + specs summary, brand badge
- "minimal" — clean grid card

### Admin variant manager

Must read `variantAxes` from config to render the correct input fields when creating or editing a product variant. Never hardcode size/colour inputs.

---

## Naming Conventions

- Components: PascalCase (`ProductCard.tsx`, `VariantPicker.tsx`)
- Hooks: camelCase with use prefix (`useStore.ts`, `useCart.ts`)
- Utilities: camelCase (`formatLKR.ts`, `generateHash.ts`)
- API routes: kebab-case directories (`app/api/payhere/notify/route.ts`)
- Config files: kebab-case with .config suffix (`clothing.config.ts`)
- Database: snake_case (handled by Prisma `@@map`)
- Environment variables: SCREAMING_SNAKE_CASE, prefixed with NEXT_PUBLIC_ only if needed client-side

---

## Environment Variables

```env
DATABASE_URL=           # Supabase pooled connection (pgbouncer=true)
DIRECT_URL=             # Supabase direct connection (for migrations)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
PAYHERE_MERCHANT_ID=
PAYHERE_MERCHANT_SECRET=
PAYHERE_SANDBOX=true    # set to false in production
RESEND_API_KEY=
```

Never expose PAYHERE_MERCHANT_SECRET, SUPABASE_SERVICE_ROLE_KEY, or DATABASE_URL to the client. These are server-only.

---

## Do Not

- Do not use Stripe, Stripe SDK, or any Stripe reference
- Do not hardcode "size", "colour", "gender", or any clothing-specific term in engine components
- Do not use `Float` for money — always use `Decimal`
- Do not use `@supabase/auth-helpers-nextjs` — use `@supabase/ssr`
- Do not use `useEffect` for data fetching in server components
- Do not use `localStorage` directly — use the Zustand cart store which handles persistence
- Do not use `any` TypeScript type — always type properly
- Do not put business logic in React components — keep it in `engine/api/` or server actions
- Do not add store-specific logic to the engine — it goes in the config or a store-specific override
- Do not use `npm` or `yarn` — this project uses `pnpm`

---

## Current Store: Clothing (Sri Lanka)

Active config: `config/stores/clothing.config.ts`

- Store name: defined in config
- Currency: LKR
- Variant axes: size, colour
- Extra product fields: material, careInstructions
- Filters: category, size, colour, gender, price
- Shipping: flat rate with free threshold (defined in config)
- Payment: PayHere (sandbox during development, live on production)
- Locale: en-LK
- Supabase region: Singapore (ap-southeast-1)

---

## Switching to a New Store Type (Future Client)

To adapt the engine for a new client:

1. Create `config/stores/[storetype].config.ts` with the new store's values
2. Update the import in `engine/hooks/useStore.ts` and `engine/lib/config.ts`
3. Seed the new store's categories and sample products
4. Deploy as a separate Vercel project

No engine component code changes are needed.