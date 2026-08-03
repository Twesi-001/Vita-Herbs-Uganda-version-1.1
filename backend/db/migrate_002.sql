-- Migration 002: add reviews table (customer testimonials, text or video)
-- Run once against the live database: psql "$DATABASE_URL" -f db/migrate_002.sql

CREATE TABLE IF NOT EXISTS reviews (
    id          SERIAL PRIMARY KEY,
    name        TEXT        NOT NULL,
    rating      SMALLINT    CHECK (rating BETWEEN 1 AND 5),
    body        TEXT,
    media_url   TEXT,
    media_type  TEXT        CHECK (media_type IN ('video')),
    status      TEXT        NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status     ON reviews (status);
