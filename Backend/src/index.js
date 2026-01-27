require('dotenv').config(); // Cargar variables de entorno al inicio
const express = require("express");
const app = express();
const db = require('./db/models') //base de datos
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
app.use(cors());

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

app.listen(PORT, async ()=>{
    console.log(`Aplicación corriendo en el puerto: ${PORT}`);
    try {
        await db.sequelize.sync(); // Sincroniza la estructura (sin borrar datos)
        console.log('Base de datos sincronizada correctamente');
        // despues la inicializacion del sequielize se agrega con lo de la ultima clase y se quita esta linea
    } catch (error) {
        console.error('Error al sincronizar la base de datos:', error);
    }
});