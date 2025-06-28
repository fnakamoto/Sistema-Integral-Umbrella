const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secretdafabiano';

// Registrar novo usuário
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  try {
    // Verificar se usuário já existe
    const userExists = await pool.query('SELECT * FROM usuarios WHERE email=$1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já cadastrado' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(senha, salt);

    // Inserir usuário no banco
    const newUser = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, hashSenha]
    );

    res.status(201).json({ user: newUser.rows[0] });
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    // Buscar usuário pelo email
    const user = await pool.query('SELECT * FROM usuarios WHERE email=$1', [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    // Comparar senha
    const validSenha = await bcrypt.compare(senha, user.rows[0].senha);

    if (!validSenha) {
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.rows[0].id, nome: user.rows[0].nome, email: user.rows[0].email },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Middleware para proteger rotas
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

module.exports = { router, autenticarToken };
