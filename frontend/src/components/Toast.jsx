import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle } from "lucide-react";

let toastFn = null;

export function showToast(message, type = "success") {
  if (toastFn) toastFn(message, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    toastFn = addToast;
    return () => { toastFn = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "1.5rem",
      right: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      zIndex: 1000,
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: toast.type === "error" ? "#7f1d1d" : "#14532d",
            border: `1px solid ${toast.type === "error" ? "var(--red)" : "var(--green)"}`,
            color: "var(--white)",
            padding: "0.75rem 1.1rem",
            borderRadius: "10px",
            fontSize: "0.9rem",
            fontWeight: 500,
            maxWidth: "320px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            animation: "fadeUp 0.25s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          {toast.type === "error"
            ? <XCircle size={17} color="var(--red)" />
            : <CheckCircle size={17} color="var(--green)" />
          }
          {toast.message}
        </div>
      ))}
    </div>
  );
}
