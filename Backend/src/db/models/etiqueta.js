'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Etiqueta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Relacion con la tabla publicacion 
      this.belongsToMany(models.Publicacion,{ 
        through: "PublicacionEtiqueta",
        foreignKey: "etiquetaId",
        otherKey: "publicacionId",
        as: "publicaciones"       
      });
    }
  }
  Etiqueta.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1,50]
      },
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Etiqueta',
  });
  return Etiqueta;
};