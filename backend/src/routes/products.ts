import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';

const router = Router();

// GET /api/products — list active products.
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, name, description, image_url, price, active, created_at FROM products WHERE active = TRUE ORDER BY id',
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id — single product.
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

const productInput = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  image_url: z.string().optional(),
  price: z.number().nonnegative().optional(),
  active: z.boolean().optional(),
});

// POST /api/products — create a product (admin use).
router.post('/', async (req, res, next) => {
  const parsed = productInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid product', details: parsed.error.flatten() });
    return;
  }
  const { name, description, image_url, price, active } = parsed.data;
  try {
    const { rows } = await query(
      `INSERT INTO products (name, description, image_url, price, active)
       VALUES ($1, $2, $3, $4, COALESCE($5, TRUE)) RETURNING *`,
      [name, description, image_url ?? null, price ?? null, active ?? null],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
