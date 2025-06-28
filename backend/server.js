require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiter para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: "Muitas tentativas de login, por favor tente novamente depois de 15 minutos.",
});

// Swagger UI
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Importar rotas
const leadsRouter = require("./routes/leads");
const exportRouter = require("./routes/export");
const exportPdfRouter = require("./routes/exportPdf");
const dbUpdateRouter = require("./routes/dbupdate");
const usuariosRouter = require("./routes/usuarios");
const { router: authRouter, autenticarToken } = require("./routes/auth");

// Rota pública de teste
app.get("/", (req, res) => {
  res.send("Servidor backend rodando com sucesso!");
});

// Rota pública com rate limiter no login
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRouter);

// Rotas protegidas (token obrigatório)
app.use("/api/leads", autenticarToken, leadsRouter);
app.use("/api/export", autenticarToken, exportRouter);
app.use("/api/export", autenticarToken, exportPdfRouter);
app.use("/api/usuarios", autenticarToken, usuariosRouter);

// Rota temporária de atualização de banco (remover depois)
app.use("/api/dbupdate", dbUpdateRouter);

// Tratamento de erros com log
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// Inicia o servidor
app.listen(port, () => {
  logger.info(`Servidor rodando na porta ${port}`);
});
