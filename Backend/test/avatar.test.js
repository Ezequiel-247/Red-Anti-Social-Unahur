const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');
const db = require('../src/db/models');
const { crearUsuarioLogueado } = require('./helpers');

const IMG_DIR = path.join(__dirname, '../src/public/img');
const imagenFalsa = Buffer.from('contenido de imagen falso, no importa para el test');

let archivosAntesDelTest;

beforeEach(async () => {
    await db.sequelize.sync({ force: true });
    // Estos tests suben archivos de verdad a Backend/src/public/img (no hay carpeta
    // de uploads separada para test): registramos qué había antes para poder
    // borrar solo lo que generó el test y no ensuciar la carpeta real.
    archivosAntesDelTest = new Set(fs.readdirSync(IMG_DIR));
});

afterEach(() => {
    for (const archivo of fs.readdirSync(IMG_DIR)) {
        if (!archivosAntesDelTest.has(archivo)) {
            fs.unlinkSync(path.join(IMG_DIR, archivo));
        }
    }
});

afterAll(async () => {
    await db.sequelize.close();
});

describe('POST /users/:id/avatar', () => {
    test('sin token devuelve 403', async () => {
        const { id } = await crearUsuarioLogueado(app, { nombre: 'avatar_sin_token' });
        const res = await request(app)
            .post(`/users/${id}/avatar`)
            .attach('avatar', imagenFalsa, 'foto.jpg');
        expect(res.status).toBe(403);
    });

    test('un usuario no puede cambiar el avatar de otro (IDOR)', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'avatar_a' });
        const b = await crearUsuarioLogueado(app, { nombre: 'avatar_b' });

        const res = await request(app)
            .post(`/users/${b.id}/avatar`)
            .set('Authorization', `Bearer ${a.token}`)
            .attach('avatar', imagenFalsa, 'foto.jpg');

        expect(res.status).toBe(403);
    });

    test('rechaza un archivo que no sea imagen', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'avatar_no_imagen' });
        const res = await request(app)
            .post(`/users/${a.id}/avatar`)
            .set('Authorization', `Bearer ${a.token}`)
            .attach('avatar', Buffer.from('no soy una imagen'), { filename: 'archivo.txt', contentType: 'text/plain' });

        expect(res.status).toBe(400);
    });

    test('sube la imagen y la guarda como avatar del usuario', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'avatar_ok' });
        const res = await request(app)
            .post(`/users/${a.id}/avatar`)
            .set('Authorization', `Bearer ${a.token}`)
            .attach('avatar', imagenFalsa, 'foto.jpg');

        expect(res.status).toBe(200);
        expect(res.body.avatar).toMatch(/^\/img\//);

        const nombreArchivo = res.body.avatar.replace('/img/', '');
        expect(fs.existsSync(path.join(IMG_DIR, nombreArchivo))).toBe(true);
    });

    test('subir una foto nueva borra la anterior del disco', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'avatar_reemplazo' });

        const primera = await request(app)
            .post(`/users/${a.id}/avatar`)
            .set('Authorization', `Bearer ${a.token}`)
            .attach('avatar', imagenFalsa, 'primera.jpg');
        const archivoPrimero = path.join(IMG_DIR, primera.body.avatar.replace('/img/', ''));
        expect(fs.existsSync(archivoPrimero)).toBe(true);

        const segunda = await request(app)
            .post(`/users/${a.id}/avatar`)
            .set('Authorization', `Bearer ${a.token}`)
            .attach('avatar', imagenFalsa, 'segunda.jpg');

        expect(fs.existsSync(archivoPrimero)).toBe(false); // se borró
        expect(fs.existsSync(path.join(IMG_DIR, segunda.body.avatar.replace('/img/', '')))).toBe(true);
    });

    test('un nombre de archivo con path traversal no escapa de la carpeta de subidas', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'avatar_traversal' });
        const nombreMalicioso = '../../../../pwned-por-el-test.jpg';

        const res = await request(app)
            .post(`/users/${a.id}/avatar`)
            .set('Authorization', `Bearer ${a.token}`)
            .attach('avatar', imagenFalsa, nombreMalicioso);

        expect(res.status).toBe(200);
        // El nombre guardado no debe contener ".." ni el nombre original del ataque
        expect(res.body.avatar).not.toMatch(/\.\./);
        expect(res.body.avatar).not.toMatch(/pwned/);

        // Y no se creó ningún archivo fuera de la carpeta de subidas
        const rutaFueraDeCarpeta = path.join(IMG_DIR, '../../../pwned-por-el-test.jpg');
        expect(fs.existsSync(rutaFueraDeCarpeta)).toBe(false);
    });
});

describe('DELETE /users/:id/avatar', () => {
    test('quita el avatar y borra el archivo del disco', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'avatar_quitar' });
        const subida = await request(app)
            .post(`/users/${a.id}/avatar`)
            .set('Authorization', `Bearer ${a.token}`)
            .attach('avatar', imagenFalsa, 'foto.jpg');
        const archivo = path.join(IMG_DIR, subida.body.avatar.replace('/img/', ''));

        const res = await request(app)
            .delete(`/users/${a.id}/avatar`)
            .set('Authorization', `Bearer ${a.token}`);

        expect(res.status).toBe(200);
        expect(res.body.avatar).toBeNull();
        expect(fs.existsSync(archivo)).toBe(false);
    });

    test('otro usuario no puede quitar el avatar ajeno (IDOR)', async () => {
        const a = await crearUsuarioLogueado(app, { nombre: 'avatar_quitar_a' });
        const b = await crearUsuarioLogueado(app, { nombre: 'avatar_quitar_b' });

        const res = await request(app)
            .delete(`/users/${b.id}/avatar`)
            .set('Authorization', `Bearer ${a.token}`);

        expect(res.status).toBe(403);
    });
});
