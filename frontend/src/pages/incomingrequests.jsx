import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";
import { showToast } from "../components/Toast";

export default function Incomingrequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(null);

  useEffect(() => { document.title = "RideBuddy — Incoming Requests"; }, []);

  const fetchIncoming = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/buddy/incoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message); return; }
      setRequests(data);
    } catch (err) {
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncoming(); }, []);

  const handleAction = async (buddyRequestId, action) => {
    try {
      setActing(buddyRequestId);
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/buddy/${action}/${buddyRequestId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) { showToast(data.message, "error"); return; }
      showToast(action === "accept" ? "You're matched! 🎉" : "Request rejected");
      fetchIncoming();
    } catch (err) {
      showToast("Something went wrong", "error");
    } finally {
      setActing(null);
    }
  };

  return (
    <>
      <Navbar />

      <div className="page fade-up">
        <button
          className="btn-ghost"
          onClick={() => navigate("/dashboard")}
          style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          ← Back to Dashboard
        </button>

        <h1 style={{ marginBottom: "0.4rem" }}>Incoming Requests</h1>
        <p style={{ color: "var(--gray)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
          People who want to ride with you.
        </p>

        {loading && <p style={{ color: "var(--gray)" }}>Loading...</p>}
        {error && <p style={{ color: "var(--red)" }}>{error}</p>}

        {!loading && !error && requests.length === 0 && (
          <div className="empty-state">No pending requests right now.</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {requests.map((req) => (
            <div key={req._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{req.fromRideId?.name}</p>
                  <p style={{ color: "var(--gray)", fontSize: "0.85rem" }}>{req.fromRideId?.email}</p>
                </div>
                <span className="tag tag-pending">Pending</span>
              </div>

              <p style={{ fontSize: "0.9rem", color: "var(--gray)", marginBottom: "0.3rem" }}>
                {req.fromRideId?.from} → {req.fromRideId?.to}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", margin: "0.75rem 0", fontSize: "0.85rem" }}>
                <div style={{ background: "var(--bg)", borderRadius: "8px", padding: "0.6rem 0.8rem" }}>
                  <p style={{ color: "var(--gray)", fontSize: "0.75rem", marginBottom: "0.2rem" }}>THEIR TIME</p>
                  <p style={{ fontWeight: 500 }}>
                    {new Date(req.fromRideId?.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p style={{ color: "var(--gray)", fontSize: "0.78rem" }}>
                    {new Date(req.fromRideId?.departureTime).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ background: "var(--bg)", borderRadius: "8px", padding: "0.6rem 0.8rem" }}>
                  <p style={{ color: "var(--gray)", fontSize: "0.75rem", marginBottom: "0.2rem" }}>YOUR TIME</p>
                  <p style={{ fontWeight: 500 }}>
                    {new Date(req.toRideId?.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p style={{ color: "var(--gray)", fontSize: "0.78rem" }}>
                    {new Date(req.toRideId?.departureTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.65rem" }}>
                <button
                  className="btn-primary"
                  onClick={() => handleAction(req._id, "accept")}
                  disabled={acting === req._id}
                  style={{ flex: 1, fontSize: "0.88rem" }}
                >
                  {acting === req._id ? "..." : "Accept"}
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleAction(req._id, "reject")}
                  disabled={acting === req._id}
                  style={{ flex: 1, fontSize: "0.88rem" }}
                >
                  {acting === req._id ? "..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
