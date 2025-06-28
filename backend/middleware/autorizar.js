function autorizar(rolesPermitidos = []) {
  return (req, res, next) => {
    const usuario = req.usuario; // já setado pelo middleware de autenticação

    if (!usuario) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    if (rolesPermitidos.length && !rolesPermitidos.includes(usuario.role)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    next();
  };
}

module.exports = autorizar;
