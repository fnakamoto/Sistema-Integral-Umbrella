require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const insertTestData = async () => {
  try {
    // Cria senha criptografada para o usuário de teste
    const senhaPlain = '123456';
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senhaPlain, salt);

    // Inserir usuário de teste
    const userResult = await pool.query(
      `INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *`,
      ['Usuário Teste', 'teste@umbrella.com', senhaHash]
    );

    console.log('Usuário de teste inserido:', userResult.rows[0]);

    // Inserir lead de teste
    const leadResult = await pool.query(
      `INSERT INTO leads (nome, email, telefone, etapa, responsavel) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      ['Lead Teste', 'lead@umbrella.com', '11999999999', 'Contato Inicial', 'Usuário Teste']
    );

    console.log('Lead de teste inserido:', leadResult.rows[0]);

  } catch (err) {
    console.error('Erro ao inserir dados de teste:', err);
  } finally {
    await pool.end();
  }
};

insertTestData();
