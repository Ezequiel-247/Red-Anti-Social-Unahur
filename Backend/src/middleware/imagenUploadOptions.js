const path = require('path');
const crypto = require('crypto');

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Opciones de Multer reutilizables para cualquier endpoint que reciba imágenes
// (posts, avatar, etc.): mismo límite de tamaño y mismo filtro de tipo en todos lados.
const imagenUploadOptions = {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, png, gif, webp)'));
    }
};

// Genera un nombre de archivo seguro para guardar en disco. Nunca hay que usar
// file.originalname tal cual en una ruta: es un valor que controla el cliente
// (viene del header Content-Disposition) y algo como "../../../../etc/passwd"
// permite escribir fuera de la carpeta de subidas (path traversal). Acá solo
// se toma del original una extensión corta y sanitizada; el nombre en sí es
// siempre generado en el servidor.
const nombreArchivoSeguro = (prefijo, originalname) => {
    const extension = path.extname(originalname).toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 10);
    const random = crypto.randomBytes(8).toString('hex');
    return `${prefijo}${Date.now()}-${random}${extension}`;
};

module.exports = { ...imagenUploadOptions, nombreArchivoSeguro };
