import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 500,
      padding: "1rem",
      animation: "fadeUp 0.2s ease",
    }}>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "2rem 1.75rem",
        maxWidth: "360px",
        width: "100%",
        textAlign: "center",
      }}>
        <AlertTriangle size={32} color="var(--red)" style={{ marginBottom: "0.75rem" }} />
        <h3 style={{ marginBottom: "0.5rem" }}>Are you sure?</h3>
        <p style={{ color: "var(--gray)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-danger" style={{ flex: 1 }} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
