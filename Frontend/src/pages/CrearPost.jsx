import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import "../style/crearPost.css"; 
import { API_ROUTES } from "../config/api";

const CrearPost = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  
  useEffect(() => { // Traer etiquetas al cargar
    fetch(API_ROUTES.ETIQUETAS)
      .then((res) => res.json())
      .then((data) => setTags(data))
      .catch((error) => console.error("Error al cargar tags", error));
  }, []);

  
  useEffect(() => { // Limpiar mensajes después de 3 segundos
    if (mensaje || error) {
      const timer = setTimeout(() => {
        setMensaje("");
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [mensaje, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (!description.trim()) {
      setError("La descripción es obligatoria");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("descripcion", description);
      formData.append("usuarioId", user.id);
      formData.append("fechaDePublicacion", new Date().toISOString());
      
      // Agregar etiquetas
      selectedTags.forEach(tag => formData.append("Tags", tag));

      // Agregar imagen si existe
      if (archivo) {
          formData.append("imagen", archivo);
      }

      // Crear el post
      const resPost = await fetch(API_ROUTES.POSTS, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`
        },
        body: formData,
      });

      if (!resPost.ok) throw new Error("Error al crear el post");

      setMensaje("¡Publicación creada exitosamente!");
      setDescription("");
      setSelectedTags([]);
      setArchivo(null);
      setTimeout(() => navigate("/"), 1500);

    } catch (error) {
      console.error(error);
      setError("Hubo un error al crear el post.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p>Debes iniciar sesión para crear un post.</p>;
  }

  return (
    <div className="post-detail-container">
      <h2>Crear Nueva Publicación</h2>

      {mensaje && (
        <p className="banner-success">{mensaje}</p>
      )}

      {error && (
        <p className="banner-error">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="crear-post-form">
        {/* Descripción */}
        <div>
          <label>Descripción *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Input de Archivo */}
        <div className="file-input-section">
            <label className="file-label">Subir Imagen:</label>
            <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setArchivo(e.target.files[0])}
            />
        </div>

        {/* Tags */}
        <div>
          <label>Etiquetas</label>
          <select
            multiple
            value={selectedTags}
            onChange={(e) =>
              setSelectedTags(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
          >
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.nombre}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </form>


      <Link to="/home" className="btn-volver-home"><i className="bi bi-arrow-left-circle-fill"></i>  Volver a Home</Link>
    </div>

    
  );
};

export default CrearPost;
