const axios = require('axios');

exports.gerarCobranca = async (req, res) => {
  const { cliente, valor, tipo, vencimento } = req.body;

  if (!cliente || !valor || !tipo || !vencimento) {
    return res.status(400).json({ erro: 'Dados incompletos para geração de cobrança' });
  }

  try {
    // Exemplo de chamada para o Banco Inter - ajustar conforme API real e autenticação
    const responseBancoInter = await axios.post(
      'https://api.bancointer.com.br/cobrancas',
      { cliente, valor, tipo, vencimento },
      { headers: { Authorization: `Bearer ${process.env.TOKEN_BANCO_INTER}` } }
    );

    // Registro da cobrança no Astrea (exemplo)
    await axios.post(
      'https://api.astreafinanceiro.com/registro',
      {
        cliente,
        valor,
        dataPagamento: null,
        status: 'pendente'
      },
      { headers: { Authorization: `Bearer ${process.env.TOKEN_ASTREA}` } }
    );

    res.json({ sucesso: true, dadosBancoInter: responseBancoInter.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ erro: 'Falha ao gerar cobrança' });
  }
};
