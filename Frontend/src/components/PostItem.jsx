import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import ConfirmModal from "./ConfirmModal";
import Avatar from "./Avatar";
import "../style/postitem.css";
import { API_ROUTES } from "../config/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"; // URL dinámica para producción

const PostItem = ({
  post,
  showVerMas = true,
  onPostDeleted = () => {},
  onCommentDeleted = () => {},
  onCommentUpdated = () => {},
}) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [likes, setLikes] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  // Reemplaza a window.confirm(): null = cerrado, o { type: "post" } / { type: "comment", id }
  const [confirmTarget, setConfirmTarget] = useState(null);

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

  const performDeletePost = async () => {
    try {
      const res = await fetch(`${API_ROUTES.POSTS}/${post.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        onPostDeleted(post.id);
      } else {
        alert("Error al eliminar la publicación");
      }
    } catch (error) {
      console.error("Error eliminando post:", error);
    }
  };

  const performDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`${BASE_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        onCommentDeleted(commentId);
      } else {
        alert("Error al eliminar comentario");
      }
    } catch (error) {
      console.error("Error eliminando comentario:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    if (confirmTarget.type === "post") {
      await performDeletePost();
    } else if (confirmTarget.type === "comment") {
      await performDeleteComment(confirmTarget.id);
    }
    setConfirmTarget(null);
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
      if (res.ok) {
        onCommentUpdated(comment.id, editContent);
        setEditingCommentId(null);
      }
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
      <Link to={`/perfil/${post.usuario?.id || post.usuarioId}`} className="post-author-link post-author-row">
        <Avatar user={post.usuario} size={32} />
        <p><strong>{post.usuario?.nombre || "Usuario"}</strong> dijo:</p>
      </Link>
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
        {post.etiquetas?.map((tag) => (
          <span key={tag.id} className="tag">#{tag.nombre}</span>
        ))}
      </div>

      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`btn-like ${isLiked ? 'liked' : ''}`}
          aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
          aria-pressed={isLiked}
        >
          <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          <span className="like-count">{likes.length}</span>
        </button>

        <p className="comments-count">💬 {post.comentarios?.length || 0} comentarios</p>

        {/* Botones de Editar y Eliminar (Solo para el dueño) */}
        {user && (user.id === post.usuario?.id || user.id === post.usuarioId) && (
          <div className="post-actions-right">
            <button
              onClick={() => setConfirmTarget({ type: "post" })}
              title="Eliminar"
              aria-label="Eliminar publicación"
              className="btn-delete"
            >
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
                    aria-label="Editar contenido del comentario"
                  />
                  <button onClick={() => handleUpdateComment(comentario)} className="btn-save-comment" aria-label="Guardar comentario"><i className="bi bi-check-lg"></i></button>
                  <button onClick={() => setEditingCommentId(null)} className="btn-cancel-comment" aria-label="Cancelar edición"><i className="bi bi-x-lg"></i></button>
                </div>
              ) : (
                <div className="comment-item">
                  <Link to={`/perfil/${comentario.usuario?.id || comentario.usuarioId}`} className="post-author-link">
                    <Avatar user={comentario.usuario} size={24} />
                  </Link>
                  <p style={{ margin: 0 }}>
                    <Link to={`/perfil/${comentario.usuario?.id || comentario.usuarioId}`} className="post-author-link">
                      <strong>{comentario.usuario?.nombre || comentario.Usuario?.nombre || "Usuario"}</strong>
                    </Link>{": "}
                    {comentario.contenido}
                  </p>
                  {user && (user.id === comentario.usuarioId || user.id === comentario.usuario?.id) && (
                    <div className="comment-actions-mini">
                      <button onClick={() => { setEditingCommentId(comentario.id); setEditContent(comentario.contenido); }} className="btn-icon-mini" aria-label="Editar comentario"><i className="bi bi-pencil"></i></button>
                      <button onClick={() => setConfirmTarget({ type: "comment", id: comentario.id })} className="btn-icon-mini delete" aria-label="Eliminar comentario"><i className="bi bi-trash"></i></button>
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
        <button onClick={() => navigate(`/post/${post.id}`)} className="btn-ver-mas"> <i className="bi bi-chevron-down icono-vermas"></i> Ver más</button>
      )}

      <ConfirmModal
        open={!!confirmTarget}
        title={confirmTarget?.type === "post" ? "Eliminar publicación" : "Eliminar comentario"}
        message={
          confirmTarget?.type === "post"
            ? "Esta acción no se puede deshacer. ¿Querés eliminar esta publicación?"
            : "Esta acción no se puede deshacer. ¿Querés eliminar este comentario?"
        }
        confirmLabel="Eliminar"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </article>
  );
};

export default PostItem;
