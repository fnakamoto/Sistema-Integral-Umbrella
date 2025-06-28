const express = require("express");
const { Usuario } = require("../models");
const { autenticarToken } = require("./authMiddleware");

const router = express.Router();

// Rota para listar todos os usuários (apenas para admins)
router.get("/", autenticarToken, async (req, res) => {
  try {
    if (req.usuario.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }

    const usuarios = await Usuario.findAll({
      attributes: ["id", "nome", "email", "role", "createdAt"]
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

module.exports = router;
