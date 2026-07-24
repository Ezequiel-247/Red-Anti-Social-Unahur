// App de Express separada de index.js para poder testearla con supertest
// sin levantar un servidor real (sin app.listen). index.js hace de bootstrap:
// carga el .env, valida JWT_SECRET y llama a app.listen(); los tests importan
// este archivo directamente y arrancan/paran su propia base de datos de prueba.

// Sin JWT_SECRET no hay forma segura de firmar/verificar tokens: cortamos el arranque
// en vez de caer en un secreto hardcodeado (lo que permitía forjar tokens de cualquier usuario).
if (!process.env.JWT_SECRET) {
    console.error('Falta la variable de entorno JWT_SECRET. Configúrala antes de iniciar el servidor.');
    process.exit(1);
}

const express = require("express");
const app = express();
const publicacionRouter = require("./routes/publicacionRouter")
const usuarioRouter = require("./routes/usuarioRouter")
const etiquetaRouter = require("./routes/etiquetaRouter")
const comentarioRouter = require("./routes/comentarioRouter")
const imagenesRouter = require("./routes/imagenesRouter")
const publicacionEtiquetaRouter = require("./routes/publicacionEtiquetaRouter")
const reaccionRouter = require("./routes/reaccionRouter")
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Necesario para verificar carpetas
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

app.use(express.json()) // para que la api pueda leer json

// Restringimos CORS al/los origen(es) del frontend en vez de aceptar cualquier origen.
// FRONTEND_URL puede tener varios orígenes separados por coma (útil para preview + prod).
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Permitimos requests sin origin (Postman, curl, apps móviles)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('No permitido por CORS'));
    }
}));

app.use('/users', usuarioRouter);
app.use('/posts',publicacionRouter);
app.use('/etiqueta', etiquetaRouter);
app.use('/comments',comentarioRouter);
app.use('/postimages',imagenesRouter);
app.use('/publicacionEtiqueta',publicacionEtiquetaRouter)
app.use('/reactions', reaccionRouter);
app.use('/img', express.static(path.join(__dirname, 'public/img')));

// Asegurar que la carpeta de subidas exista
const uploadDir = path.join(__dirname, 'public/img');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Carpeta public/img creada correctamente');
}

const PORT = process.env.PORT || 3001;

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UnaHur Anti-Social API',
            version: '1.0.0',
            description: 'Documentación de la API para la red social universitaria',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: [`${path.join(__dirname, './routes/*.js')}`], // Ruta a los archivos con anotaciones
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Manejador de errores global: sin esto, errores como el fileFilter de Multer
// (archivo no permitido) llegaban al handler por defecto de Express, que responde
// con una página HTML exponiendo el stack trace y las rutas del servidor.
app.use((err, req, res, next) => {
    console.error(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'El archivo supera el tamaño máximo permitido (5MB)' });
    }
    res.status(400).json({ error: err.message || 'Error en la solicitud' });
});

module.exports = app;
