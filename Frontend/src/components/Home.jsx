import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import PostItem from "../components/PostItem"; // asegurate de tener este archivo creado
import "../style/Home.css";
import { API_ROUTES } from "../config/api";

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Nuevo estado para controlar la carga
  const navigate = useNavigate();
  

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  const handleCrearPost = () => {
  if (!user) {
    alert("Debes iniciar sesión para crear una publicación");
    navigate("/login");
    return;
  }
  navigate("/crear-post");
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPosts = await fetch(API_ROUTES.POSTS);
        const postsData = await resPosts.json();

        setPosts(postsData);
      } catch (error) {
        console.error("Error al cargar publicaciones:", error);
      }
      finally {
        setLoading(false); // Avisamos que terminó de cargar (con o sin éxito)
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-container">
      <h1>Bienvenido</h1>
      <h2>{user?.nombre}</h2>

      <button onClick={handleCrearPost} className="btn btn-publicar">
        <i className="bi bi-plus-circle"></i> Crear Nueva Publicación
      </button>

      <div className="feed">
        <h3><i className="bi bi-newspaper"></i> Feed de publicaciones recientes</h3>
        {loading ? (
          <p className="loading-text">Cargando publicaciones...</p>
        ) : posts.length === 0 ? (
          <p className="loading-text">No hay publicaciones recientes.</p>
        ) : (
          posts.map((post) => <PostItem key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Home;
