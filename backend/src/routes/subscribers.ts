import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';

const router = Router();

const subscribeInput = z.object({
  email: z.string().email(),
});

// POST /api/subscribers — add a newsletter subscriber.
router.post('/', async (req, res, next) => {
  const parsed = subscribeInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }
  const email = parsed.data.email.toLowerCase();
  try {
    const { rows } = await query(
      `INSERT INTO subscribers (email) VALUES ($1)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, created_at`,
      [email],
    );
    if (rows.length === 0) {
      res.status(409).json({ error: 'This email is already subscribed.' });
      return;
    }
    res.status(201).json({ message: 'Subscribed', subscriber: rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/subscribers — list subscribers (admin use).
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
