'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comentario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Relacion con tabla usuario
      this.belongsTo(models.Usuario,{
        foreignKey: "usuarioId",
        as: "usuario"
      });
      //Relacion con tabla publicacion
      this.belongsTo(models.Publicacion,{ //esta bien
        foreignKey: "publicacionId",
        as: "publicacion"
      });
    }
  }
  Comentario.init({
    contenido: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    fechaDeComentario: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
      isDate: true         // Verifica que sea una fecha válida
      }
    }
  }, {
    sequelize,
    modelName: 'Comentario',
  });
  return Comentario;
};