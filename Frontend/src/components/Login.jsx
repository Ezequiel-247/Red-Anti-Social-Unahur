import "../style/styles.css";
import "../style/register.css";
import { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { API_ROUTES } from "../config/api";

const Login = () => {
  const { setUser } = useContext(UserContext); // Obtiene la función setUser del contexto para guardar el usuario logueado globalmente
  const [nombre, setNombre] = useState(""); // Estado para guardar el nickname ingresado por el usuario
  const [contraseña, setContraseña] = useState(""); // Estado para la contraseña ingresada
  const [error, setError] = useState(""); // Estado para mostrar mensajes de error
  const [loading, setLoading] = useState(false); // Estado para controlar la carga visual
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página)

    // Validación de campos vacíos
    if (!nombre || !contraseña) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true); // Iniciamos el estado de carga
    setError(""); // Limpiamos errores previos

    try {
      // Petición POST al endpoint de login
      const res = await fetch(`${API_ROUTES.USERS}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, contraseña }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas");
        setContraseña(""); // Limpiamos la contraseña si hay error
        return;
      }

      setUser(data);
      setError("");
      navigate("/home");
    } catch (error) {
      console.error("Error al buscar el usuario:", error); // Muestra el error en consola
      setError("Error de conexión."); // Muestra mensaje de error al usuario
    } finally {
      setLoading(false); // Finalizamos la carga sea éxito o error
    }

  };

  return (
  
    <div className="login-container">
      <h1>Iniciar sesion</h1>
      <form className="login" onSubmit={handleSubmit}>
          <FaUser />
        <input
          type="text"
          placeholder="Nombre" // Texto guía
          value={nombre} // Valor controlado por estado
          onChange={(e) => setNombre(e.target.value)} // Actualiza estado al escribir
          aria-label="Nombre de usuario" // Accesibilidad
        />
          <FaLock />
        <input
          type="password"
          placeholder="Contraseña" // Texto guía
          value={contraseña} // Valor controlado por estado
          onChange={(e) => setContraseña(e.target.value)} // Actualiza estado al escribir
          aria-label="Contraseña" // Accesibilidad
        />
        <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>

        <Link to="/register" className="register">
          Registrate aqui
        </Link>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
