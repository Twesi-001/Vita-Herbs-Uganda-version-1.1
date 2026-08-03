import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { query } from '../db';
import { uploadToCloudinary } from '../lib/cloudinary';

const router = Router();

const reviewInput = z
  .object({
    name: z.string().min(1).max(120),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    body: z.string().max(2000).optional(),
    media_url: z.string().url().optional(),
    media_type: z.enum(['video']).optional(),
  })
  .refine((d) => (d.body && d.body.trim().length > 0) || d.media_url, {
    message: 'Provide review text or a video',
  });

// POST /api/reviews — public submission, always lands as 'pending'.
router.post('/', async (req, res, next) => {
  const parsed = reviewInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid review', details: parsed.error.flatten() });
    return;
  }
  const { name, rating, body, media_url, media_type } = parsed.data;
  try {
    const { rows } = await query(
      `INSERT INTO reviews (name, rating, body, media_url, media_type, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [name, rating ?? null, body ?? null, media_url ?? null, media_type ?? null],
    );
    res.status(201).json({ message: 'Thanks! Your review is pending approval.', review: rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews — public list, approved only.
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, rating, body, media_url, media_type, created_at
       FROM reviews WHERE status = 'approved' ORDER BY created_at DESC`,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews/upload — public but strictly limited video upload.
const ALLOWED_MIME = ['video/mp4', 'video/webm', 'video/quicktime'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      cb(new Error('Only mp4, webm, or mov video files are allowed'));
      return;
    }
    cb(null, true);
  },
});

router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err: unknown) => {
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

export default router;
