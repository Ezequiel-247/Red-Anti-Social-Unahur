import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../style/Layout.css";
import BackgroundCarousel from "./BackgroundCarousel";
import { FaLinkedin, FaGithub, FaBriefcase } from "react-icons/fa";
import logo from "../public/img/logo_unahur_anti_social.jpg";

const Layout = ({ children }) => {
    const { user, setUser } = useContext(UserContext); // Obtenemos usuario y función para logout desde el contexto
    const [menuOpen, setMenuOpen] = useState(false); // Estado para el menú hamburguesa

    // Función para cerrar sesión: limpia usuario global y localStorage
    const handleLogout = () => {
        setUser(null);
        setMenuOpen(false);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

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

            {/* Barra de navegación */}
            <header className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container-fluid">
                        {/* Logo o nombre de la app que enlaza al home */}
                        <Link to="/" className="navbar-brand fw-bold" 
                        onClick={() => window.scrollTo(0, 0)}>
                            <img src={logo} alt="Logo UnaHur" className="navbar-logo" />
                            UnaHur Anti-Social
                        </Link>
                        
                        <button className="navbar-toggler" type="button" onClick={toggleMenu}>
                        <span className="navbar-toggler-icon"></span>
                        </button>

                    <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`} id="navbarMenu">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                {/* Botón/Link "Inicio" que lleva a /home */}
                                <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
                                    Inicio
                                </Link>
                            </li>
                        
                            {user ? (
                                <>
                                <li className="nav-item">
                                    <Link to="/perfil" className="nav-link" onClick={() => setMenuOpen(false)}>
                                        Mi Perfil
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button onClick={handleLogout} className="btn btn-outline-light fw-bold ms-lg-3 mt-2 mt-lg-0">
                                        Cerrar Sesión
                                    </button>
                                </li>

                                </>
                                ) : (
                                <li className="nav-item">
                                    <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                                        Login
                                    </Link>
                                </li>    

                                )}
                        </ul>
                    </div>
                </div>
            </header>
            
            {/* Fondo oscuro al abrir menú en mobile */}
            {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)}></div>}

            {/* Aquí se renderiza el contenido de cada vista */}
            <main>{children}</main>

            {/* Footer con redes sociales */}
            <footer className="footer">
                <div className="footer-content">
                    <p>© 2024 UnaHur Anti-Social - Desarrollado por Eduardo Ezequiel Ortiz</p>
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
