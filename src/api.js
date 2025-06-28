// src/app.js
const express = require('express');
const leadsRouter = require('./routes/leads');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rotas da gestão de leads
app.use('/api/leads', leadsRouter);

// Rota raiz para teste rápido
app.get('/', (req, res) => {
  res.send('API Umbrella - Gestão de Leads funcionando');
});

// Start do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
