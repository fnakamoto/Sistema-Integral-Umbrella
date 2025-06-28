const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Para todas as rotas que não forem /api, retorna o index.html (SPA fallback)
app.get('*', (req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

// Rotas da API
const { router: authRouter, autenticarToken } = require('./routes/auth');
const leadsRouter = require('./routes/leads');

app.use('/api/auth', authRouter);
app.use('/api/leads', autenticarToken, leadsRouter);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
