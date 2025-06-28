const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Validação simples (pode melhorar depois)
function validarLead(dados) {
  const { nome, email, telefone, etapa, responsavel } = dados;
  if (!nome || !email) return false;
  // Você pode adicionar validações mais robustas aqui
  return true;
}

// GET /api/leads - listagem com filtros (como antes)
router.get('/', async (req, res) => {
  // ... seu código de filtros e paginação já enviado anteriormente ...
});

// POST /api/leads - criar novo lead
router.post('/', async (req, res) => {
  const { nome, email, telefone, etapa, responsavel } = req.body;

  if (!validarLead(req.body)) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads (nome, email, telefone, etapa, responsavel)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nome, email, telefone, etapa, responsavel]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar lead:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// PUT /api/leads/:id - atualizar lead existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, etapa, responsavel } = req.body;

  if (!validarLead(req.body)) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      `UPDATE leads SET nome=$1, email=$2, telefone=$3, etapa=$4, responsavel=$5
       WHERE id=$6 RETURNING *`,
      [nome, email, telefone, etapa, responsavel, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lead não encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar lead:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// DELETE /api/leads/:id - deletar lead
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM leads WHERE id=$1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lead não encontrado.' });
    }

    res.json({ message: 'Lead deletado com sucesso.', lead: result.rows[0] });
  } catch (err) {
    console.error('Erro ao deletar lead:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

module.exports = router;
