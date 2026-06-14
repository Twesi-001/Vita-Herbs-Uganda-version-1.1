-- VitaHerbs Uganda — database schema
-- Run with: npm run migrate   (or: psql "$DATABASE_URL" -f db/schema.sql)

CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        TEXT        NOT NULL,
    description TEXT        NOT NULL DEFAULT '',
    image_url   TEXT,
    price       NUMERIC(12, 2),
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscribers (
    id          SERIAL PRIMARY KEY,
    email       TEXT        NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inquiries (
    id          SERIAL PRIMARY KEY,
    name        TEXT        NOT NULL,
    phone       TEXT        NOT NULL,
    email       TEXT,
    product     TEXT        NOT NULL,
    quantity    TEXT        NOT NULL,
    message     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the featured products (only if the table is empty).
INSERT INTO products (name, description, image_url)
SELECT * FROM (VALUES
    ('Vita Detox Extract', 'Supports body cleansing and wellness balance.', '/assets/product-detox.jpg'),
    ('Vita Immune Boost',  'Made to support everyday immune wellness.',    '/assets/product-capsules.jpg'),
    ('Vita Joint Relief',  'Herbal support for movement comfort and wellness.', '/assets/product-oil.jpg')
) AS seed(name, description, image_url)
WHERE NOT EXISTS (SELECT 1 FROM products);
