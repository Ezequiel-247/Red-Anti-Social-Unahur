# 💻 Documentación del Frontend - UnaHur Anti-Social Net

## 📝 Descripción General
Interfaz de usuario moderna y responsiva desarrollada en **React** para la red social universitaria. Permite a los usuarios navegar, publicar, comentar y gestionar su perfil interactuando con la API REST.

## 🛠️ Tecnologías Principales
- **Framework:** React (Vite)
- **Enrutamiento:** React Router DOM v6
- **Estado Global:** React Context API (`UserContext`)
- **Estilos:** CSS Modules + Bootstrap (clases de utilidad)
- **HTTP Client:** Fetch API nativa

## ⚙️ Instalación y Ejecución

1. **Instalar Dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en Desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación generalmente correrá en `http://localhost:5173`.

## 🏗️ Estructura de Componentes

### 🧩 Componentes Principales (`src/components/`)

- **`Layout.jsx`**: 
  - Es el contenedor principal ("wrapper") de la aplicación.
  - Contiene la **Navbar** (navegación), el **Footer** y el **BackgroundCarousel**.
  - Maneja el cierre de sesión.

- **`Home.jsx`**: 
  - Página de inicio. Muestra el feed de publicaciones recientes.
  - Verifica si el usuario está logueado para permitirle crear posts.

- **`PostItem.jsx`**: 
  - Componente complejo que renderiza una publicación individual.
  - Maneja la lógica de **Likes** (Reacciones), **Comentarios** (Ver/Editar/Borrar) y **Eliminación** del post.
  - Utiliza renderizado condicional para mostrar botones de edición solo al dueño del post.

- **`Login.jsx` / `Register.jsx`**: 
  - Formularios de autenticación.
  - `Login` guarda el token recibido en el `UserContext`.

- **`CrearPost.jsx` / `EditarPost.jsx`**: 
  - Formularios para gestión de contenido.
  - `CrearPost` maneja la subida de archivos (imágenes) usando `FormData`.

- **`Perfil.jsx`**: 
  - Vista personal del usuario donde ve sus propias publicaciones y estadísticas.

- **`BackgroundCarousel.jsx`**: 
  - Componente visual que rota imágenes de fondo cada 5 segundos para dar dinamismo.

### 🌐 Contexto y Estado (`src/context/`)
- **`UserContext.jsx`**: 
  - Provee el estado global `user` a toda la aplicación.
  - Almacena la información del usuario logueado y su **Token JWT**.
  - Permite persistencia básica y acceso a la función `setUser` para login/logout.

## 🔌 Integración con la API
La comunicación con el Backend se realiza mediante `fetch`.

- **Configuración:** Las rutas base están definidas en `src/config/api.js` (o constantes locales `API_ROUTES`).
- **Autenticación:** 
  Para las peticiones que modifican datos (POST, PUT, DELETE), se inyecta el token JWT en los encabezados:
  ```javascript
  headers: {
      "Authorization": `Bearer ${user.token}`,
      // ... otros headers
  }
  ```

## 🎨 Estilos
Se utiliza una mezcla de **CSS personalizado** (archivos en `src/style/`) para componentes específicos (como el carrusel o las tarjetas de post) y clases de **Bootstrap** para la estructura de rejilla y botones estándar.