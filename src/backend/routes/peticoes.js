const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Prompts base para tipos de petição
const prompts = {
  oposicao: "Você é um advogado especialista em propriedade industrial. Gere uma petição de oposição para o processo INPI com os dados a seguir:",
  recurso: "Gere uma petição de recurso para indeferimento no INPI com os dados:",
  manifestacao: "Gere uma petição de manifestação para exigência do INPI com os dados:",
  relatorio: "Gere um relatório técnico de patente com os dados:"
};

router.post('/gerar', async (req, res) => {
  const { tipoPeticao, dadosProcesso } = req.body;

  if (!prompts[tipoPeticao]) {
    return res.status(400).json({ erro: 'Tipo de petição inválido' });
  }

  const prompt = `${prompts[tipoPeticao]}\n\n${JSON.stringify(dadosProcesso, null, 2)}`;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.5
    });

    const textoGerado = completion.data.choices[0].message.content;
    res.json({ texto: textoGerado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro na geração do texto' });
  }
});

module.exports = router;
