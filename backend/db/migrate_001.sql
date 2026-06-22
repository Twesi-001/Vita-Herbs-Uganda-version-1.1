-- Migration 001: indexes, inquiry status, quantity type fix
-- Run once against the live database

-- Add status column if not exists
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status     ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_products_active      ON products (active);
