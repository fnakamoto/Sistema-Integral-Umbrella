const express = require('express');
const leadsRouter = require('./routes/leads');  // caminho relativo dentro src

const app = express();
app.use(express.json());

app.use('/api/leads', leadsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
