const Joi = require('joi');

//Chequear si falta algo
const etiquetaSchema = Joi.object({
    nombre: Joi.string().min(1).max(50).required()
});

module.exports = etiquetaSchema;
