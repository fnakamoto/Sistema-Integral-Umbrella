module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define("Task", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    titulo: DataTypes.STRING,
    descricao: DataTypes.TEXT,
    prazo: DataTypes.DATE,
    status: DataTypes.STRING,
    prioridade: DataTypes.STRING,
    leadId: DataTypes.UUID,
    responsavelId: DataTypes.UUID
  });
  return Task;
};
