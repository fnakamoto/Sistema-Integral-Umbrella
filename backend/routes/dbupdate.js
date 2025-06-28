const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.post('/add-role-column', async (req, res) => {
  try {
    await pool.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'");
    res.json({ message: "Coluna 'role' adicionada com sucesso!" });
  } catch (error) {
    console.error("Erro ao adicionar coluna 'role':", error);
    res.status(500).json({ error: "Erro ao adicionar coluna 'role'." });
  }
});

module.exports = router;
