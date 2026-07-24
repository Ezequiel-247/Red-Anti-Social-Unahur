const publicacionSchema = require("./schemas/publicacionSchema");

const validarPublicacion = (req, res, next) => {
    const { error } = publicacionSchema.validate(req.body)
    if(error){
        return res.status(400).json({
            message: 'Datos inválidos',
            detalle: error.details[0].message
        })
    }
    next()
};

module.exports = validarPublicacion;