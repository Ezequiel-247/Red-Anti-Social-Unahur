const Joi = require('joi');

//Chequear si falta algo
const comentarioSchema = Joi.object({
    contenido: Joi.string().min(1).max(500).required(),
    fechaDeComentario: Joi.date().iso().required(),
    usuarioId: Joi.number().integer().required(),
    publicacionId: Joi.number().integer().required()
});

module.exports = comentarioSchema;
