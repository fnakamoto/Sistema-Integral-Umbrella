const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Lead = require("./Lead")(sequelize, DataTypes);
const User = require("./User")(sequelize, DataTypes);
const Perfil = require("./Perfil")(sequelize, DataTypes);
const EmailTemplate = require("./EmailTemplate")(sequelize, DataTypes);
const Task = require("./Task")(sequelize, DataTypes);
const PipelineConfig = require("./PipelineConfig")(sequelize, DataTypes);

// Associações
User.belongsTo(Perfil, { as: "perfil", foreignKey: "perfilId" });
Lead.belongsTo(User, { as: "usuario_responsavel", foreignKey: "usuarioResponsavelId" });
Task.belongsTo(Lead, { foreignKey: "leadId" });
Task.belongsTo(User, { as: "responsavel", foreignKey: "responsavelId" });

module.exports = {
  sequelize,
  Lead,
  User,
  Perfil,
  EmailTemplate,
  Task,
  PipelineConfig
};
