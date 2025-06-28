const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../db');

// Cadastro de usuário
router.post('/register', async (req, res) => {
  try {
    const { username, email, senha, role = 'user' } = req.body;

    // Validar campos aqui (opcional)

    const hashedPassword = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      'INSERT INTO usuarios (username, email, senha_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, role]
    );

    res.status(201).json({ usuario: result.rows[0] });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

module.exports = router;
