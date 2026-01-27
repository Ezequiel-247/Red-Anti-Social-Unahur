const Joi = require('joi');

const imagenSchema = Joi.object({
    // Quitamos .uri() porque las imágenes en Base64 (data:image/...) a veces fallan esa validación
    ruta: Joi.string().required(),
    
    // FALTABA ESTO: El ID de la publicación a la que pertenece la imagen
    publicacionId: Joi.number().integer().required()
});

module.exports = imagenSchema;