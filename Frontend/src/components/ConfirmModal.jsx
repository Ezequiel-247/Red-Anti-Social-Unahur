import { createPortal } from "react-dom";
import "../style/modal.css";

// Modal de confirmación genérico: reemplaza a window.confirm() para que las
// acciones destructivas (borrar post/comentario) se vean parte de la app
// en vez de un popup nativo del navegador.
const ConfirmModal = ({
  open,
  title = "¿Estás seguro?",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  // Portal a document.body: si el modal quedara anidado dentro de un contenedor
  // con una animación CSS (transform), "position: fixed" deja de calcularse
  // contra toda la pantalla y pasa a calcularse contra ese contenedor, corriendo
  // el modal y generando scroll horizontal. El portal evita ese problema siempre.
  return createPortal(
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-modal-title">{title}</h3>
        {message && <p className="modal-message">{message}</p>}
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`modal-btn ${danger ? "modal-btn-danger" : "modal-btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
