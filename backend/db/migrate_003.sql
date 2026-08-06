-- Migration 003: add videos table (admin-uploaded company/product videos)
-- Run once against the live database: psql "$DATABASE_URL" -f db/migrate_003.sql

CREATE TABLE IF NOT EXISTS videos (
    id          SERIAL PRIMARY KEY,
    title       TEXT        NOT NULL,
    description TEXT,
    category    TEXT        NOT NULL CHECK (category IN ('company', 'product')),
    video_url   TEXT        NOT NULL,
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_active   ON videos (active);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos (category);
