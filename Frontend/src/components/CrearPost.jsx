import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../style/crearPost.css"; // Usar el CSS específico para crear post
import { API_ROUTES } from "../config/api";

const CrearPost = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    
    const [description, setDescription] = useState("");
    const [archivo, setArchivo] = useState(null); // Estado para el archivo de imagen
    const [loading, setLoading] = useState(false);
    const [etiquetas, setEtiquetas] = useState([]);
    const [selectedEtiquetas, setSelectedEtiquetas] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEtiquetas = async () => {
            try {
                const res = await fetch(API_ROUTES.ETIQUETAS);
                if (res.ok) {
                    const data = await res.json();
                    setEtiquetas(data);
                }
            } catch (error) {
                console.error("Error fetching etiquetas:", error);
            }
        };
        fetchEtiquetas();
    }, []);

    // Función para manejar selección de etiquetas
    const handleEtiquetaChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedEtiquetas([...selectedEtiquetas, parseInt(value)]);
        } else {
            setSelectedEtiquetas(selectedEtiquetas.filter(id => id !== parseInt(value)));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError("Debes estar logueado para crear una publicación.");
            return;
        }

        if (description.trim().length < 5) {
            setError("La descripción es muy corta (mínimo 5 caracteres).");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("descripcion", description);
            formData.append("usuarioId", user.id);
            formData.append("fechaDePublicacion", new Date().toISOString());
            
            // Agregar etiquetas
            selectedEtiquetas.forEach(tag => formData.append("Tags", tag));

            // Agregar imagen si existe
            if (archivo) {
                formData.append("imagen", archivo);
            }

            const postRes = await fetch(API_ROUTES.POSTS, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${user.token}` // Enviamos el token
                },
                body: formData, // Enviamos FormData en lugar de JSON
            });

            if (!postRes.ok) {
                const errorData = await postRes.json();
                throw new Error(errorData.detalle || errorData.message || "Error al crear la publicación");
            }

            navigate("/"); // Volver al home
        } catch (error) {
            console.error("Error al crear post:", error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h1>Crear Publicación</h1>
            <form className="crear-post-form" onSubmit={handleSubmit}>
                <textarea 
                    placeholder="¿Qué estás pensando?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                
                {/* Input de Archivo */}
                <div className="file-input-section">
                    <label className="file-label">Subir Imagen:</label>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setArchivo(e.target.files[0])}
                    />
                </div>

                {/* Selección de etiquetas */}
                <div className="etiquetas-section">
                    <label>Etiquetas:</label>
                    <div className="etiquetas-list">
                        {etiquetas.map(etiqueta => (
                            <label key={etiqueta.id} className={`etiqueta-badge ${selectedEtiquetas.includes(etiqueta.id) ? 'selected' : ''}`}>
                                <input
                                    type="checkbox"
                                    value={etiqueta.id}
                                    onChange={handleEtiquetaChange}
                                    checked={selectedEtiquetas.includes(etiqueta.id)}
                                />
                                {etiqueta.nombre}
                            </label>
                        ))}
                    </div>
                </div>

                {error && <div className="banner-error">{error}</div>}

                <button type="submit" disabled={loading}>{loading ? "Publicando..." : "Publicar"}</button>
            </form>
        </div>
    );
};

export default CrearPost;