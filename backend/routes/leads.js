const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Rota GET com filtros para listar leads
router.get('/', async (req, res) => {
  const {
    responsavel,
    etapa,
    inicio,  // data inicial YYYY-MM-DD
    fim,     // data final YYYY-MM-DD
    page = 1,
    limit = 20,
  } = req.query;

  let whereClauses = [];
  let values = [];
  let idx = 1;

  if (responsavel && responsavel.toLowerCase() !== 'todos') {
    whereClauses.push(`responsavel = $${idx++}`);
    values.push(responsavel);
  }

  if (etapa && etapa.toLowerCase() !== 'todos') {
    whereClauses.push(`etapa = $${idx++}`);
    values.push(etapa);
  }

  if (inicio) {
    whereClauses.push(`criado_em >= $${idx++}`);
    values.push(inicio);
  }

  if (fim) {
    whereClauses.push(`criado_em <= $${idx++}`);
    values.push(fim);
  }

  const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const offset = (page - 1) * limit;

  try {
    const query = `
      SELECT * FROM leads
      ${where}
      ORDER BY criado_em DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    values.push(limit);
    values.push(offset);

    const result = await pool.query(query, values);

    // Contar total para paginação
    const countQuery = `SELECT COUNT(*) FROM leads ${where}`;
    const countResult = await pool.query(countQuery, values.slice(0, values.length - 2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      leads: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Erro ao listar leads com filtros:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
