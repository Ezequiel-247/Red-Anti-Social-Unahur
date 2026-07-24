import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import "../style/Perfil.css";
import { API_ROUTES } from "../config/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const Perfil = () => {
    const { user, setUser } = useContext(UserContext); // Usuario logueado (el que mira)
    const { id: paramId } = useParams(); // Si viene, estamos viendo el perfil de otro usuario
    const navigate = useNavigate();

    const targetId = paramId ? Number(paramId) : user?.id;
    const esPropio = !!user && targetId === user.id;

    const [perfilUsuario, setPerfilUsuario] = useState(null); // Usuario dueño del perfil que se muestra
    const [misPosts, setMisPosts] = useState([]);
    const [likesMap, setLikesMap] = useState({}); // postId -> cantidad de likes
    const [loading, setLoading] = useState(true);
    const [noEncontrado, setNoEncontrado] = useState(false);
    const [subiendoAvatar, setSubiendoAvatar] = useState(false);
    const [errorAvatar, setErrorAvatar] = useState("");
    const avatarInputRef = useRef(null);

    useEffect(() => {
        // "/perfil" sin id es un atajo a "mi perfil": si no hay sesión, no hay a dónde ir.
        if (!paramId && !user) {
            navigate("/login");
            return;
        }
        if (!targetId) return;

        const fetchPerfil = async () => {
            setLoading(true);
            setNoEncontrado(false);
            try {
                // El usuario propio ya lo tenemos en contexto (con token); el de otro lo pedimos.
                if (esPropio) {
                    setPerfilUsuario(user);
                } else {
                    const resUsuario = await fetch(`${API_ROUTES.USERS}/${targetId}`);
                    const dataUsuario = resUsuario.ok ? await resUsuario.json() : null;
                    if (!resUsuario.ok || !dataUsuario) {
                        setNoEncontrado(true);
                        setLoading(false);
                        return;
                    }
                    setPerfilUsuario(dataUsuario);
                }

                const res = await fetch(`${API_ROUTES.POSTS}?userId=${targetId}`);
                const data = await res.json();
                setMisPosts(data);

                // La cantidad de likes no viene incluida en /posts: se pide aparte, en paralelo.
                const entries = await Promise.all(
                    data.map(async (post) => {
                        try {
                            const likesRes = await fetch(`${BASE_URL}/reactions/post/${post.id}`);
                            const likes = await likesRes.json();
                            return [post.id, likes.length];
                        } catch {
                            return [post.id, 0];
                        }
                    })
                );
                setLikesMap(Object.fromEntries(entries));
            } catch (error) {
                console.error("Error al cargar el perfil:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfil();
        // Ojo: dependemos de user?.id (no de "user" entero) para no re-disparar el fetch
        // cada vez que cambia el avatar del usuario logueado (eso ya lo maneja el propio handler).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetId, esPropio, user?.id, paramId, navigate]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        e.target.value = ""; // permite volver a elegir el mismo archivo más adelante
        if (!file) return;

        setErrorAvatar("");
        setSubiendoAvatar(true);
        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const res = await fetch(`${API_ROUTES.USERS}/${user.id}/avatar`, {
                method: "POST",
                headers: { Authorization: `Bearer ${user.token}` },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "No se pudo actualizar la foto de perfil");

            // Mezclamos con el usuario actual para no perder el token (la respuesta no lo incluye)
            setUser((prev) => ({ ...prev, avatar: data.avatar }));
            setPerfilUsuario((prev) => ({ ...prev, avatar: data.avatar }));
        } catch (error) {
            setErrorAvatar(error.message);
        } finally {
            setSubiendoAvatar(false);
        }
    };

    const handleRemoveAvatar = async () => {
        setErrorAvatar("");
        setSubiendoAvatar(true);
        try {
            const res = await fetch(`${API_ROUTES.USERS}/${user.id}/avatar`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "No se pudo quitar la foto de perfil");

            setUser((prev) => ({ ...prev, avatar: null }));
            setPerfilUsuario((prev) => ({ ...prev, avatar: null }));
        } catch (error) {
            setErrorAvatar(error.message);
        } finally {
            setSubiendoAvatar(false);
        }
    };

    if (!paramId && !user) return null; // esperando el redirect a /login

    if (noEncontrado) {
        return (
            <div className="perfil-container">
                <div className="perfil-empty">
                    <i className="bi bi-person-x"></i>
                    <p>Ese usuario no existe.</p>
                    <button className="btn-publicar" onClick={() => navigate("/")}>
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (loading || !perfilUsuario) {
        return (
            <div className="perfil-container">
                <p className="loading-text-dark">Cargando perfil...</p>
            </div>
        );
    }

    const totalComentarios = misPosts.reduce((acc, p) => acc + (p.comentarios?.length || 0), 0);
    const totalLikes = Object.values(likesMap).reduce((acc, n) => acc + n, 0);

    return (
        <div className="perfil-container">
            <div className="perfil-header">
                <div className="perfil-avatar-wrapper">
                    <Avatar user={perfilUsuario} size={88} className="perfil-avatar" />
                    {esPropio && (
                        <>
                            <button
                                type="button"
                                className="perfil-avatar-edit"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={subiendoAvatar}
                                aria-label="Cambiar foto de perfil"
                                title="Cambiar foto de perfil"
                            >
                                <i className={`bi ${subiendoAvatar ? "bi-arrow-repeat" : "bi-camera-fill"}`}></i>
                            </button>
                            {perfilUsuario.avatar && (
                                <button
                                    type="button"
                                    className="perfil-avatar-remove"
                                    onClick={handleRemoveAvatar}
                                    disabled={subiendoAvatar}
                                    aria-label="Quitar foto de perfil"
                                    title="Quitar foto de perfil"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            )}
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                hidden
                            />
                        </>
                    )}
                </div>
                <div className="perfil-info">
                    <h1>{perfilUsuario.nombre}</h1>
                    {errorAvatar && <p className="perfil-avatar-error">{errorAvatar}</p>}
                    <div className="perfil-stats">
                        <div className="perfil-stat">
                            <strong>{misPosts.length}</strong>
                            <span>publicaciones</span>
                        </div>
                        <div className="perfil-stat">
                            <strong>{totalComentarios}</strong>
                            <span>comentarios</span>
                        </div>
                        <div className="perfil-stat">
                            <strong>{totalLikes}</strong>
                            <span>me gusta</span>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="perfil-divider" />

            {misPosts.length === 0 ? (
                <div className="perfil-empty">
                    <i className="bi bi-camera"></i>
                    <p>{esPropio ? "No tenés publicaciones aún." : "Este usuario no tiene publicaciones aún."}</p>
                    {esPropio && (
                        <button className="btn-publicar" onClick={() => navigate("/crear-post")}>
                            <i className="bi bi-plus-circle"></i> Crear tu primera publicación
                        </button>
                    )}
                </div>
            ) : (
                <div className="profile-grid">
                    {misPosts.map((post) => (
                        <button
                            key={post.id}
                            className="profile-grid-item"
                            onClick={() => navigate(`/post/${post.id}`)}
                            aria-label={`Ver publicación: ${post.descripcion?.slice(0, 60) || "publicación"}`}
                        >
                            {post.imagenes && post.imagenes.length > 0 ? (
                                <img
                                    src={post.imagenes[0].ruta.startsWith("http") ? post.imagenes[0].ruta : `${BASE_URL}${post.imagenes[0].ruta}`}
                                    alt=""
                                />
                            ) : (
                                <span className="profile-grid-text">
                                    <span className="profile-grid-text-inner">{post.descripcion}</span>
                                </span>
                            )}
                            <div className="profile-grid-overlay">
                                <span><i className="bi bi-heart-fill"></i> {likesMap[post.id] ?? 0}</span>
                                <span><i className="bi bi-chat-fill"></i> {post.comentarios?.length || 0}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Perfil;
