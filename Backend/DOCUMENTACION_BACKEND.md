# 📚 Documentación del Backend - UnaHur Anti-Social API

## 📝 Descripción General
API RESTful desarrollada con **Node.js** y **Express** para gestionar la lógica de negocio de la red social universitaria. Utiliza **Sequelize** como ORM para interactuar con una base de datos SQL (SQLite por defecto) y maneja la autenticación mediante **JWT**.

## 🛠️ Tecnologías Principales
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Sequelize
- **Base de Datos:** SQLite (archivo local `database.sqlite`)
- **Autenticación:** JSON Web Tokens (JWT) + Bcrypt (hashing de contraseñas)
- **Manejo de Archivos:** Multer (subida de imágenes a `public/img`)
- **Documentación API:** Swagger UI

## ⚙️ Configuración e Instalación

1. **Variables de Entorno:**
   Asegúrate de tener un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```env
   PORT=3001
   ```

2. **Instalación de Dependencias:**
   ```bash
   npm install
   ```

3. **Inicialización de Base de Datos (Seed):**
   Para crear las tablas, limpiar datos antiguos y cargar usuarios de prueba ("Luna", "Sol") con contraseñas encriptadas:
   ```bash
   node src/db/seeders/seed.js
   ```

4. **Iniciar Servidor:**
   ```bash
   npm start
   ```
   El servidor correrá en `http://localhost:3001`.

## 🏗️ Arquitectura del Proyecto
El proyecto sigue el patrón **MVC (Modelo-Vista-Controlador)** adaptado a una API:

- **`src/index.js`**: Punto de entrada. Configura Express, CORS, Swagger y rutas estáticas.
- **`src/db/models/`**: Definición de modelos (Usuario, Publicacion, Comentario, Imagen, Etiqueta, Reaccion).
- **`src/controllers/`**: Lógica de negocio. Ejemplo: `usuarioController.js` maneja el login y registro.
- **`src/routes/`**: Definición de endpoints.
- **`src/middleware/`**:
  - `authMiddleware.js`: Protege rutas verificando el token JWT.
  - Validadores: Verifican que los datos de entrada sean correctos antes de procesarlos.

## 🔐 Seguridad y Autenticación
- **Registro:** Las contraseñas se hashean con `bcrypt` antes de guardarse.
- **Login:** Se verifica el hash y se emite un **Token JWT** con validez de 24 horas.
- **Rutas Protegidas:** Endpoints como `crearPublicacion`, `eliminarPublicacion` o `editarPost` requieren el header:
  `Authorization: Bearer <TU_TOKEN>`

## 📖 Documentación de API (Swagger)
Una vez iniciado el servidor, puedes ver y probar todos los endpoints disponibles en:
👉 **http://localhost:3001/api-docs**

### Endpoints Clave
| Método | Ruta | Descripción | Auth Requerida |
|--------|------|-------------|----------------|
| POST | `/users` | Registrar usuario | No |
| POST | `/users/login` | Iniciar sesión | No |
| GET | `/posts` | Obtener feed | No |
| POST | `/posts` | Crear post (con imagen) | **Sí** |
| DELETE | `/posts/:id` | Eliminar post | **Sí** |
| POST | `/reactions/toggle` | Dar/Quitar Like | **Sí** |

## 🗂️ Modelo de Datos (Relaciones)
- **Usuario** tiene muchas **Publicaciones**.
- **Publicacion** tiene muchos **Comentarios** y **Reacciones**.
- **Publicacion** puede tener muchas **Etiquetas** (Relación N:M).
- **Publicacion** tiene muchas **Imagenes**.
