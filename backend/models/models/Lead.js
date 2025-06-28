module.exports = (sequelize, DataTypes) => {
  const Lead = sequelize.define("Lead", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nome: DataTypes.STRING,
    email: DataTypes.STRING,
    cpf_cnpj: DataTypes.STRING,
    endereco: DataTypes.STRING,
    telefone: DataTypes.STRING,
    etapa: DataTypes.STRING,
    valor: DataTypes.FLOAT,
    dataCriacao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    usuarioResponsavelId: DataTypes.UUID,
    statusPagamento: DataTypes.STRING,
    envioAutomatico: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
  return Lead;
};
