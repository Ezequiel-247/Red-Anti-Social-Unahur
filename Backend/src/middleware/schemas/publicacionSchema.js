const Joi = require('joi');

const publicacionSchema = Joi.object({
    // Validamos la descripción (español)
    descripcion: Joi.string().min(5).max(255).required(),
    
    // Validamos la fecha
    fechaDePublicacion: Joi.date().iso().required(),
    
    // El ID del usuario es obligatorio
    usuarioId: Joi.number().integer().required(),
    
    // El array de Tags (puede estar vacío, pero debe permitirse)
    Tags: Joi.array().single().optional(),
    
    // La imagen es opcional - se maneja en multer, no en req.body
    imagen: Joi.any().optional()
}).unknown(true); // Permite campos adicionales que no estén en el schema

module.exports = publicacionSchema;
