import "../style/styles.css";
import "../style/register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { API_ROUTES } from "../config/api";

const Register = () => {
  const { setUser } = useContext(UserContext); // Obtiene la función setUser del contexto para guardar el usuario logueado globalmente
  const [nombre, setNombre] = useState(""); // Estado para guardar el nickname ingresado por el usuario
  const [contraseña, setContraseña] = useState(""); // Estado para la contraseña ingresada
  const [email, setEmail] = useState(""); // Estado para la contraseña ingresada
  const [error, setError] = useState(""); // Estado para mostrar mensajes de error
  const [usuarioCreado, setUsuarioCreado] = useState(false); // Estado para el usuario creado
  const [loading, setLoading] = useState(false); // Estado para controlar la carga
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página)

    if (!nombre || !contraseña || !email) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const resPost = await fetch(API_ROUTES.USERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombre,
          email: email,
          contraseña: contraseña,
        }),
      });

      if (!resPost.ok) {
        const errorData = await resPost.json().catch(() => ({}));
        // Muestra el mensaje específico del backend (ej: "Contraseña muy corta") o un genérico
        throw new Error(errorData.message || errorData.error || `Error ${resPost.status}: Datos inválidos`);
      }

      if (resPost.status === 201) {
        setUsuarioCreado(true);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }

      setError(""); // Limpia cualquier error previo
    } catch (error) {
      console.error("Error al registrar:", error); // Muestra el error en consola
      setError(error.message || "Error de conexión."); // Muestra mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Registrate</h1>
      <form className="login" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre" // Texto guía
          value={nombre} // Valor controlado por estado
          onChange={(e) => setNombre(e.target.value)} // Actualiza estado al escribir
          aria-label="Nombre de usuario"
        />
        <input
          type="email"
          placeholder="Email" // Texto guía
          value={email} // Valor controlado por estado
          onChange={(e) => setEmail(e.target.value)} // Actualiza estado al escribir
          aria-label="Correo electrónico"
        />
        <input
          type="password"
          placeholder="Contraseña" // Texto guía
          value={contraseña} // Valor controlado por estado
          onChange={(e) => setContraseña(e.target.value)} // Actualiza estado al escribir
          aria-label="Contraseña"
        />
        <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        <Link to="/login" className="register">
          Ya tengo cuenta
        </Link>
      </form>
      {usuarioCreado && (
        <div className="alert success">
          <span className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              viewBox="0 0 24 24"
              fill="#6ee7b7"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M12 0C5.371 0 0 5.372 0 12s5.371 12 12 12 12-5.372 12-12S18.629 0 12 0zm-1.2 17.1l-4.9-4.9 1.4-1.4 3.5 3.5 6.5-6.5 1.4 1.4-7.9 7.9z" />
            </svg>
          </span>
          <span className="message">Usuario creado con éxito</span>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Register;
