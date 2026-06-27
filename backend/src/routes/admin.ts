import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { query } from '../db';
import { requireAdmin, signToken } from '../middleware/auth';

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH) {
  throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD_HASH environment variables are required');
}

async function getPasswordHash(): Promise<string> {
  const { rows } = await query<{ value: string }>(
    "SELECT value FROM site_content WHERE key = 'admin.password_hash'",
  );
  return rows[0]?.value ?? ADMIN_PASSWORD_HASH!;
}

const loginInput = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/admin/login — exchange credentials for a JWT.
router.post('/login', async (req, res) => {
  const parsed = loginInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }
  const { username, password } = parsed.data;
  const usernameMatch = username === ADMIN_USERNAME;
  const hash = await getPasswordHash();
  const passwordMatch = await bcrypt.compare(password, hash);
  if (!usernameMatch || !passwordMatch) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  res.json({ token: signToken(username) });
});

// Everything below this line requires a valid admin token.
router.use(requireAdmin);

// POST /api/admin/change-password
router.post('/change-password', async (req, res) => {
  const parsed = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'currentPassword and newPassword (min 8 chars) are required' });
    return;
  }
  const { currentPassword, newPassword } = parsed.data;
  const hash = await getPasswordHash();
  const match = await bcrypt.compare(currentPassword, hash);
  if (!match) {
    res.status(401).json({ message: 'Current password is incorrect' });
    return;
  }
  const newHash = await bcrypt.hash(newPassword, 12);
  await query(
    `INSERT INTO site_content (key, value) VALUES ('admin.password_hash', $1)
     ON CONFLICT (key) DO UPDATE SET value=$1, updated_at=NOW()`,
    [newHash],
  );
  res.json({ message: 'Password updated successfully' });
});

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

// PATCH /api/admin/contacts/:id/status
router.patch('/contacts/:id/status', requireAdmin, async (req, res, next) => {
  const allowed = ['new', 'read', 'responded', 'fulfilled'];
  const { status } = req.body;
  if (!allowed.includes(status)) {
    res.status(400).json({ message: 'Invalid status value' });
    return;
  }
  try {
    await query('UPDATE inquiries SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: 'Status updated' });
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
  category: z.string().optional(),
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
  const { name, description, image_url, price, category, active } = parsed.data;
  try {
    const { rows } = await query(
      `INSERT INTO products (name, description, image_url, price, category, active)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, TRUE)) RETURNING *`,
      [name, description, image_url ?? null, price ?? null, category ?? null, active ?? null],
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/products/:id', async (req, res, next) => {
  const parsed = productInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Invalid product' }); return; }
  const { name, description, image_url, price, category, active } = parsed.data;
  try {
    const { rows } = await query(
      `UPDATE products SET name=$1, description=$2, image_url=$3, price=$4, category=$5, active=COALESCE($6, active) WHERE id=$7 RETURNING *`,
      [name, description, image_url ?? null, price ?? null, category ?? null, active ?? null, req.params.id],
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

// POST /api/admin/upload — proxy image upload to Cloudinary using server-side credentials
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload', requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      res.status(500).json({ message: 'Cloudinary env vars not configured on server' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const crypto = await import('crypto');
    const signature = crypto.createHash('sha1')
      .update(`timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const formData = new FormData();
    const blob = new Blob([req.file.buffer as unknown as ArrayBuffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', 'karorganics');

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await cloudRes.json() as { secure_url?: string; error?: { message: string } };

    if (!data.secure_url) {
      res.status(500).json({ message: data.error?.message ?? 'Cloudinary upload failed' });
      return;
    }
    res.json({ url: data.secure_url });
  } catch (err) {
    next(err);
  }
});

export default router;
