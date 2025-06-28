const express = require("express");
const { Usuario } = require("../models");
const { autenticarToken } = require("./authMiddleware");

const router = express.Router();

// GET /api/profile - retorna dados do usuário autenticado
router.get("/", autenticarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: ["id", "nome", "email", "role", "createdAt"],
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar perfil do usuário" });
  }
});

module.exports = router;
