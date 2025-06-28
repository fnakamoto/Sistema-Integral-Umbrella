const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { addToken } = require("../utils/tokenBlacklist");
const { autenticarToken } = require("./authMiddleware"); // ou onde estiver seu middleware

router.post("/logout", autenticarToken, async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(400).json({ error: "Token não encontrado" });

    // Decodificar token para pegar o exp (expiração)
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ error: "Token inválido" });
    }

    await addToken(token, decoded.exp);

    res.json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    console.error("Erro no logout:", err);
    res.status(500).json({ error: "Erro ao processar logout" });
  }
});

module.exports = router;
