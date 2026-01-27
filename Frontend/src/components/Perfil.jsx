import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import PostItem from "../components/PostItem"; // Componente para mostrar cada post
import "../style/Home.css";
import { API_ROUTES } from "../config/api";

const Perfil = () => {
    const { user } = useContext(UserContext); // Usuario logueado
    const navigate = useNavigate();
    const [misPosts, setMisPosts] = useState([]); // Estado para posts propios

    useEffect(() => {
        if (!user) {
            // Si no hay usuario, redirigir al login para proteger la ruta
            navigate("/login");
            return;
        }

        // Función para cargar posts del usuario actual
        const fetchMisPosts = async () => {
            try {
                // Consultamos posts filtrados por userId
                const res = await fetch(`${API_ROUTES.POSTS}?userId=${user.id}`);
                const data = await res.json();

                // Para cada post cargamos comentarios e imágenes asociados
                setMisPosts(data); // Actualizamos estado con posts completos
            } catch (error) {
                console.error("Error al cargar tus publicaciones:", error);
            }
        };

        fetchMisPosts();
    }, [user, navigate]);

    if (!user) return null; // No renderizamos nada si usuario no está cargado aún

    return (
        <div className="home-container">
            {/* Título con el nickname del usuario */}
            <h1>Perfil de {user.nombre}</h1>

            <div className="feature-box">
                <h3>📌 Tu progreso</h3>
                <p>Publicaciones recientes, comentarios, y más se mostrarán acá.</p>
            </div>

            <div className="feature-box">
                <h3>📚 Tus publicaciones</h3>
                {/* Si no tiene posts, mostramos mensaje */}
                {misPosts.length === 0 ? (
                    
                    <p>No tienes publicaciones aún.</p>
        
                ) : (
                    // Mapeamos posts y mostramos usando componente PostItem
                    misPosts.map((post) => <PostItem key={post.id} post={post} />)
                )}
            </div>
        </div>
    );
};

export default Perfil;
