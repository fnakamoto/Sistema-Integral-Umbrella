module.exports = (sequelize, DataTypes) => {
  const PipelineConfig = sequelize.define("PipelineConfig", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    usuarioId: DataTypes.UUID,
    etapasOrdem: DataTypes.ARRAY(DataTypes.STRING),
    coresEtapas: DataTypes.JSON,
    colunasVisiveis: DataTypes.ARRAY(DataTypes.STRING)
  });
  return PipelineConfig;
};
