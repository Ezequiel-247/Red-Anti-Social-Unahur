import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../style/crearPost.css"; // Reutilizamos estilos
import { API_ROUTES } from "../config/api";

const EditarPost = () => {
    const { user } = useContext(UserContext);
    const { id } = useParams(); // Obtenemos el ID de la URL
    const navigate = useNavigate();
    
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [etiquetas, setEtiquetas] = useState([]);
    const [selectedEtiquetas, setSelectedEtiquetas] = useState([]);
    const [error, setError] = useState("");

    // Cargar datos del post y etiquetas
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Cargar etiquetas disponibles
                const resTags = await fetch(API_ROUTES.ETIQUETAS);
                if (resTags.ok) setEtiquetas(await resTags.json());

                // 2. Cargar datos del post
                const resPost = await fetch(`${API_ROUTES.POSTS}/${id}`);
                if (!resPost.ok) throw new Error("Post no encontrado");
                
                const postData = await resPost.json();
                
                // Verificar permisos
                if (user && postData.usuario?.id !== user.id && postData.usuarioId !== user.id) {
                    alert("No tienes permiso para editar este post");
                    navigate("/");
                    return;
                }

                setDescription(postData.descripcion);
                // Mapear etiquetas del post a sus IDs
                if (postData.Tags) {
                    setSelectedEtiquetas(postData.Tags.map(t => t.id));
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
                setError("Error al cargar la publicación.");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
        else navigate("/login");
    }, [id, user, navigate]);

    const handleEtiquetaChange = (e) => {
        const { value, checked } = e.target;
        const val = parseInt(value);
        if (checked) {
            setSelectedEtiquetas([...selectedEtiquetas, val]);
        } else {
            setSelectedEtiquetas(selectedEtiquetas.filter(id => id !== val));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_ROUTES.POSTS}/${id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}` // Token de seguridad
                },
                body: JSON.stringify({
                    descripcion: description,
                    Tags: selectedEtiquetas
                }),
            });

            if (!res.ok) throw new Error("Error al actualizar");

            navigate("/"); // Volver al home
        } catch (error) {
            console.error(error);
            setError("Error al guardar los cambios.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="login-container"><p>Cargando...</p></div>;

    return (
        <div className="login-container">
            <h1>Editar Publicación</h1>
            <form className="crear-post-form" onSubmit={handleSubmit}>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows="5"
                />
                
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

                <button type="submit" disabled={loading}>
                    {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button type="button" onClick={() => navigate(-1)} className="btn-cancel">
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default EditarPost;