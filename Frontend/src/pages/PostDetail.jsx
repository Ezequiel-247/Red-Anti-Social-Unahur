import { useParams } from "react-router-dom";
import { useEffect, useState, useContext} from "react";
import { UserContext } from "../context/UserContext"; 
import { Link } from "react-router-dom";
import PostItem from "../components/PostItem";
import "../style/postDetail.css"; // Asegúrate de tener este archivo creado

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext); // Obtengo el usuario actual 
  const [nuevoComentario, setNuevoComentario] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postRes = await fetch(`${BASE_URL}/posts/${id}`);
        if (!postRes.ok) throw new Error("Post no encontrado");
        const postData = await postRes.json();
        setPost(postData);
      } catch (error) {
        console.error("Error al cargar el post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
const handleComentario = async (e) => {
  e.preventDefault();
  if (!nuevoComentario.trim()) return;

  const response = await fetch(`${BASE_URL}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contenido: nuevoComentario,
      publicacionId: id,
      usuarioId: user.id,
      fechaDeComentario: new Date(),
    }),
  });

  if(response.ok) {
    const comentarioAgregado  = await response.json();
    // Agregamos el usuario actual al comentario para mostrarlo inmediatamente
    setPost(prev => ({
      ...prev,
      comentarios: [...(prev.comentarios || []), { ...comentarioAgregado, usuario: user }]
    }));
    setNuevoComentario(""); // Limpiar el campo de comentario
  }else {
    console.error("Error al agregar el comentario");
  }
};

  if (loading) return <div className="post-detail-container"><p className="loading-text">Cargando publicación...</p></div>;
  if (!post) return <div className="post-detail-container"><p>La publicación no existe.</p><Link to="/home" className="btn-volver-home">Volver</Link></div>;

  return (
    <div className="post-detail-container">
        {/* Reutilizamos la tarjeta PostItem pero ocultamos el botón 'Ver más' */}
        <PostItem post={post} showVerMas={false} />

        {/* Formulario para agregar un comentario nuevo: */}
          {user ? (
            <form onSubmit={handleComentario} className="comentario-form">
              <textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe tu comentario..."
                required
              />  
              <button type="submit">Comentar</button>
            </form>
          ) : (
            <p className="login-prompt">Inicia sesión para comentar.</p>
          )}
    <Link to="/home" className="btn-volver-home"> <i className="bi bi-arrow-left-circle-fill"></i> Volver a Home</Link>     
      </div>
  ); 
};

export default PostDetail;
