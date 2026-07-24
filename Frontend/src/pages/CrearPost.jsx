import { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { getCroppedImageBlob } from "../utils/cropImage";
import "../style/crearPost.css";
import "../style/modal.css";
import "../style/cropper.css";
import { API_ROUTES } from "../config/api";

const CrearPost = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagFilter, setTagFilter] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [archivo, setArchivo] = useState(null); // Archivo final a subir (ya recortado)
  const [previewUrl, setPreviewUrl] = useState(null); // Vista previa del recorte
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Recorte de imagen ---
  // originalImageUrl se mantiene mientras haya una foto elegida, para poder
  // reabrir el recortador tantas veces como haga falta sin perder calidad
  // (siempre se recorta desde el original, nunca desde un recorte anterior).
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [cropperAbierto, setCropperAbierto] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [recortando, setRecortando] = useState(false);

  useEffect(() => {
    // Traer etiquetas al cargar
    fetch(API_ROUTES.ETIQUETAS)
      .then((res) => res.json())
      .then((data) => setTags(data))
      .catch((error) => console.error("Error al cargar tags", error));
  }, []);

  useEffect(() => {
    // Limpiar mensajes después de 3 segundos
    if (mensaje || error) {
      const timer = setTimeout(() => {
        setMensaje("");
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [mensaje, error]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // permite elegir el mismo archivo de nuevo más adelante
    if (!file) return;
    setOriginalImageUrl(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropperAbierto(true);
  };

  // Reabre el recortador sobre la foto original (no sobre el recorte ya hecho),
  // para poder seguir ajustando sin perder calidad.
  const handleReeditarRecorte = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropperAbierto(true);
  };

  const handleConfirmarRecorte = async () => {
    if (!croppedAreaPixels) return;
    setRecortando(true);
    try {
      const blob = await getCroppedImageBlob(originalImageUrl, croppedAreaPixels);
      setArchivo(new File([blob], "publicacion.jpg", { type: "image/jpeg" }));
      setPreviewUrl(URL.createObjectURL(blob));
      setCropperAbierto(false);
    } catch (err) {
      console.error("Error al recortar la imagen:", err);
      setError("No se pudo procesar la imagen.");
      setCropperAbierto(false);
    } finally {
      setRecortando(false);
    }
  };

  const handleCancelarRecorte = () => {
    setCropperAbierto(false);
    // Si todavía no había ningún recorte confirmado, cancelar aborta la selección entera.
    if (!archivo) {
      setOriginalImageUrl(null);
    }
  };

  const handleQuitarImagen = () => {
    setArchivo(null);
    setPreviewUrl(null);
    setOriginalImageUrl(null);
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const tagsFiltrados = tags.filter((t) =>
    t.nombre.toLowerCase().includes(tagFilter.toLowerCase())
  );

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

      selectedTags.forEach((tag) => formData.append("Tags", tag));

      if (archivo) {
        formData.append("imagen", archivo);
      }

      const resPost = await fetch(API_ROUTES.POSTS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (!resPost.ok) throw new Error("Error al crear el post");

      setMensaje("¡Publicación creada exitosamente!");
      setDescription("");
      setSelectedTags([]);
      handleQuitarImagen();
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

      {mensaje && <p className="banner-success">{mensaje}</p>}
      {error && <p className="banner-error">{error}</p>}

      <form onSubmit={handleSubmit} className="crear-post-form">
        <div>
          <label>Descripción *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="file-input-section">
          <label className="file-label">Subir Imagen:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Vista previa de la publicación" />
              <button
                type="button"
                className="edit-image-btn"
                onClick={handleReeditarRecorte}
                aria-label="Ajustar recorte"
                title="Ajustar recorte"
              >
                <i className="bi bi-crop"></i>
              </button>
              <button
                type="button"
                className="remove-image-btn"
                onClick={handleQuitarImagen}
                aria-label="Quitar imagen"
                title="Quitar imagen"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          )}
        </div>

        <div className="etiquetas-section">
          <label>Etiquetas</label>
          {tags.length > 6 && (
            <input
              type="text"
              className="etiquetas-filtro"
              placeholder="Buscar etiqueta..."
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            />
          )}
          <div className="etiquetas-list">
            {tagsFiltrados.map((tag) => (
              <label
                key={tag.id}
                className={`etiqueta-badge ${selectedTags.includes(tag.id) ? "selected" : ""}`}
              >
                <input
                  type="checkbox"
                  value={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleTagToggle(tag.id)}
                />
                {tag.nombre}
              </label>
            ))}
            {tagsFiltrados.length === 0 && (
              <span className="etiquetas-sin-resultados">Sin resultados</span>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </form>

      <Link to="/home" className="btn-volver-home">
        <i className="bi bi-arrow-left-circle-fill"></i> Volver a Home
      </Link>

      {/* Modal de recorte, en un portal a document.body: si quedara anidado
          dentro de .post-detail-container (que tiene una animación CSS),
          "position: fixed" se calcula mal y aparece scroll horizontal. */}
      {cropperAbierto && createPortal(
        <div className="modal-backdrop">
          <div className="modal-card cropper-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Ajustá tu foto</h3>
            <p className="cropper-hint">Arrastrá para mover, usá la barra para hacer zoom.</p>
            <div className="cropper-container">
              <Cropper
                image={originalImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                objectFit="cover"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
              />
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="cropper-zoom-slider"
              aria-label="Zoom"
            />
            <div className="modal-actions">
              <button type="button" className="modal-btn modal-btn-cancel" onClick={handleCancelarRecorte}>
                Cancelar
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-primary"
                onClick={handleConfirmarRecorte}
                disabled={recortando}
              >
                {recortando ? "Procesando..." : "Usar esta foto"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CrearPost;
