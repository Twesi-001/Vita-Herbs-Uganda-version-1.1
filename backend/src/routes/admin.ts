import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { query } from '../db';
import { requireAdmin, signToken } from '../middleware/auth';
import { uploadToCloudinary } from '../lib/cloudinary';
import { sendBroadcastEmail } from '../lib/mailer';

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
    const [subs, contacts, products, reviews, videos] = await Promise.all([
      query<{ c: number }>('SELECT COUNT(*)::int AS c FROM subscribers'),
      query<{ c: number }>('SELECT COUNT(*)::int AS c FROM inquiries'),
      query<{ c: number }>('SELECT COUNT(*)::int AS c FROM products'),
      query<{ c: number }>('SELECT COUNT(*)::int AS c FROM reviews'),
      query<{ c: number }>('SELECT COUNT(*)::int AS c FROM videos'),
    ]);
    res.json({
      subscribers: subs.rows[0].c,
      contacts: contacts.rows[0].c,
      products: products.rows[0].c,
      reviews: reviews.rows[0].c,
      videos: videos.rows[0].c,
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
      'SELECT id, name, email, phone, product, quantity, message, status, created_at FROM inquiries ORDER BY created_at DESC',
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

const broadcastInput = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(10000),
});

const ALLOWED_ATTACHMENT_MIME = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const uploadAttachments = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_ATTACHMENT_MIME.includes(file.mimetype)) {
      cb(new Error('Only PDF, image, Word, or Excel files are allowed as attachments'));
      return;
    }
    cb(null, true);
  },
});

// POST /api/admin/subscribers/broadcast — email every subscriber at once.
router.post('/subscribers/broadcast', (req, res, next) => {
  uploadAttachments.array('attachments', 5)(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      res.status(400).json({ message });
      return;
    }
    next();
  });
}, async (req, res, next) => {
  const parsed = broadcastInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Subject and message are required' });
    return;
  }
  try {
    const { rows } = await query<{ email: string }>('SELECT email FROM subscribers');
    const recipients = rows.map((r) => r.email);
    if (recipients.length === 0) {
      res.status(400).json({ message: 'There are no subscribers to email yet' });
      return;
    }
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const attachments = files.map((f) => ({ filename: f.originalname, content: f.buffer, contentType: f.mimetype }));
    const { accepted, rejected } = await sendBroadcastEmail(recipients, parsed.data.subject, parsed.data.message, attachments);
    if (rejected.length > 0) {
      res.status(502).json({ message: `Gmail rejected ${rejected.length} of ${recipients.length} recipient${recipients.length === 1 ? '' : 's'}: ${rejected.join(', ')}` });
      return;
    }
    res.json({ message: `Sent to ${accepted.length} subscriber${accepted.length === 1 ? '' : 's'}` });
  } catch (err) {
    if (err instanceof Error && err.message.includes('EMAIL_USER')) {
      res.status(500).json({ message: 'Email is not configured on the server yet' });
      return;
    }
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

// ── Reviews moderation ────────────────────────────────────────────────────────

// GET /api/admin/reviews — all reviews, any status.
router.get('/reviews', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/reviews/:id/status
router.patch('/reviews/:id/status', async (req, res, next) => {
  const allowed = ['pending', 'approved', 'rejected'];
  const { status } = req.body;
  if (!allowed.includes(status)) {
    res.status(400).json({ message: 'Invalid status value' });
    return;
  }
  try {
    await query('UPDATE reviews SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ message: 'Review deleted' });
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
      'SELECT id, name, email, phone, product, quantity, message, status, created_at FROM inquiries ORDER BY created_at DESC',
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.send(toCsv(['id', 'name', 'email', 'phone', 'product', 'quantity', 'message', 'created_at'], rows));
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/export/products?token=...  -> CSV download
router.get('/export/products', async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, name, description, category, price, active, created_at FROM products ORDER BY id',
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    res.send(toCsv(['id', 'name', 'description', 'category', 'price', 'active', 'created_at'], rows));
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

// Single product for the admin edit form. The public GET /products/:id would
// mostly work, but it isn't behind requireAdmin and is free to start filtering
// to active-only — which would silently break editing a hidden product.
router.get('/products/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(rows[0]);
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

// ── Video management (company/product videos) ─────────────────────────────────

const videoInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['company', 'product']),
  video_url: z.string().min(1),
  active: z.boolean().optional(),
});

router.get('/videos', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM videos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/videos', async (req, res, next) => {
  const parsed = videoInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid video' }); return; }
  const { title, description, category, video_url, active } = parsed.data;
  try {
    const { rows } = await query(
      `INSERT INTO videos (title, description, category, video_url, active)
       VALUES ($1, $2, $3, $4, COALESCE($5, TRUE)) RETURNING *`,
      [title, description ?? null, category, video_url, active ?? null],
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/videos/:id', async (req, res, next) => {
  const parsed = videoInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: 'Invalid video' }); return; }
  const { title, description, category, video_url, active } = parsed.data;
  try {
    const { rows } = await query(
      `UPDATE videos SET title=$1, description=$2, category=$3, video_url=$4, active=COALESCE($5, active) WHERE id=$6 RETURNING *`,
      [title, description ?? null, category, video_url, active ?? null, req.params.id],
    );
    if (rows.length === 0) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/videos/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM videos WHERE id=$1', [req.params.id]);
    res.json({ message: 'Video deleted' });
  } catch (err) { next(err); }
});

// POST /api/admin/upload-video — proxy video upload to Cloudinary (admin only,
// so a generous size limit is fine — no public abuse surface like the
// reviews upload endpoint has).
const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime'];
const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_VIDEO_MIME.includes(file.mimetype)) {
      cb(new Error('Only mp4, webm, or mov video files are allowed'));
      return;
    }
    cb(null, true);
  },
});

router.post('/upload-video', (req, res, next) => {
  uploadVideo.single('file')(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      res.status(400).json({ message });
      return;
    }
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const url = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype, 'video');
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'Upload failed' });
  }
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
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const url = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype, 'image');
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'Cloudinary upload failed' });
  }
});

export default router;
