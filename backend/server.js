require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar rotas e middleware de autenticação
const leadsRouter = require("./routes/leads");
const exportRouter = require("./routes/export");
const exportPdfRouter = require("./routes/exportPdf");
const { router: authRouter, autenticarToken } = require("./routes/auth");

// Rota pública de teste
app.get("/", (req, res) => {
  res.send("Servidor backend rodando com sucesso!");
});

// Rotas públicas (autenticação)
app.use("/api/auth", authRouter);

// Rotas protegidas (apenas usuários autenticados)
app.use("/api/leads", autenticarToken, leadsRouter);
app.use("/api/export", autenticarToken, exportRouter);
app.use("/api/export", autenticarToken, exportPdfRouter);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
