const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configure seu banco PostgreSQL no Railway e adicione a URL aqui:
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Endpoints

// Listar todos os leads
app.get("/leads", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leads ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar leads" });
  }
});

// Criar novo lead
app.post("/leads", async (req, res) => {
  const { nome, etapa, responsavel, email } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO leads (nome, etapa, responsavel, email) VALUES ($1, $2, $3, $4) RETURNING *",
      [nome, etapa, responsavel, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar lead" });
  }
});

// Atualizar lead
app.put("/leads/:id", async (req, res) => {
  const id = req.params.id;
  const { nome, etapa, responsavel, email } = req.body;
  try {
    const result = await pool.query(
      `UPDATE leads SET nome=$1, etapa=$2, responsavel=$3, email=$4 WHERE id=$5 RETURNING *`,
      [nome, etapa, responsavel, email, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Lead não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar lead" });
  }
});

// Excluir lead
app.delete("/leads/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("DELETE FROM leads WHERE id=$1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Lead não encontrado" });
    res.json({ message: "Lead excluído com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir lead" });
  }
});

// Start
app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
