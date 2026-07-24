const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/models');
const { crearUsuarioLogueado, crearPublicacion } = require('./helpers');

beforeEach(async () => {
    await db.sequelize.sync({ force: true });
});

afterAll(async () => {
    await db.sequelize.close();
});

function comentarioBody(publicacionId, usuarioId, contenido = 'Comentario de prueba') {
    return {
        contenido,
        fechaDeComentario: new Date().toISOString(),
        usuarioId,
        publicacionId,
    };
}

describe('POST /comments', () => {
    test('sin token devuelve 403', async () => {
        const autor = await crearUsuarioLogueado(app, { nombre: 'com_sin_token' });
        const post = await crearPublicacion(app, autor.token);

        const res = await request(app)
            .post('/comments')
            .send(comentarioBody(post.body.id, autor.id));

        expect(res.status).toBe(403);
    });

    test('ignora el usuarioId del body y usa el del token', async () => {
        const autor = await crearUsuarioLogueado(app, { nombre: 'com_autor' });
        const comentarista = await crearUsuarioLogueado(app, { nombre: 'com_comentarista' });
        const post = await crearPublicacion(app, autor.token);

        const res = await request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${comentarista.token}`)
            .send(comentarioBody(post.body.id, autor.id)); // intenta comentar "como" el autor

        expect(res.status).toBe(201);
        expect(res.body.usuarioId).toBe(comentarista.id);
        expect(res.body.usuarioId).not.toBe(autor.id);
    });
});

describe('PUT /comments/:id y DELETE /comments/:id (autorización)', () => {
    async function crearComentario(token, publicacionId, usuarioId) {
        return request(app)
            .post('/comments')
            .set('Authorization', `Bearer ${token}`)
            .send(comentarioBody(publicacionId, usuarioId));
    }

    test('otro usuario no puede editar un comentario ajeno (IDOR)', async () => {
        const autor = await crearUsuarioLogueado(app, { nombre: 'edit_com_autor' });
        const otro = await crearUsuarioLogueado(app, { nombre: 'edit_com_otro' });
        const post = await crearPublicacion(app, autor.token);
        const comentario = await crearComentario(autor.token, post.body.id, autor.id);

        const res = await request(app)
            .put(`/comments/${comentario.body.id}`)
            .set('Authorization', `Bearer ${otro.token}`)
            .send(comentarioBody(post.body.id, otro.id, 'Editado por otro usuario'));

        expect(res.status).toBe(403);
    });

    test('otro usuario no puede borrar un comentario ajeno (IDOR)', async () => {
        const autor = await crearUsuarioLogueado(app, { nombre: 'del_com_autor' });
        const otro = await crearUsuarioLogueado(app, { nombre: 'del_com_otro' });
        const post = await crearPublicacion(app, autor.token);
        const comentario = await crearComentario(autor.token, post.body.id, autor.id);

        const res = await request(app)
            .delete(`/comments/${comentario.body.id}`)
            .set('Authorization', `Bearer ${otro.token}`);

        expect(res.status).toBe(403);
    });

    test('el dueño puede editar y borrar su propio comentario', async () => {
        const autor = await crearUsuarioLogueado(app, { nombre: 'propio_com' });
        const post = await crearPublicacion(app, autor.token);
        const comentario = await crearComentario(autor.token, post.body.id, autor.id);

        const editRes = await request(app)
            .put(`/comments/${comentario.body.id}`)
            .set('Authorization', `Bearer ${autor.token}`)
            .send(comentarioBody(post.body.id, autor.id, 'Editado por su dueño'));
        expect(editRes.status).toBe(200);
        expect(editRes.body.contenido).toBe('Editado por su dueño');

        const delRes = await request(app)
            .delete(`/comments/${comentario.body.id}`)
            .set('Authorization', `Bearer ${autor.token}`);
        expect(delRes.status).toBe(200);
    });
});
