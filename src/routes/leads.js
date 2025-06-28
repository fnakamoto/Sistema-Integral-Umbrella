const express = require('express');
const router = express.Router();

// Para acessar o pool do banco, você pode importar ou passar ele via parâmetro.
// Aqui vamos assumir que você vai importar do server.js ou criar um módulo para isso:
const { pool } = require('../db'); // ajuste o caminho conforme sua estrutura

// Listar todos os leads
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar leads:', err);
    res.status(500).json({ error: 'Erro ao buscar leads' });
  }
});

// Criar um novo lead
router.post('/', async (req, res) => {
  const { nome, email, telefone, etapa, responsavel } = req.body;

  try {
    const query = `INSERT INTO leads (nome, email, telefone, etapa, responsavel) 
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [nome, email, telefone, etapa, responsavel];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar lead:', err);
    res.status(500).json({ error: 'Erro ao criar lead' });
  }
});

// Atualizar lead pelo id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, etapa, responsavel } = req.body;

  try {
    const query = `
      UPDATE leads SET nome=$1, email=$2, telefone=$3, etapa=$4, responsavel=$5
      WHERE id=$6 RETURNING *`;
    const values = [nome, email, telefone, etapa, responsavel, id];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar lead:', err);
    res.status(500).json({ error: 'Erro ao atualizar lead' });
  }
});

// Deletar lead pelo id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM leads WHERE id=$1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    res.json({ message: 'Lead deletado com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar lead:', err);
    res.status(500).json({ error: 'Erro ao deletar lead' });
  }
});

module.exports = router;
