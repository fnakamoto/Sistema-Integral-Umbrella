// Estrutura de backend da Umbrella
// Arquivos: config, middleware, models, app.js, server.js

// config/database.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;

// config/permissoes.js
module.exports = {
  Master: ["ver_todos_leads", "editar_etapas", "gerar_boletos", "acessar_financeiro", "administrar_usuarios"],
  Consultor: ["ver_leads", "editar_etapas"],
  Financeiro: ["ver_financeiro", "gerar_boletos"],
  Atendimento: ["ver_leads", "editar_atendimento"]
};

// middleware/auth.js
const jwt = require("jsonwebtoken");
const { User, Perfil } = require("../models");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token não fornecido" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      where: { id: decoded.id },
      include: { model: Perfil, as: "perfil" }
    });

    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

// middleware/checkPermission.js
const permissoes = require("../config/permissoes");

module.exports = function (acao) {
  return (req, res, next) => {
    const perfilNome = req.user.perfil.nome;
    const permissoesPerfil = permissoes[perfilNome] || [];
    if (permissoesPerfil.includes(acao)) {
      next();
    } else {
      return res.status(403).json({ error: "Acesso negado. Permissão insuficiente." });
    }
  };
};

// models/index.js
const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Lead = require("./Lead")(sequelize, DataTypes);
const User = require("./User")(sequelize, DataTypes);
const Perfil = require("./Perfil")(sequelize, DataTypes);
const EmailTemplate = require("./EmailTemplate")(sequelize, DataTypes);
const Task = require("./Task")(sequelize, DataTypes);
const PipelineConfig = require("./PipelineConfig")(sequelize, DataTypes);

User.belongsTo(Perfil, { as: "perfil", foreignKey: "perfilId" });
Lead.belongsTo(User, { as: "usuario_responsavel", foreignKey: "usuarioResponsavelId" });
Task.belongsTo(Lead, { foreignKey: "leadId" });
Task.belongsTo(User, { as: "responsavel", foreignKey: "responsavelId" });

module.exports = {
  sequelize,
  Lead,
  User,
  Perfil,
  EmailTemplate,
  Task,
  PipelineConfig
};

// app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { sequelize } = require("./models");
const logger = require("./logger");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

app.get("/", (req, res) => res.send("API Umbrella funcionando"));

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexão com banco realizada");
  } catch (err) {
    console.error("Erro banco:", err);
  }
})();

module.exports = app;

// server.js
const app = require("./app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// logger.js
const winston = require("winston");
require("winston-daily-rotate-file");

const transport = new winston.transports.DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d"
});

const logger = winston.createLogger({
  transports: [transport],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

module.exports = logger;

// .env.example
DATABASE_URL=postgres://user:password@localhost:5432/umbrella_db
JWT_SECRET=algumasecret123
PORT=3000
INTER_TOKEN=token_banco_inter
ASTREA_KEY=chave_api_astrea
RD_TOKEN=token_rd_station
NFSE_TOKEN=token_nfse_londrina
CNPJ_UMBRELLA=00000000000000
