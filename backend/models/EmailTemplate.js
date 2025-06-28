module.exports = (sequelize, DataTypes) => {
  const EmailTemplate = sequelize.define("EmailTemplate", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nome: DataTypes.STRING,
    conteudo: DataTypes.TEXT,
    variaveis: DataTypes.ARRAY(DataTypes.STRING)
  });
  return EmailTemplate;
};
