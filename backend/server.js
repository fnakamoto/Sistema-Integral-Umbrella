require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiter para login - 10 tentativas a cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: "Muitas tentativas de login, por favor tente novamente depois de 15 minutos."
});

// Importar rotas e middleware de autenticação
const leadsRouter = require("./routes/leads");
const exportRouter = require("./routes/export");
const exportPdfRouter = require("./routes/exportPdf");
const dbUpdateRouter = require("./routes/dbupdate");
const { router: authRouter, autenticarToken } = require("./routes/auth");

// Rota pública de teste
app.get("/", (req, res) => {
  res.send("Servidor backend rodando com sucesso!");
});

// Rotas públicas (autenticação)
app.use("/api/auth/login", loginLimiter); // Aplica o limiter só no login
app.use("/api/auth", authRouter);

// Rotas protegidas (apenas usuários autenticados)
app.use("/api/leads", autenticarToken, leadsRouter);
app.use("/api/export", autenticarToken, exportRouter);
app.use("/api/export", autenticarToken, exportPdfRouter);

// Rota temporária para atualização do banco (REMOVA DEPOIS DE USAR)
app.use("/api/dbupdate", dbUpdateRouter);

// Middleware para tratamento de erros com log
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).json({ error: "Erro interno do servidor" });
});

app.listen(port, () => {
  logger.info(`Servidor rodando na porta ${port}`);
});
