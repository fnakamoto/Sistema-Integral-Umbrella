const permissoes = require("../config/permissoes");

module.exports = function (acao) {
  return (req, res, next) => {
    const perfilNome = req.user.perfil.nome;
    const permissoesPerfil = permissoes[perfilNome] || [];
    if (permissoesPerfil.includes(acao)) {
      next();
    } else {
      return res.status(403).json({ error: "Acesso negado. Permissão insuficiente." });
    }
  };
};
