import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";
import "../style/toast.css";

const ToastContext = createContext();

let idCounter = 0;

// Reemplaza a alert(): mensajes cortos que aparecen arriba de la pantalla y
// se cierran solos, en vez de un popup nativo que bloquea la página.
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "info") => {
        const id = ++idCounter;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {createPortal(
                <div className="toast-container">
                    {toasts.map((t) => (
                        <div key={t.id} className={`toast toast-${t.type}`} role="alert">
                            {t.message}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
