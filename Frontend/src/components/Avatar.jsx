import "../style/avatar.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Avatar reutilizable: si el usuario tiene foto de perfil la muestra, si no
// cae a un círculo con la inicial del nombre. Se usa en el navbar, la barra
// inferior mobile y el header del perfil para que los tres queden consistentes.
const Avatar = ({ user, size = 32, className = "" }) => {
    const inicial = user?.nombre?.charAt(0).toUpperCase() || "?";

    if (user?.avatar) {
        const src = user.avatar.startsWith("http") ? user.avatar : `${BASE_URL}${user.avatar}`;
        return (
            <img
                src={src}
                alt=""
                className={`avatar-img ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <div
            className={`avatar-fallback ${className}`}
            style={{ width: size, height: size, fontSize: size * 0.45 }}
            aria-hidden="true"
        >
            {inicial}
        </div>
    );
};

export default Avatar;
