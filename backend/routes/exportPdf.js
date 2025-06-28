const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const PDFDocument = require('pdfkit');

router.get('/leads/pdf', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leads');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    // Definir o tipo e cabeçalho do arquivo para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.pdf');

    // Pipe do PDF direto para a resposta HTTP
    doc.pipe(res);

    doc.fontSize(18).text('Relatório de Leads', { align: 'center' });
    doc.moveDown();

    // Cabeçalhos da tabela
    doc.fontSize(12);
    const tableTop = 80;
    const itemSpacing = 20;
    let y = tableTop;

    // Colunas
    doc.text('ID', 50, y);
    doc.text('Nome', 90, y);
    doc.text('Email', 200, y);
    doc.text('Telefone', 350, y);
    doc.text('Etapa', 450, y);
    doc.text('Responsável', 520, y);

    y += itemSpacing;

    // Dados dos leads
    result.rows.forEach((lead) => {
      doc.text(lead.id.toString(), 50, y);
      doc.text(lead.nome, 90, y);
      doc.text(lead.email, 200, y);
      doc.text(lead.telefone, 350, y);
      doc.text(lead.etapa, 450, y);
      doc.text(lead.responsavel, 520, y);
      y += itemSpacing;
      // Para evitar overflow, poderia adicionar lógica de quebra de página
    });

    doc.end();
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});

module.exports = router;
