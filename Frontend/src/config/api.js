// Aquí definimos la URL base de tu Backend.
// Más adelante, puedes cambiar este string por una variable de entorno (ej: import.meta.env.VITE_API_URL)
const BASE_URL = "http://localhost:3001";

export const API_ROUTES = {
    USERS: `${BASE_URL}/users`,
    POSTS: `${BASE_URL}/posts`,
    COMMENTS: `${BASE_URL}/comments`,
    POST_IMAGES: `${BASE_URL}/postimages`,
    ETIQUETAS: `${BASE_URL}/etiqueta`,
  // Aquí puedes ir agregando más rutas a medida que crezca tu app
  // LOGIN: `${BASE_URL}/login`,
};