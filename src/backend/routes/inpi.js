const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// Rota para consulta pública INPI via scraping
router.get('/consulta', async (req, res) => {
  const { processo } = req.query;
  if (!processo) return res.status(400).json({ erro: 'Informe número do processo' });

  try {
    // Delay para não sobrecarregar
    await new Promise(r => setTimeout(r, 1500));

    // URL simulada - ajustar conforme o site real do INPI
    const url = `https://gru.inpi.gov.br/pePI/servlet/PatenteServlet?numeroProcesso=${encodeURIComponent(processo)}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });

    const $ = cheerio.load(response.data);

    // Exemplo de extração - ajustar para o html real
    const titular = $('td:contains("Titular")').next().text().trim() || 'Não encontrado';
    const status = $('td:contains("Situação")').next().text().trim() || 'Não encontrado';
    const classesNice = [];
    $('td:contains("Classe")').next().each((i, el) => classesNice.push($(el).text().trim()));
    const ultimosDespachos = [];
    $('td:contains("Últimos Despachos")').next().find('li').each((i, el) => ultimosDespachos.push($(el).text().trim()));

    res.json({ processo, titular, status, classesNice, ultimosDespachos });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao consultar INPI', detalhe: error.message });
  }
});

module.exports = router;
