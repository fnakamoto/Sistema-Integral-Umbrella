const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Endpoint: Consulta Pública INPI
app.get('/api/inpi/consulta', async (req, res) => {
  const { processo } = req.query;
  if (!processo) return res.status(400).json({ erro: 'Informe número do processo' });

  try {
    // Delay para respeitar o servidor
    await new Promise(r => setTimeout(r, 1500));

    // Exemplo de URL (ajuste conforme estrutura real do INPI)
    const url = `https://gru.inpi.gov.br/pePI/servlet/PatenteServlet?numeroProcesso=${encodeURIComponent(processo)}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      }
    });

    const $ = cheerio.load(response.data);

    // Extração simulada (ajustar conforme estrutura HTML real)
    const titular = $('td:contains("Titular")').next().text().trim() || 'Não encontrado';
    const status = $('td:contains("Situação")').next().text().trim() || 'Não encontrado';
    const classesNice = [];
    $('td:contains("Classe")').next().each((_, el) => classesNice.push($(el).text().trim()));
    const ultimosDespachos = [];
    $('td:contains("Últimos Despachos")').next().find('li').each((_, el) => ultimosDespachos.push($(el).text().trim()));

    res.json({ processo, titular, status, classesNice, ultimosDespachos });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Erro ao consultar INPI', detalhe: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API INPI rodando na porta ${PORT}`);
});
