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
