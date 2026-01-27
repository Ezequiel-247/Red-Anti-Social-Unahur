const Joi = require('joi')

const usuarioSchema = Joi.object({
    nombre: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().min(2).max(50).required(),
    contraseña: Joi.string().min(6).max(20).required()
});
module.exports = usuarioSchema;