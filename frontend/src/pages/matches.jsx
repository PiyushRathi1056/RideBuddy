import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";
import { showToast } from "../components/Toast";

export default function Matches() {
  const { rideId } = useParams();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(null);

  useEffect(() => { document.title = "RideBuddy — Find a Buddy"; }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/buddy/matches/${rideId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message); return; }
      setMatches(data);
    } catch (err) {
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, [rideId]);

  const handleRequestBuddy = async (toRideId) => {
    try {
      setRequesting(toRideId);
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/buddy/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fromRideId: rideId, toRideId }),
      });
      const data = await response.json();
      if (!response.ok) { showToast(data.message, "error"); return; }
      showToast("Buddy request sent!");
      fetchMatches();
    } catch (err) {
      showToast("Something went wrong", "error");
    } finally {
      setRequesting(null);
    }
  };

  const getButtonLabel = (match) => {
    if (requesting === match._id) return "Sending...";
    if (match.buddyRequestStatus === "pending") return "Request Sent ✓";
    if (match.buddyRequestStatus === "accepted") return "Matched ✅";
    if (match.buddyRequestStatus === "rejected") return "Rejected";
    return "Request Buddy";
  };

  const isDisabled = (match) => requesting === match._id || match.buddyRequestStatus !== null;

  return (
    <>
      <Navbar />

      <div className="page fade-up">
        {/* Back button */}
        <button
          className="btn-ghost"
          onClick={() => navigate("/requestride")}
          style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          ← Back to My Rides
        </button>

        <h1 style={{ marginBottom: "0.4rem" }}>Available Matches</h1>
        <p style={{ color: "var(--gray)", fontSize: "0.88rem", marginBottom: "1.5rem" }}>
          Rides within ±1 hour of your departure, sorted by closest time.
        </p>

        {loading && <p style={{ color: "var(--gray)" }}>Loading matches...</p>}
        {error && <p style={{ color: "var(--red)" }}>{error}</p>}

        {!loading && !error && matches.length === 0 && (
          <div className="empty-state">No matches right now. Check back later!</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {matches.map((match) => (
            <div key={match._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{match.name}</p>
                  <p style={{ color: "var(--gray)", fontSize: "0.85rem" }}>{match.email}</p>
                </div>
                <p style={{ color: "var(--gray)", fontSize: "0.85rem", textAlign: "right" }}>
                  {new Date(match.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  <br />
                  <span style={{ fontSize: "0.78rem" }}>{new Date(match.departureTime).toLocaleDateString()}</span>
                </p>
              </div>

              <p style={{ fontSize: "0.9rem", color: "var(--gray)", marginBottom: "0.85rem" }}>
                {match.from} → {match.to}
              </p>

              <button
                onClick={() => handleRequestBuddy(match._id)}
                disabled={isDisabled(match)}
                className={isDisabled(match) ? "btn-secondary" : "btn-primary"}
                style={{ fontSize: "0.88rem" }}
              >
                {getButtonLabel(match)}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
