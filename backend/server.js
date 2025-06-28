const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configurar a conexão com o PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Testar a conexão
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar no banco de dados:', err.stack);
  }
  console.log('Conectado ao banco de dados PostgreSQL com sucesso!');
  release();
});

// Exemplo de rota
app.get("/", (req, res) => {
  res.send("Servidor backend rodando com sucesso!");
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
