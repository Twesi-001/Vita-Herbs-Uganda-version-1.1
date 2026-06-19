-- KarOrganics Uganda — database schema
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

-- Site content table for admin-editable text across all sections.
CREATE TABLE IF NOT EXISTS site_content (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL DEFAULT '',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_content (key, value) VALUES
  ('hero.eyebrow',             'Natural Herbal Wellness'),
  ('hero.heading',             'Herbal Extract Medicine for Better Everyday Living'),
  ('hero.subtext',             'Kar Organics is a new herbal company focused on natural extract-based wellness products. Discover trusted herbal solutions and order easily through WhatsApp.'),
  ('about.hero.eyebrow',       'Our Story'),
  ('about.hero.heading',       'About KarOrganics Uganda'),
  ('about.hero.description',   'A heritage of healing herbs, a future of holistic wellness - rooted deeply in the rich soils of Uganda.'),
  ('about.story.eyebrow',      'Our Heritage'),
  ('about.story.heading',      'Crafted from heritage, made for today.'),
  ('about.story.body',         'KarOrganics Uganda was born from a simple belief: the herbs that have sustained East African communities for generations deserve to be shared with the world - pure, potent, and properly honored.'),
  ('about.pillar1.title',      'Purity'),
  ('about.pillar1.body',       'Only single-origin, ethically harvested herbs'),
  ('about.pillar2.title',      'Sustainability'),
  ('about.pillar2.body',       'Regenerative sourcing for future generations'),
  ('about.pillar3.title',      'Community'),
  ('about.pillar3.body',       'Fair partnerships with local farmers'),
  ('value.heading',            'You''re Not Buying Herbs. You''re Buying Your Body''s Way Back to Balance.'),
  ('value.subtext',            'Every KarOrganicsextract is crafted with a purpose - helping you feel like yourself again, naturally, day after day.'),
  ('value.card1.title',        'Wake Up Light & Renewed'),
  ('value.card1.text',         'Start your day clear-headed and refreshed - the way mornings are meant to feel.'),
  ('value.card2.title',        'Energy That Carries You'),
  ('value.card2.text',         'Steady energy that keeps you going - for your family, your work, and everything in between.'),
  ('value.card3.title',        'Trust in Every Drop'),
  ('value.card3.text',         'Single-origin herbs, nothing hidden. Know exactly what''s going into your body, every time.'),
  ('value.card4.title',        'Rooted in Community'),
  ('value.card4.text',         'Sourced directly from East African farmers. Your wellness journey helps build theirs too.'),
  ('social.whatsapp.url',      'https://wa.me/256760108564'),
  ('social.tiktok.url',        'https://www.tiktok.com/@vitaherbsuganda'),
  ('social.instagram.url',     'https://www.instagram.com/vitaherbsuganda'),
  ('social.facebook.url',      'https://www.facebook.com/vitaherbsuganda'),
  ('social.youtube.url',       'https://www.youtube.com/@vitaherbsuganda')
ON CONFLICT (key) DO NOTHING;
