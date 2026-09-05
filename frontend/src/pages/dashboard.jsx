import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";
import { showToast } from "../components/Toast";
import { Car, Inbox, Users, ArrowRight, UserMinus } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [matchedRides, setMatchedRides] = useState([]);

  useEffect(() => { document.title = "RideBuddy — Dashboard"; }, []);

  const fetchData = async () => {
    try {
      const token = await auth.currentUser.getIdToken();

      const countRes = await fetch(`${import.meta.env.VITE_API_URL}/api/buddy/incoming/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const countData = await countRes.json();
      if (countRes.ok) setPendingCount(countData.count);

      const ridesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/rides/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ridesData = await ridesRes.json();
      if (ridesRes.ok) setMatchedRides(ridesData.filter((r) => r.status === "matched"));
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUnmatch = async (rideId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/buddy/unmatch/${rideId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) { showToast(data.message, "error"); return; }
      showToast("Buddy removed. Your ride is active again.");
      fetchData();
    } catch (err) {
      showToast("Something went wrong", "error");
    }
  };

  const user = auth.currentUser;

  return (
    <>
      <Navbar />

      <div className="page fade-up">
        {/* Hero */}
        <div style={{
          textAlign: "center",
          padding: "3rem 1.5rem",
          margin: "0 -1.25rem 2rem",
          backgroundImage: "url('https://images.unsplash.com/photo-1545972154-9bb223aac798?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "12px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", borderRadius: "12px" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ color: "var(--green)", fontWeight: 700, letterSpacing: "2px", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
              WELCOME BACK
            </p>
            <h1 style={{ fontSize: "2.2rem", marginBottom: "0.4rem" }}>
              {user?.displayName || "Traveller"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem" }}>
              Find someone to share your ride with.
            </p>
          </div>
        </div>

        {/* Matched rides */}
        {matchedRides.length > 0 && (
          <div style={{ marginBottom: "1.75rem" }}>
            <h2 style={{ marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Users size={20} color="var(--green)" /> Your Matched Rides
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {matchedRides.map((ride) => (
                <div key={ride._id} className="card matched">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <p style={{ fontWeight: 600 }}>{ride.from} → {ride.to}</p>
                      <p style={{ color: "var(--gray)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                        {new Date(ride.departureTime).toLocaleDateString()} · {new Date(ride.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className="tag tag-matched">Matched</span>
                  </div>

                  {ride.matchedWith && (
                    <div className="buddy-box">
                      <p style={{ color: "var(--green)", fontWeight: 600, marginBottom: "0.45rem", fontSize: "0.85rem" }}>
                        Your Buddy
                      </p>
                      <p><strong>{ride.matchedWith.name}</strong></p>
                      <p style={{ color: "var(--gray)", fontSize: "0.85rem" }}>
                        Their time: {new Date(ride.matchedWith.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  )}

                  <button
                    className="btn-ghost"
                    onClick={() => handleUnmatch(ride._id)}
                    style={{ marginTop: "0.85rem", fontSize: "0.82rem", color: "var(--red)", borderColor: "var(--red)", display: "flex", alignItems: "center", gap: "0.4rem" }}
                  >
                    <UserMinus size={14} /> Remove Buddy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action cards */}
        <h2 style={{ marginBottom: "0.85rem" }}>Actions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            className="card"
            onClick={() => navigate("/requestride")}
            style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.4rem 1.2rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Car size={22} color="var(--green)" />
              <div>
                <h3>Request a Ride</h3>
                <p style={{ color: "var(--gray)", fontSize: "0.88rem", marginTop: "0.25rem" }}>Post your trip and find a buddy</p>
              </div>
            </div>
            <ArrowRight size={18} color="var(--gray)" />
          </div>

          <div
            className="card"
            onClick={() => navigate("/incomingrequests")}
            style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.4rem 1.2rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Inbox size={22} color="var(--green)" />
              <div>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  Incoming Requests
                  {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
                </h3>
                <p style={{ color: "var(--gray)", fontSize: "0.88rem", marginTop: "0.25rem" }}>Accept or reject buddy requests</p>
              </div>
            </div>
            <ArrowRight size={18} color="var(--gray)" />
          </div>
        </div>
      </div>
    </>
  );
}
