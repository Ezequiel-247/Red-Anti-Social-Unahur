const schemaEtiqueta = require("./schemas/etiquetaSchema");

const validarEtiqueta = (req, res, next) => {
    const { error } = schemaEtiqueta.validate(req.body)
    if(error){
        return res.status(400).json({
            message: 'Datos inválidos',
            detalle: error.details[0].message
        })
    }
    next()
};

module.exports = validarEtiqueta;