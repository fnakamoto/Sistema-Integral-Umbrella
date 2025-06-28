module.exports = (sequelize, DataTypes) => {
  const Perfil = sequelize.define("Perfil", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nome: DataTypes.STRING
  });
  return Perfil;
};
