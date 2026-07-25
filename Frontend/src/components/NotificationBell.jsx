import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Avatar from "./Avatar";
import { API_ROUTES } from "../config/api";
import "../style/notificationBell.css";

// Texto por tipo de notificación. "respuesta" = alguien más comentó en un
// post donde vos ya habías comentado antes (no el dueño del post).
const mensajePorTipo = {
    comentario: "comentó tu publicación",
    respuesta: "también comentó en una publicación donde participaste",
    reaccion: "le dio like a tu publicación",
};

// Relativo simple ("hace 2 min", "hace 3 h", "hace 5 d") sin depender de
// ninguna librería de fechas, ya que el resto del proyecto tampoco usa una.
const tiempoRelativo = (fecha) => {
    const segundos = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
    if (segundos < 60) return "ahora";
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    return `hace ${dias} d`;
};

// dropdownPosition: "down" (navbar desktop) o "up" (barra inferior mobile,
// donde el dropdown tiene que abrir hacia arriba para no salirse de pantalla).
const NotificationBell = ({ dropdownPosition = "down" }) => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [notificaciones, setNotificaciones] = useState([]);
    const [abierto, setAbierto] = useState(false);
    const contenedorRef = useRef(null);

    // Se pide al backend al cargar la app y en cada navegación (a propósito
    // no usamos polling para no generar requests periódicos al server free).
    useEffect(() => {
        if (!user) {
            setNotificaciones([]);
            return;
        }
        fetch(API_ROUTES.NOTIFICATIONS, {
            headers: { Authorization: `Bearer ${user.token}` },
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => setNotificaciones(data))
            .catch((error) => console.error("Error al cargar notificaciones:", error));
    }, [user, location.pathname]);

    // Cierra el dropdown al hacer click afuera.
    useEffect(() => {
        const handleClickFuera = (e) => {
            if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener("mousedown", handleClickFuera);
        return () => document.removeEventListener("mousedown", handleClickFuera);
    }, []);

    if (!user) return null;

    const noLeidas = notificaciones.filter((n) => !n.leida).length;

    const marcarLeidaYNavegar = async (notificacion) => {
        setAbierto(false);
        if (!notificacion.leida) {
            setNotificaciones((prev) =>
                prev.map((n) => (n.id === notificacion.id ? { ...n, leida: true } : n))
            );
            fetch(`${API_ROUTES.NOTIFICATIONS}/${notificacion.id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${user.token}` },
            }).catch((error) => console.error("Error al marcar notificación como leída:", error));
        }
        navigate(`/post/${notificacion.publicacionId}`);
    };

    const marcarTodasLeidas = () => {
        setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
        fetch(`${API_ROUTES.NOTIFICATIONS}/read-all`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${user.token}` },
        }).catch((error) => console.error("Error al marcar todas como leídas:", error));
    };

    return (
        <div className="notification-bell" ref={contenedorRef}>
            <button
                className="notification-bell-btn"
                onClick={() => setAbierto((v) => !v)}
                aria-label="Notificaciones"
            >
                <i className="bi bi-bell-fill"></i>
                {noLeidas > 0 && <span className="notification-badge">{noLeidas > 9 ? "9+" : noLeidas}</span>}
            </button>

            {abierto && (
                <div className={`notification-dropdown notification-dropdown-${dropdownPosition}`}>
                    <div className="notification-dropdown-header">
                        <span>Notificaciones</span>
                        {noLeidas > 0 && (
                            <button className="notification-mark-all" onClick={marcarTodasLeidas}>
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>

                    {notificaciones.length === 0 ? (
                        <p className="notification-empty">No tenés notificaciones todavía.</p>
                    ) : (
                        <ul className="notification-list">
                            {notificaciones.map((n) => (
                                <li
                                    key={n.id}
                                    className={`notification-item ${n.leida ? "" : "unread"}`}
                                    onClick={() => marcarLeidaYNavegar(n)}
                                >
                                    <Avatar user={n.actor} size={36} />
                                    <div className="notification-text">
                                        <p>
                                            <strong>{n.actor?.nombre}</strong> {mensajePorTipo[n.tipo] || "interactuó con tu publicación"}
                                        </p>
                                        <span className="notification-time">{tiempoRelativo(n.createdAt)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
