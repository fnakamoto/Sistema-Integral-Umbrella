const express = require('express');
const leadsRouter = require('./routes/leads');
const financeiroRouter = require('./routes/financeiro');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/leads', leadsRouter);
app.use('/api/financeiro', financeiroRouter);

app.get('/', (req, res) => {
  res.send('API Umbrella - Gestão de Leads e Financeiro funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
