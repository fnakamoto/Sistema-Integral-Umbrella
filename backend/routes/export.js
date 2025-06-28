const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { createObjectCsvStringifier } = require('csv-writer');

router.get('/leads/csv', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads');

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'nome', title: 'Nome' },
        { id: 'email', title: 'Email' },
        { id: 'telefone', title: 'Telefone' },
        { id: 'etapa', title: 'Etapa' },
        { id: 'responsavel', title: 'Responsável' },
        { id: 'criado_em', title: 'Criado em' },
      ],
    });

    const header = csvStringifier.getHeaderString();
    const content = csvStringifier.stringifyRecords(result.rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(header + content);
  } catch (err) {
    console.error('Erro ao exportar CSV:', err);
    res.status(500).json({ error: 'Erro ao exportar CSV' });
  }
});

module.exports = router;
