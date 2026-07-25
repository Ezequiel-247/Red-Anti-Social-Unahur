# Notificaciones y bot de engagement — cómo funciona

Fecha: 2026-07-24/25

Dos features nuevas, relacionadas entre sí: un sistema de notificaciones real,
y un "bot" que simula actividad de la comunidad cuando un usuario real publica algo.

## 1. Notificaciones

### Modelo

`Notificacion` ([src/db/models/notificacion.js](src/db/models/notificacion.js)):

| Campo | Qué es |
|---|---|
| `usuarioId` | El **destinatario**: quien recibe/lee la notificación |
| `actorId` | Quien generó la acción (quien comentó o dio like) |
| `tipo` | `'comentario'` \| `'respuesta'` \| `'reaccion'` |
| `publicacionId` | El post al que se refiere |
| `comentarioId` | Solo para tipo comentario/respuesta (null en reacciones) |
| `leida` | boolean, default false |

Como es una tabla **nueva** (no una columna sobre una tabla existente), no hizo
falta tocar nada a mano en Neon: `sequelize.sync()` la crea sola en el próximo
deploy, a diferencia de la columna `avatar` que sí necesitó un `ALTER TABLE`
manual (ver [AUDITORIA_VULNERABILIDADES.md](AUDITORIA_VULNERABILIDADES.md) para
el contexto de por qué `sync()` sin `force`/`alter` no modifica tablas ya
existentes).

### Cuándo se dispara cada tipo

Toda la lógica de creación vive en [src/controllers/notificacionController.js](src/controllers/notificacionController.js),
como funciones reutilizables (no son rutas):

- **`notificarComentario(comentario, publicacion)`** — se llama desde
  `comentarioController.crearComentario` después de guardar el comentario:
  1. Le avisa al **dueño del post** (tipo `'comentario'`).
  2. Busca a todos los que **ya habían comentado antes** en ese mismo post
     (`Comentario.findAll` agrupado por `usuarioId`) y les avisa tipo
     `'respuesta'` — salvo al que acaba de comentar (no te avisás a vos mismo)
     y salvo al dueño del post (ya recibió el aviso de arriba, no hace falta
     duplicarlo).

- **`notificarReaccion(reaccion, publicacion)`** — se llama desde
  `reaccionController.toggleReaccion`, pero **solo cuando se agrega un like**,
  no cuando se saca (nadie necesita que le avisen "che, te sacaron el like").

- **`crearNotificacion(...)`** es el helper de base: nunca crea una
  notificación si `usuarioId === actorId` (no te notificás a vos mismo).

### Endpoints (`/notifications`, todos requieren estar logueado)

- `GET /notifications` — lista las últimas 50 del usuario autenticado, más
  recientes primero, con el actor (nombre + avatar) y el comentario si aplica.
- `PATCH /notifications/:id/read` — marca una como leída. Devuelve 403 si
  intentás marcar una que no es tuya.
- `PATCH /notifications/read-all` — marca todas las tuyas como leídas de una.

### Frontend

[src/components/NotificationBell.jsx](../Frontend/src/components/NotificationBell.jsx):
campanita con contador de no leídas + dropdown, integrada en el navbar
desktop y en la barra inferior mobile de
[Layout.jsx](../Frontend/src/components/Layout.jsx).

Se pide al backend **al cargar la app y en cada navegación** (`useEffect` que
depende de `location.pathname`) — a propósito **no** hay polling periódico,
para no generarle requests constantes al servicio gratuito de Render. La
contra es que si te quedás con la pestaña abierta sin navegar, no se entera
sola de notificaciones nuevas hasta que cambies de página.

## 2. Bot de engagement

Objetivo: que la app no se sienta vacía la primera vez que alguien la prueba
de verdad (por ejemplo, quien la evalúe) — cuando publican algo, ven que
"gente" reacciona, en vez de un post solitario con 0 likes y 0 comentarios.

Vive en [src/utils/engagementBot.js](src/utils/engagementBot.js), función
`simularEngagement(publicacion)`, llamada desde `publicacionController.crearPublicacion`
justo después de responder al usuario (es un efecto secundario: si el bot
falla, el post ya se creó bien y la respuesta ya se mandó, no afecta nada).

### Cómo decide quién es "bot"

No hay una columna `esBot` en `Usuario`. En cambio, se usa un heurístico
simple: **todos los usuarios de prueba tienen email `@algo@example.com`**
(así los define `seed.js`), mientras que cualquier persona que se registre
de verdad usa un email real (gmail, etc). Entonces:

```js
const usuariosDePrueba = await Usuario.findAll({
  where: { email: { [Op.like]: '%@example.com' } }
});
```

### El guard: solo para posts de gente real

Antes de hacer cualquier cosa, se fija el email del autor del post:

```js
if (!autor || autor.email?.endsWith('@example.com')) return;
```

Si quien publicó es un usuario de prueba, el bot no hace nada — así no se
duplica actividad con la que ya trae `seed.js` hardcodeada entre los propios
usuarios de prueba.

### Qué hace y con qué timing

- Entre **1 y 4** usuarios de prueba (al azar, mezclando el array) le dan
  like al post, cada uno con un delay random entre **4 y 40 segundos**
  (`setTimeout`).
- Con **70% de probabilidad**, entre **1 y 2** usuarios de prueba también
  comentan, con delay random entre **8 y 55 segundos**, eligiendo un mensaje
  al azar de una lista de 10 frases genéricas (`MENSAJES` en el mismo archivo).
- Los delays son a propósito random y no todos iguales: si todo apareciera
  al mismo milisegundo se notaría "robótico". Escalonado se siente más
  parecido a gente real mirando el feed en momentos distintos.
- Cada like/comentario del bot **también genera una notificación real** al
  autor del post (se reutilizan `notificarReaccion`/`notificarComentario` de
  arriba) — o sea que si publicás algo, en un rato te van a llegar
  notificaciones de "gente" reaccionando, reforzando la sensación de app viva.

### Probado localmente

Se verificó con un usuario real (no `@example.com`) creando un post: a los
~30s apareció un comentario y 3 likes escalonados de usuarios de prueba
distintos, con sus 4 notificaciones correspondientes. Con un usuario de
prueba publicando, se confirmó que no se dispara nada (0 likes, 0 comentarios
después de 20s de espera).
