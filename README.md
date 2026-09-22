# Trefiwa E-shop

A full-stack e-commerce application built for a real product catalogue and an evolving online store.

The project demonstrates practical work across the customer journey: product discovery, account management, checkout, order processing and store administration.

## What it includes

- Product catalogue, categories, search and variants
- Shopping cart, favourites and recently viewed products
- Customer authentication, profiles and delivery addresses
- Checkout validation, delivery options and payment integration architecture
- Order history and administration for orders, inventory and reviews
- Automated tests covering catalogue, checkout, access control and payment safeguards

## Technology

- Next.js App Router and React
- TypeScript
- Prisma and PostgreSQL
- Vitest

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The catalogue and store features are developed continuously. Product content and shop functionality can therefore evolve between releases.

## Security

Live database access, payment credentials, session secrets and deployment settings are never committed. Copy `.env.example` to `.env.local` and provide your own local values when running the project.
