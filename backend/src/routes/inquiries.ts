import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';

const router = Router();

const inquiryInput = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  product: z.string().min(1),
  quantity: z.string().min(1),
  message: z.string().optional(),
});

// POST /api/inquiries — store a contact/order inquiry.
router.post('/', async (req, res, next) => {
  const parsed = inquiryInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Missing required fields', details: parsed.error.flatten() });
    return;
  }
  const { name, phone, email, product, quantity, message } = parsed.data;
  try {
    const { rows } = await query(
      `INSERT INTO inquiries (name, phone, email, product, quantity, message)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, phone, email || null, product, quantity, message ?? null],
    );
    res.status(201).json({ message: 'Inquiry received', inquiry: rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/inquiries — list inquiries (admin use).
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
