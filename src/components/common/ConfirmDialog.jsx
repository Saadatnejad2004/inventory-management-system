import { Modal } from "./Modal";

export const ConfirmDialog = ({ isOpen, title, message, confirmLabel = "Confirm", isDestructive = false, onConfirm, onCancel }) => {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <p style={{ color: "var(--muted)", marginBottom: "24px" }}>{message}</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button className="btn btn-ghost" onClick={onCancel} autoFocus>Cancel</button>
        <button className={isDestructive ? "btn btn-danger" : "btn btn-primary"} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
