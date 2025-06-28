const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Carregar variáveis do .env

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Importar rotas
const leadsRouter = require("./routes/leads");
const dashboardRouter = require("./routes/dashboard");
const exportRouter = require("./routes/export");
const { router: authRouter, autenticarToken } = require("./routes/auth");

// Rota pública de teste
app.get("/", (req, res) => {
  res.send("Servidor backend rodando com sucesso!");
});

// Rotas públicas (autenticação)
app.use("/api/auth", authRouter);

// Rotas protegidas (JWT obrigatório)
app.use("/api/leads", autenticarToken, leadsRouter);
app.use("/api/dashboard", autenticarToken, dashboardRouter);
app.use("/api/export", autenticarToken, exportRouter);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
