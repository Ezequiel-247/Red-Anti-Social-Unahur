import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import "../style/postitem.css"; 
import { API_ROUTES } from "../config/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"; // URL dinámica para producción

const PostItem = ({ post, showVerMas = true }) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // Cargar likes al montar el componente
  useEffect(() => {
    fetch(`${BASE_URL}/reactions/post/${post.id}`)
      .then(res => res.json())
      .then(data => {
        setLikes(data);
        // Verificar si el usuario actual ya dio like
        if (user) {
          const userLike = data.find(like => like.usuarioId === user.id);
          setIsLiked(!!userLike);
        }
      })
      .catch(err => console.error("Error cargando likes", err));
  }, [post.id, user]);

  const handleLike = async () => {
    if (!user) return alert("Inicia sesión para dar like");

    try {
      const res = await fetch(`${BASE_URL}/reactions/toggle`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ usuarioId: user.id, publicacionId: post.id })
      });
      const data = await res.json();
      
      setIsLiked(data.active);
      // Actualizar contador visualmente (truco rápido para no recargar todo)
      setLikes(prev => data.active ? [...prev, { usuarioId: user.id }] : prev.filter(l => l.usuarioId !== user.id));
    } catch (error) {
      console.error("Error al dar like:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta publicación?")) return;

    try {
      const res = await fetch(`${API_ROUTES.POSTS}/${post.id}`, { 
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
      });
      if (res.ok) {
        window.location.reload(); // Recargamos para ver los cambios
      } else {
        alert("Error al eliminar la publicación");
      }
    } catch (error) {
      console.error("Error eliminando post:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Estás seguro de eliminar este comentario?")) return;

    try {
      const res = await fetch(`${BASE_URL}/comments/${commentId}`, { 
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
      });
      if (res.ok) {
        window.location.reload(); // Recargar para ver cambios
      } else {
        alert("Error al eliminar comentario");
      }
    } catch (error) {
      console.error("Error eliminando comentario:", error);
    }
  };

  const handleUpdateComment = async (comment) => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`${BASE_URL}/comments/${comment.id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          contenido: editContent,
          usuarioId: comment.usuarioId || comment.usuario?.id, // Necesario para validación Joi
          publicacionId: post.id,
          fechaDeComentario: new Date().toISOString()
        })
      });
      if (res.ok) window.location.reload();
    } catch (error) {
      console.error("Error actualizando comentario:", error);
    }
  };

  const commentsToShow = showAllComments 
    ? post.comentarios 
    : post.comentarios?.slice(0, 3);

  return (
    // SEMÁNTICA: Usamos 'article' porque es un contenido independiente y distribuible
    <article className="post-item">
      <p><strong>{post.usuario?.nombre || "Usuario"}</strong> dijo:</p>
      <p>{post.descripcion}</p>

      {post.imagenes && post.imagenes.length > 0 && (
        <>
          {showVerMas ? (
            // VISTA FEED: Solo mostramos la primera imagen
            <img
              src={post.imagenes[0].ruta.startsWith('http') ? post.imagenes[0].ruta : `${BASE_URL}${post.imagenes[0].ruta}`}
              alt="imagen del post"
              className="post-img"
            />
          ) : (
            // VISTA DETALLE: Mostramos todas las imágenes
            <div className="post-images">
              {post.imagenes.map((img) => (
                <img
                  key={img.id}
                  src={img.ruta.startsWith('http') ? img.ruta : `${BASE_URL}${img.ruta}`}
                  alt={`Imagen ${img.id}`}
                  className="detalle-img"
                />
              ))}
            </div>
          )}
        </>
      )}

      <div className="tags">
        {post.Tags?.map((tag) => (
          <span key={tag.id} className="tag">#{tag.name}</span>
        ))}
      </div>

      <div className="post-actions">
        <button onClick={handleLike} className={`btn-like ${isLiked ? 'liked' : ''}`}>
          <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i> 
          <span className="like-count">{likes.length}</span>
        </button>

        <p className="comments-count">💬 {post.comentarios?.length || 0} comentarios</p>

        {/* Botones de Editar y Eliminar (Solo para el dueño) */}
        {user && (user.id === post.usuario?.id || user.id === post.usuarioId) && (
          <div className="post-actions-right">
            <button onClick={handleDelete} title="Eliminar" className="btn-delete">
              <i className="bi bi-trash"></i>
            </button>
          </div>
        )}
      </div>
      
      {/* Mostrar comentarios SOLO si estamos en el detalle (no hay botón ver más) */}
      {!showVerMas && post.comentarios && post.comentarios.length > 0 && (
        <div className="post-comments">
          {commentsToShow.map((comentario) => (
            <div key={comentario.id} className="comment-wrapper">
              {editingCommentId === comentario.id ? (
                <div className="edit-comment-box">
                  <input 
                    type="text" 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)}
                    className="edit-comment-input"
                  />
                  <button onClick={() => handleUpdateComment(comentario)} className="btn-save-comment"><i className="bi bi-check-lg"></i></button>
                  <button onClick={() => setEditingCommentId(null)} className="btn-cancel-comment"><i className="bi bi-x-lg"></i></button>
                </div>
              ) : (
                <div className="comment-item">
                  <p style={{ margin: 0 }}>
                    <strong>{comentario.usuario?.nombre || comentario.Usuario?.nombre || "Usuario"}: </strong>
                    {comentario.contenido}
                  </p>
                  {user && (user.id === comentario.usuarioId || user.id === comentario.usuario?.id) && (
                    <div className="comment-actions-mini">
                      <button onClick={() => { setEditingCommentId(comentario.id); setEditContent(comentario.contenido); }} className="btn-icon-mini"><i className="bi bi-pencil"></i></button>
                      <button onClick={() => handleDeleteComment(comentario.id)} className="btn-icon-mini delete"><i className="bi bi-trash"></i></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {post.comentarios.length > 3 && (
            <button 
              onClick={() => setShowAllComments(!showAllComments)}
              className="btn-ver-comentarios"
            >
              {showAllComments ? "Ver menos comentarios" : "Ver más comentarios"}
            </button>
          )}
        </div>
      )}

      {showVerMas && (
        <button onClick={() => navigate(`/post/${post.id}`)}  className="btn btn-success btn-ver-mas"> <i className="bi bi-chevron-down icono-vermas"></i>   Ver más</button>
      )}
    </article>
  );
};

export default PostItem;
