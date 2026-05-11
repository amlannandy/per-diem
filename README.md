# Per Diem — Multi-Location Menu Browser

A full-stack menu browser built on Square's Catalog and Locations APIs. Guests can switch between locations, browse items by category, search the menu, and view item details including modifiers — with time-of-day availability filtering applied automatically.

---

## Tech stack

| Layer    | Stack                                                                      |
| -------- | -------------------------------------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, TanStack Query, Motion, Axios |
| Backend  | Node.js, Express, TypeScript, Square Node SDK                              |
| Shared   | `@per-diem/types` — shared TypeScript interfaces across both apps          |
| Monorepo | pnpm workspaces                                                            |

---

## Running locally

### Prerequisites

- Node.js 20+
- pnpm 8+
- A Square developer account with a sandbox application

### 1. Installation

```bash
git clone <repo-url>
cd per-diem
pnpm install
```

### 2. Set up Square sandbox

1. Go to [developer.squareup.com](https://developer.squareup.com) and create a sandbox application
2. Grab your **sandbox access token** from the Credentials tab
3. Open the sandbox seller dashboard and create **two active locations** (Account & Settings → Locations) — the seed script requires at least two to demonstrate location-based filtering

### 3. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
```

Fill in `apps/backend/.env`:

```
PORT=3001
CORS_ORIGIN=http://localhost:3000
SQUARE_ACCESS_TOKEN=your_sandbox_token
SQUARE_ENVIRONMENT=Sandbox
```

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

`apps/frontend/.env` can be left empty for local dev — the Vite dev server proxies `/api` to the backend automatically.

### 4. Seed test data

```bash
pnpm --filter @per-diem/backend seed
```

This creates:

- 4 categories: Burgers, Sides, Drinks, Desserts
- 1 time-restricted category: Breakfast (available 07:00–11:00 in the location's timezone)
- 9 items with descriptions and images
- 1 modifier list (Sauces) attached to burgers
- Spicy Jalapeño Burger — only available at location 1 (for testing location filtering)

To reset and re-seed:

```bash
pnpm --filter @per-diem/backend clear
pnpm --filter @per-diem/backend seed
```

### 5. Start the dev servers

```bash
pnpm dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:3001](http://localhost:3001)

---

## Architecture decisions

### Monorepo with shared types

A `@per-diem/types` package sits between the frontend and backend. Every API response shape is defined once — the backend serialises to it, the frontend deserialises from it. No `any`, no duplicated interfaces, no silent drift between layers.

### All Square API calls go through the backend

The frontend never sees the Square access token. It talks only to our Express API, which handles authentication, pagination, and data transformation before responding. This is a hard requirement from Square's integration guidelines and a basic security hygiene rule.

### Single paginated catalog fetch

Instead of hitting Square's API once per entity type, we fetch all object types (`ITEM`, `CATEGORY`, `IMAGE`, `MODIFIER_LIST`, `AVAILABILITY_PERIOD`) in a single paginated call. The SDK's async iterator handles cursors automatically. We then build O(1) lookup maps for images and modifier lists before processing items — avoiding O(n²) scans across a potentially large catalog.

### `categoryId` deprecation

Square deprecated `CatalogItem.categoryId` in December 2023 in favour of `CatalogItem.categories[]`. We read from `categories[0].id` with `categoryId` as a fallback, and write using `categories` in the seed script.

### Time-of-day availability — category-level, location timezone

Square's `CatalogAvailabilityPeriod` objects are linked to **categories** via `CatalogCategory.availabilityPeriodIds`, not to individual items. One period covers one day of the week with a start and end time in local time. We fetch these periods alongside the catalog, then check whether the current wall-clock time in the **location's timezone** falls within any of the category's periods.

We pass the location's timezone from the frontend as a query param (`?timezone=Asia/Kolkata`) so the backend can evaluate availability correctly regardless of where the server is running.

Categories with no periods are always available. Categories outside their window are returned with `isAvailableNow: false` — the frontend shows them greyed out with a "Not available now" badge, rather than hiding them, so guests can see what's on the menu and plan accordingly.

### React Query for server state

All remote data lives in React Query. Location and catalog data are cached per query key, so switching between locations doesn't re-fetch if you've visited that location before. The catalog query is disabled until both `locationId` and `timezone` are available, preventing a request with missing params.

### Dependency injection for Express routers

Routers are factory functions (`createCatalogRouter(client)`) rather than module-level singletons. The Square client is initialised once in `index.ts` and passed in — routers have no knowledge of how the client was constructed, making them independently testable without module mocking.

---

## Trade-offs

**No item-level time availability** — Square's API exposes time-based availability at the category level only. Individual items cannot be restricted to specific hours through the Catalog API. This is a platform limitation, not a design choice. The workaround would be a custom data layer (e.g., a database storing per-item override windows), which is out of scope here.

**Placeholder images** — The seed script fetches images from `picsum.photos` and uploads them to Square. These are random placeholder images, not real food photos. In production, images would be uploaded through the Square seller dashboard or a proper asset pipeline.

**No persistent cart** — Cart state lives in React component state and is lost on refresh. A production implementation would store cart state in `localStorage` or a backend session.

**Single catalog fetch** — We fetch the entire catalog on each request and filter in memory. For merchants with thousands of items this would need pagination at the API boundary, response caching (Redis), or Square's `SearchCatalogObjects` endpoint with server-side filtering.

---

## What I'd build next

1. **Cart and subtotal** — Add items to a cart, handle modifier selections, and compute a subtotal. Wire into Square's Orders API for the next step toward real checkout.
2. **Inventory / out-of-stock** — Hit Square's Inventory API to surface per-location stock levels on item cards.
3. **Response caching** — Cache catalog responses in memory (or Redis) with a short TTL. The catalog rarely changes during a meal session and the current approach makes a fresh Square API call on every page load.
4. **Search on the backend** — Move search to `SearchCatalogObjects` so it works across a full catalog without needing to load everything into memory first.
5. **Error retry UI** — React Query supports automatic retries, but the UI should also expose a manual retry button on error states rather than a hard reload.
