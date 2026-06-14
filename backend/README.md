# VitaHerbs Uganda — API Server

Express + PostgreSQL backend for the VitaHerbs website. Stores newsletter
subscribers, contact/order inquiries, and the product catalog.

## Requirements

- Node.js 20+
- A PostgreSQL database (local install, Docker, or a hosted one)

## Setup

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and set `DATABASE_URL` to point at your PostgreSQL database.

3. Create the tables (and seed the featured products):

   ```bash
   npm run migrate
   ```

4. Start the server:

   ```bash
   npm run dev      # auto-reloads on changes
   # or
   npm run build && npm start
   ```

   The API runs at `http://localhost:4000` by default.

### Getting a PostgreSQL database quickly

If you have Docker, this gives you one in seconds:

```bash
docker run --name vitaherbs-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vitaherbs -p 5432:5432 -d postgres:16
```

That matches the default `DATABASE_URL` in `.env.example`.

## API endpoints

| Method | Path                  | Purpose                              |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/api/health`         | Server + database status             |
| GET    | `/api/products`       | List active products                 |
| GET    | `/api/products/:id`   | Get one product                      |
| POST   | `/api/products`       | Create a product (admin)             |
| GET    | `/api/subscribers`    | List subscribers (admin)             |
| POST   | `/api/subscribers`    | Subscribe `{ email }`                |
| GET    | `/api/inquiries`      | List inquiries (admin)               |
| POST   | `/api/inquiries`      | Submit `{ name, phone, product, quantity, ... }` |

### Example requests

```bash
# Subscribe to the newsletter
curl -X POST http://localhost:4000/api/subscribers \
  -H "Content-Type: application/json" \
  -d '{"email":"someone@example.com"}'

# Submit a contact inquiry
curl -X POST http://localhost:4000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","phone":"+256...","product":"Vita Detox Extract","quantity":"2"}'
```

## Project layout

```text
backend/
  db/schema.sql        Tables + product seed data
  src/
    index.ts           Express app, middleware, route mounting
    db.ts              PostgreSQL connection pool
    migrate.ts         Applies schema.sql
    routes/
      products.ts
      subscribers.ts
      inquiries.ts
```

## Notes / next steps

- The admin endpoints (listing subscribers/inquiries, creating products) are
  currently **unauthenticated**. Add auth before exposing them publicly.
- Input is validated with [zod](https://zod.dev); invalid requests return `400`.
- CORS is restricted to `CORS_ORIGIN` (the frontend origin) in `.env`.
