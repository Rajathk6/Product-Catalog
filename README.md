# Product Catalog API

A backend that lets someone browse ~200,000 products (newest first), filter by category, and paginate through them — fast, and correctly even while data is changing underneath them.

**Live demo:** https://product-catalog-3tkp.onrender.com/
**API base:** https://product-catalog-3tkp.onrender.com/products

> ⚠️ Hosted on Render's free tier — the service spins down after 15 minutes of inactivity and takes ~30–60s to wake up on the first request. If the page or API looks unresponsive at first, wait a few seconds and try again.

---

## Stack

- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Supabase, session pooler connection)
- **Pagination:** Cursor-based (keyset), using `(created_at, id)` as the cursor
- **Bulk loading:** Postgres `COPY FROM STDIN`, streamed via Node `Readable`

---

## Schema

```sql
CREATE TABLE products (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_pagination ON products (created_at DESC, id DESC);
CREATE INDEX idx_products_category_pagination ON products (category, created_at DESC, id DESC);
```

## API

### `GET /products`

| Query param | Type | Description |
|---|---|---|
| `limit` | number | Page size, default 20, capped at 100 |
| `category` | string | Optional category filter |
| `cursor_created_at` | ISO timestamp | Cursor from a previous response's `next_cursor` |
| `cursor_id` | number | Cursor from a previous response's `next_cursor` |

**Response:**
```json
{
  "data": [ { "id": "...", "name": "...", "category": "...", "price": "...", "created_at": "...", "updated_at": "..." } ],
  "next_cursor": { "created_at": "...", "id": "..." },
  "has_more": true
}
```

To fetch the next page, pass the `next_cursor` fields back as `cursor_created_at` / `cursor_id`.

## Seeding the database

```bash
npm run seed
```

Generates 200,000 products and loads them in ~7 seconds via `COPY`.

## Local setup

```bash
git clone https://github.com/Rajathk6/Product-Catalog
cd product-catalog
npm install
cp .env.example .env   # fill in your DATABASE_URL
npm run seed             # populates 200,000 products
npm run dev               # starts the server with auto-reload
```

Visit `http://localhost:3000/` for the UI, or `http://localhost:3000/products` for the raw API.
