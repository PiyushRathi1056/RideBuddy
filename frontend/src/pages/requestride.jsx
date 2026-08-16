import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";
import LocationInput from "../components/LocationInput";
import ConfirmModal from "../components/ConfirmModal";
import { showToast } from "../components/Toast";

export default function Requestride() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ from: "", to: "", date: "", time: "" });
  const [myRides, setMyRides] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // rideId to delete

  useEffect(() => { document.title = "RideBuddy — My Rides"; }, []);

  const getCurrentDate = () => new Date().toISOString().split("T")[0];
  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchMyRides = async () => {
    try {
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rides/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setMyRides(data);
    } catch (err) {
      console.error("Error fetching rides:", err);
    }
  };

  useEffect(() => { fetchMyRides(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const departureTime = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rides`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          from: formData.from,
          to: formData.to,
          departureTime,
          name: user.displayName || user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        showToast(data.message, "error");
        return;
      }

      showToast("Ride posted successfully 🚗");
      fetchMyRides();
      setFormData({ from: "", to: "", date: "", time: "" });
    } catch (err) {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    const rideId = confirmDelete;
    setConfirmDelete(null);

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rides/${rideId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) { showToast(data.message, "error"); return; }
      showToast("Ride deleted");
      fetchMyRides();
    } catch (err) {
      showToast("Something went wrong", "error");
    }
  };

  return (
    <>
      <Navbar />

      {confirmDelete && (
        <ConfirmModal
          message={
            myRides.find((r) => r._id === confirmDelete)?.status === "matched"
              ? "This will cancel your match and notify your buddy that the ride is gone."
              : "This will remove your ride request permanently."
          }
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="page fade-up">
        <h1 style={{ marginBottom: "1.5rem" }}>Request a Ride</h1>

        <div className="card" style={{ marginBottom: "2rem" }}>
          {error && (
            <p style={{ color: "var(--red)", fontSize: "0.88rem", marginBottom: "1rem" }}>{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>From</label>
              <LocationInput id="from" name="from" value={formData.from} onChange={handleInputChange} placeholder="Pickup location" />
            </div>

            <div className="form-group">
              <label>To</label>
              <LocationInput id="to" name="to" value={formData.to} onChange={handleInputChange} placeholder="Destination" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} min={getCurrentDate()} max={getMaxDate()} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Posting..." : "Post Ride"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate("/dashboard")}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        <h2 style={{ marginBottom: "1rem" }}>Your Active Requests</h2>

        {myRides.length === 0 && (
          <div className="empty-state">No active rides. Post one above ↑</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {myRides.map((ride) => (
            <div
              key={ride._id}
              className={`card ${ride.status === "matched" ? "matched" : ""}`}
              onClick={() => ride.status !== "matched" && navigate(`/matches/${ride._id}`)}
              style={{ cursor: ride.status === "matched" ? "default" : "pointer" }}
            >
              {ride.status === "matched" && (
                <p style={{ color: "var(--green)", fontWeight: 600, marginBottom: "0.6rem", fontSize: "0.9rem" }}>
                  🎉 Matched! You have a buddy.
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: "0.3rem" }}>{ride.from} → {ride.to}</p>
                  <p style={{ color: "var(--gray)", fontSize: "0.88rem" }}>
                    {new Date(ride.departureTime).toLocaleDateString()} &nbsp;·&nbsp;
                    {new Date(ride.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className={`tag ${ride.status === "matched" ? "tag-matched" : "tag-active"}`}>
                  {ride.status}
                </span>
              </div>

              {ride.status === "matched" && ride.matchedWith && (
                <div className="buddy-box">
                  <p><strong>Buddy:</strong> {ride.matchedWith.name}</p>
                  <p><strong>Email:</strong> {ride.matchedWith.email}</p>
                  <p><strong>Their time:</strong>{" "}
                    {new Date(ride.matchedWith.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              )}

              {ride.status !== "matched" && (
                <p className="hint" style={{ marginTop: "0.6rem" }}>Tap to find a buddy →</p>
              )}

              <button
                className="btn-danger"
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(ride._id); }}
                style={{ marginTop: "0.85rem", fontSize: "0.85rem", padding: "0.4em 0.9em" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
