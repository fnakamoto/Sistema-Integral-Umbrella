const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/kpis', async (req, res) => {
  try {
    // Total leads por etapa
    const etapasRes = await pool.query(`
      SELECT etapa, COUNT(*) as total
      FROM leads
      GROUP BY etapa
    `);

    // Total leads por responsável
    const responsaveisRes = await pool.query(`
      SELECT responsavel, COUNT(*) as total
      FROM leads
      GROUP BY responsavel
    `);

    // Leads criados no último mês
    const ultimoMesRes = await pool.query(`
      SELECT COUNT(*) as total
      FROM leads
      WHERE criado_em >= NOW() - INTERVAL '1 month'
    `);

    res.json({
      leadsPorEtapa: etapasRes.rows,
      leadsPorResponsavel: responsaveisRes.rows,
      leadsUltimoMes: ultimoMesRes.rows[0].total,
    });
  } catch (err) {
    console.error('Erro ao buscar KPIs:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
