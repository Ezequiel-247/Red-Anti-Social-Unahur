import React, { useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../style/Layout.css";
import BackgroundCarousel from "./BackgroundCarousel";
import Avatar from "./Avatar";
import NotificationBell from "./NotificationBell";
import { FaLinkedin, FaGithub, FaBriefcase } from "react-icons/fa";
import logo from "../public/img/logo_unahur_anti_social.jpg";

const Layout = ({ children }) => {
    const { user, setUser } = useContext(UserContext); // Obtenemos usuario y función para logout desde el contexto
    const navigate = useNavigate();
    const location = useLocation();

    // Función para cerrar sesión: limpia usuario global y localStorage
    const handleLogout = () => {
        setUser(null);
        navigate("/");
    };

    // Mismo guard que usa Home.jsx: si no hay sesión, primero pide login.
    const handleCrearClick = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        navigate("/crear-post");
    };

    const isActive = (path) => location.pathname === path;

    // SEGURIDAD: Efecto para limpiar la contraseña si detecta que está en el estado (por sesiones viejas)
    useEffect(() => {
        if (user && user.contraseña) {
            const { contraseña, ...usuarioSeguro } = user;
            setUser(usuarioSeguro);
        }
    }, [user, setUser]);

    return (
        <div className="layout-container">
            {/* Fondo animado global */}
            <BackgroundCarousel />

            {/* Barra de navegación superior (siempre visible) */}
            <header className="navbar navbar-dark bg-primary">
                <div className="container-fluid">
                    {/* Logo o nombre de la app que enlaza al home */}
                    <Link to="/" className="navbar-brand fw-bold" onClick={() => window.scrollTo(0, 0)}>
                        <img src={logo} alt="Logo UnaHur" className="navbar-logo" />
                        UnaHur Anti-Social
                    </Link>

                    {/* Links de navegación: solo en desktop, en mobile los reemplaza la barra inferior */}
                    <ul className="navbar-nav-desktop">
                        <li className="nav-item">
                            <Link to="/" className={`nav-link ${isActive("/") || isActive("/home") ? "active" : ""}`}>Inicio</Link>
                        </li>

                        {user && (
                            <li className="nav-item">
                                <button onClick={handleCrearClick} className="nav-create-btn">
                                    <i className="bi bi-plus-lg"></i> Crear
                                </button>
                            </li>
                        )}

                        {user ? (
                            <>
                                <li className="nav-item">
                                    <NotificationBell dropdownPosition="down" />
                                </li>
                                <li className="nav-item">
                                    <Link to="/perfil" className={`nav-user-chip ${isActive("/perfil") ? "active" : ""}`}>
                                        <Avatar user={user} size={30} className="nav-avatar" />
                                        <span>{user.nombre}</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button onClick={handleLogout} className="nav-logout-btn" aria-label="Cerrar sesión" title="Cerrar sesión">
                                        <i className="bi bi-box-arrow-right"></i>
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link to="/login" className="nav-login-btn">Ingresar</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </header>

            {/* Aquí se renderiza el contenido de cada vista */}
            <main>{children}</main>

            {/* Barra de navegación inferior (solo mobile), al estilo Instagram/LinkedIn */}
            <nav className="bottom-nav" aria-label="Navegación principal">
                <Link to="/" className={`bottom-nav-item ${isActive("/") || isActive("/home") ? "active" : ""}`} aria-label="Inicio">
                    <i className="bi bi-house-door-fill"></i>
                    <span>Inicio</span>
                </Link>

                <button onClick={handleCrearClick} className="bottom-nav-item bottom-nav-create" aria-label="Crear publicación">
                    <i className="bi bi-plus-circle-fill"></i>
                    <span>Crear</span>
                </button>

                {user && (
                    <div className="bottom-nav-item bottom-nav-notifications">
                        <NotificationBell dropdownPosition="up" />
                        <span>Avisos</span>
                    </div>
                )}

                {user ? (
                    <Link to="/perfil" className={`bottom-nav-item ${isActive("/perfil") ? "active" : ""}`} aria-label="Mi perfil">
                        <Avatar user={user} size={22} />
                        <span>Perfil</span>
                    </Link>
                ) : (
                    <Link to="/login" className={`bottom-nav-item ${isActive("/login") ? "active" : ""}`} aria-label="Iniciar sesión">
                        <i className="bi bi-box-arrow-in-right"></i>
                        <span>Ingresar</span>
                    </Link>
                )}

                {user && (
                    <button onClick={handleLogout} className="bottom-nav-item" aria-label="Cerrar sesión">
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Salir</span>
                    </button>
                )}
            </nav>

            {/* Footer con redes sociales */}
            <footer className="footer">
                <div className="footer-content">
                    <p>© 2025 UnaHur Anti-Social - Desarrollado por Eduardo Ezequiel Ortiz</p>
                    <div className="social-icons">
                        <a href="https://www.linkedin.com/in/eduardo-ezequiel-ortiz-7815a526b/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                            <FaLinkedin />
                        </a>
                        <a href="https://github.com/Ezequiel-247" target="_blank" rel="noopener noreferrer" title="GitHub">
                            <FaGithub />
                        </a>
                        <a href="https://portfolio-ezequiel-qzz0.onrender.com/#inicio" target="_blank" rel="noopener noreferrer" title="Mi Portfolio">
                            <FaBriefcase />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
