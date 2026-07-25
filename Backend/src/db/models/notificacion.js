'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notificacion extends Model {
    static associate(models) {
      // Destinatario: quien recibe/lee la notificación
      this.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      // Actor: quien generó la acción (quien comentó o reaccionó)
      this.belongsTo(models.Usuario, { foreignKey: 'actorId', as: 'actor' });
      this.belongsTo(models.Publicacion, { foreignKey: 'publicacionId', as: 'publicacion' });
      // Solo aplica a notificaciones de tipo comentario/respuesta
      this.belongsTo(models.Comentario, { foreignKey: 'comentarioId', as: 'comentario' });
    }
  }
  Notificacion.init({
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    actorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // 'comentario' | 'respuesta' | 'reaccion'
    tipo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    publicacionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comentarioId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    leida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Notificacion',
  });
  return Notificacion;
};
