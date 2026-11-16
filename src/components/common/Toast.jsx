export const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="status" onClick={() => onDismiss(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
};
