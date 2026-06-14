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

export default router;
