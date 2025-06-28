const jwt = require("jsonwebtoken");
const { User, Perfil } = require("../models");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token não fornecido" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      where: { id: decoded.id },
      include: { model: Perfil, as: "perfil" }
    });

    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};
