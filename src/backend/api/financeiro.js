const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Geração de cobrança com integração Banco Inter e Astrea
app.post('/api/financeiro/cobranca', async (req, res) => {
  const { cliente, valor, tipo, vencimento } = req.body;

  if (!cliente || !valor || !tipo || !vencimento) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  try {
    // 1. Envia cobrança para o Banco Inter
    const response = await axios.post(
      'https://api.bancointer.com.br/cobrancas',
      { cliente, valor, tipo, vencimento },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN_BANCO_INTER}`,
        },
      }
    );

    // 2. Após sucesso, registra no Astrea
    await axios.post(
      'https://api.astreafinanceiro.com/registro',
      {
        cliente,
        valor,
        dataPagamento: null,
        status: 'pendente',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOKEN_ASTREA}`,
        }
      }
    );

    res.json({ sucesso: true, dadosBancoInter: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ erro: 'Falha ao gerar cobrança' });
  }
});

app.listen(PORT, () => {
  console.log(`Financeiro rodando na porta ${PORT}`);
});
