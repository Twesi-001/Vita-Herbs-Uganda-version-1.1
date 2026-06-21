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

export default router;
