'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //Relacion con tabla publicacion 1:N
      this.hasMany(models.Publicacion,{
        foreignKey: "usuarioId",
        as: "publicaciones"
      });

      //Relacion con tabla comentario -> corregido
      this.hasMany(models.Comentario,{
        //foreignKey: "idComentario", ->>>>pone como clave foranea la pk de la misma tabla
        //as: "comentario"
        foreignKey: "usuarioId",
        as: "comentarios"
      });

      // Relacion con Reacciones
      this.hasMany(models.Reaccion, {
        foreignKey: "usuarioId",
        as: "reacciones"
      });

      // Relacion N:M (Muchos a Muchos) conceptual
      // Esto usa tu tabla 'Reaccion' como puente.
      this.belongsToMany(models.Publicacion, {
        through: models.Reaccion,      // Usamos tu modelo Reaccion como intermediario
        foreignKey: "usuarioId",
        otherKey: "publicacionId",
        as: "publicacionesLikeadas"    // Alias para acceder a los posts que le gustaron al usuario
      });
    }
  }
  Usuario.init({
    nombre: {
      type: DataTypes.STRING,            //Tiene q ser de tipo de dato string
      allowNull: false,                  //No se permite que sea 'null' (es obligatorio).
      validate: {                       
        notEmpty: true,                  //No puede ser una cadena vacía ("").
        len: [2,50]                      //Debe tener entre 2 y 50 caracteres
      },
      unique: true // Evita nombres duplicados a nivel base de datos
    },
    email:{ 
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len:[2,50],
        isEmail: true                   // Verifica que tenga formato de correo electrónico válido
      },
      unique: true // Evita emails duplicados
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
          // CAMBIO IMPORTANTE: Aumentar el máximo a 100 para que entre el hash de bcrypt
          len: {
              args: [5, 100], 
              msg: "La contraseña debe tener entre 5 y 100 caracteres"
          }
      }
    },
  }, {
    sequelize,
    modelName: 'Usuario',
  });
  return Usuario;
};