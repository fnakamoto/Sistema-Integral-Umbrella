require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const app = express();
const port = process.env.PORT || 3000;

// Middlewares globais
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
const profileRouter = require("./routes/profile");
const uploadRouter = require("./routes/upload");
const { router: authRouter, autenticarToken } = require("./routes/auth");

// Importar job de exportação
const exportQueue = require("./jobs/exportJob");

// Rota de status
app.get("/", (req, res) => {
  res.send("Servidor backend rodando com sucesso!");
});

// Rotas públicas
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRouter);

// Rotas protegidas
app.use("/api/leads", autenticarToken, leadsRouter);
app.use("/api/export", autenticarToken, exportRouter);
app.use("/api/export", autenticarToken, exportPdfRouter);
app.use("/api/usuarios", autenticarToken, usuariosRouter);
app.use("/api/profile", autenticarToken, profileRouter);
app.use("/api/upload", autenticarToken, uploadRouter);

// Rota temporária para atualização do banco
app.use("/api/dbupdate", dbUpdateRouter);

// Middleware de erro com log
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// Agendamento diário da exportação automática (24 horas)
setInterval(() => {
  exportQueue.add({});
}, 24 * 60 * 60 * 1000);

// Iniciar o servidor
app.listen(port, () => {
  logger.info(`Servidor rodando na porta ${port}`);
});
