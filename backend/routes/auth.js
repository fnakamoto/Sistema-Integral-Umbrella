const jwt = require("jsonwebtoken");
const { isBlacklisted } = require("../utils/tokenBlacklist");

async function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  if (await isBlacklisted(token)) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.usuario = usuario;
    next();
  });
}

module.exports = { autenticarToken };
