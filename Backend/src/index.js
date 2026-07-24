require('dotenv').config(); // Cargar variables de entorno al inicio

const app = require('./app');
const db = require('./db/models');

const PORT = process.env.PORT || 3001;

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
