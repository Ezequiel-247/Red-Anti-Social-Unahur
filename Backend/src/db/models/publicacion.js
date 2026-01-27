'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Publicacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Relacion con la tabla usuario
      this.belongsTo(models.Usuario,{
        foreignKey: "usuarioId",
        as: "usuario"
      });

      //Relacion con la tabla Comentario. --- corregido
      this.hasMany(models.Comentario,{
        foreignKey: "publicacionId",
        as: "comentarios"
      });

      //corregido
      this.hasMany(models.Imagen,{ 
        foreignKey: "publicacionId",
        as: "imagenes"
      });

      //Relacion con la tabla etiqueta N a N 
      this.belongsToMany(models.Etiqueta,{
        through: "PublicacionEtiqueta",
        foreignKey: "publicacionId",
        otherKey: "etiquetaId",
        as: "etiquetas"    
      });

      // Relacion con Reacciones (Likes)
      this.hasMany(models.Reaccion, {
        foreignKey: "publicacionId",
        as: "reacciones"
      });

      // Relacion N:M inversa (Para ver qué usuarios dieron like a este post)
      this.belongsToMany(models.Usuario, {
        through: models.Reaccion,
        foreignKey: "publicacionId",
        otherKey: "usuarioId",
        as: "usuariosQueDieronLike"
      });
    }
  }
  Publicacion.init({
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
      notEmpty: true,      // No puede estar vacío
      len: [5, 255]        // Entre 5 y 255 caracteres, por ejemplo
      }
    },
    fechaDePublicacion: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
      isDate: true         // Verifica que sea una fecha válida
      }
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Publicacion',
  });
  return Publicacion;
};