import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { requireAdmin, signToken } from '../middleware/auth';

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

const loginInput = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/admin/login — exchange credentials for a JWT.
router.post('/login', (req, res) => {
  const parsed = loginInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }
  const { username, password } = parsed.data;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  res.json({ token: signToken(username) });
});

// Everything below this line requires a valid admin token.
router.use(requireAdmin);

// GET /api/admin/stats — dashboard counts.
router.get('/stats', async (_req, res, next) => {
  try {
    const [subs, contacts, products] = await Promise.all([
      query<{ c: number }>('SELECT COUNT(*)::int AS c FROM subscribers'),
      query<{ c: number }>('SELECT COUNT(*)::int AS c FROM inquiries'),
      query<{ c: number }>('SELECT COUNT(*)::int AS c FROM products'),
    ]);
    res.json({
      subscribers: subs.rows[0].c,
      contacts: contacts.rows[0].c,
      products: products.rows[0].c,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/subscribers
router.get('/subscribers', async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC',
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/contacts — contact inquiries.
router.get('/contacts', async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, phone, product, quantity, message, created_at FROM inquiries ORDER BY created_at DESC',
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/subscribers/:id
router.delete('/subscribers/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM subscribers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Subscriber deleted' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/contacts/:id
router.delete('/contacts/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM inquiries WHERE id = $1', [req.params.id]);
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    next(err);
  }
});

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const escape = (value: unknown): string => {
    const s =
      value == null ? '' : value instanceof Date ? value.toISOString() : String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

// GET /api/admin/export/subscribers?token=...  -> CSV download
router.get('/export/subscribers', async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC',
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
    res.send(toCsv(['id', 'email', 'created_at'], rows));
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/export/contacts?token=...  -> CSV download
router.get('/export/contacts', async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, phone, product, quantity, message, created_at FROM inquiries ORDER BY created_at DESC',
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.send(toCsv(['id', 'name', 'email', 'phone', 'product', 'quantity', 'message', 'created_at'], rows));
  } catch (err) {
    next(err);
  }
});

// ── Product management ────────────────────────────────────────────────────────

const productInput = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  image_url: z.string().optional(),
  price: z.number().nonnegative().optional(),
  active: z.boolean().optional(),
});

router.get('/products', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM products ORDER BY id');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/products', async (req, res, next) => {
  const parsed = productInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Invalid product' }); return; }
  const { name, description, image_url, price, active } = parsed.data;
  try {
    const { rows } = await query(
      `INSERT INTO products (name, description, image_url, price, active)
       VALUES ($1, $2, $3, $4, COALESCE($5, TRUE)) RETURNING *`,
      [name, description, image_url ?? null, price ?? null, active ?? null],
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/products/:id', async (req, res, next) => {
  const parsed = productInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Invalid product' }); return; }
  const { name, description, image_url, price, active } = parsed.data;
  try {
    const { rows } = await query(
      `UPDATE products SET name=$1, description=$2, image_url=$3, price=$4, active=COALESCE($5, active) WHERE id=$6 RETURNING *`,
      [name, description, image_url ?? null, price ?? null, active ?? null, req.params.id],
    );
    if (rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
});

// ── Site content management ───────────────────────────────────────────────────

router.put('/content/:key', async (req, res, next) => {
  const parsed = z.object({ value: z.string() }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'value is required' }); return; }
  try {
    await query(
      `INSERT INTO site_content (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()`,
      [req.params.key, parsed.data.value],
    );
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
