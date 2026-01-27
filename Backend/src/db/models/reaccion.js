'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reaccion extends Model {
    static associate(models) {
      // Una reacción pertenece a un usuario y a una publicación
      this.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      this.belongsTo(models.Publicacion, { foreignKey: 'publicacionId', as: 'publicacion' });
    }
  }
  Reaccion.init({
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    publicacionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Reaccion',
  });
  return Reaccion;
};