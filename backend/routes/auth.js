const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Usuario } = require("../models");
const { addToken, isBlacklisted } = require("../utils/tokenBlacklist");
const enviarEmail = require("../utils/email");
const { autenticarToken } = require("./authMiddleware");
const yup = require("yup");

const router = express.Router();

// Validação com yup
const schemaLogin = yup.object({
  email: yup.string().email().required(),
  senha: yup.string().required(),
});

const schemaCadastro = yup.object({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  senha: yup.string().min(6).required(),
});

// Login
router.post("/login", async (req, res) => {
  try {
    await schemaLogin.validate(req.body);

    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cadastro
router.post("/register", async (req, res) => {
  try {
    await schemaCadastro.validate(req.body);

    const { nome, email, senha } = req.body;

    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: "Usuário já cadastrado" });
    }

    const hash = await bcrypt.hash(senha, 10);
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: hash,
      role: "user", // padrão
    });

    // Enviar e-mail de boas-vindas
    await enviarEmail(email, "Bem-vindo à Umbrella Marcas", "welcome", {
      nome,
      email,
    });

    res.status(201).json({ message: "Usuário cadastrado com sucesso" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Logout
router.post("/logout", autenticarToken, async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.exp) {
      return res.status(400).json({ error: "Token inválido" });
    }

    await addToken(token, decoded.exp);
    res.json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao processar logout" });
  }
});

module.exports = { router, autenticarToken };
