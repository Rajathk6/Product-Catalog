// src/routes/products.js
import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // cap to prevent abuse
    const { category, cursor_created_at, cursor_id } = req.query;

    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (cursor_created_at && cursor_id) {
      params.push(cursor_created_at, cursor_id);
      conditions.push(`(created_at, id) < ($${params.length - 1}, $${params.length})`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(limit);
    const query = `
      SELECT id, name, category, price, created_at, updated_at
      FROM products
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT $${params.length}
    `;

    const { rows } = await pool.query(query, params);

    const lastRow = rows[rows.length - 1];
    const nextCursor = lastRow
      ? { created_at: lastRow.created_at, id: lastRow.id }
      : null;

    res.json({
      data: rows,
      next_cursor: nextCursor,
      has_more: rows.length === limit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;