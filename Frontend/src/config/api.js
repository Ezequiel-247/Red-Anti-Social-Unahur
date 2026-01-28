// definimos la URL base del Backend.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const API_ROUTES = {
    USERS: `${BASE_URL}/users`,
    POSTS: `${BASE_URL}/posts`,
    COMMENTS: `${BASE_URL}/comments`,
    POST_IMAGES: `${BASE_URL}/postimages`,
    ETIQUETAS: `${BASE_URL}/etiqueta`,
};