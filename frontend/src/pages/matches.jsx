import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";

export default function Matches() {
  const { rideId } = useParams();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(null); // rideId being requested

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await auth.currentUser.getIdToken();

      const response = await fetch(
        `http://localhost:5000/api/buddy/matches/${rideId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setMatches(data);
    } catch (err) {
      setError("Failed to load matches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [rideId]);

  const handleRequestBuddy = async (toRideId) => {
    try {
      setRequesting(toRideId);

      const token = await auth.currentUser.getIdToken();

      const response = await fetch("http://localhost:5000/api/buddy/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fromRideId: rideId, toRideId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      // Refresh to update button states
      fetchMatches();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setRequesting(null);
    }
  };

  const getButtonLabel = (match) => {
    if (requesting === match._id) return "Sending...";
    if (match.buddyRequestStatus === "pending") return "Request Sent";
    if (match.buddyRequestStatus === "accepted") return "Matched ✅";
    if (match.buddyRequestStatus === "rejected") return "Rejected";
    return "Request Buddy";
  };

  const isButtonDisabled = (match) => {
    return (
      requesting === match._id ||
      match.buddyRequestStatus !== null
    );
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <button onClick={() => navigate("/requestride")} style={{ marginBottom: "16px" }}>
          ← Back
        </button>

        <h1>Available Matches</h1>
        <p style={{ color: "gray" }}>
          Showing rides within ±2 hours of your departure time, sorted by closest match.
        </p>

        {loading && <p>Loading matches...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && matches.length === 0 && (
          <p>No matches found right now. Check back later!</p>
        )}

        {matches.map((match) => (
          <div
            key={match._id}
            style={{
              border: "1px solid gray",
              margin: "10px 0",
              padding: "14px",
              borderRadius: "6px",
            }}
          >
            <p><strong>Name:</strong> {match.name}</p>
            <p><strong>Email:</strong> {match.email}</p>
            <p><strong>From:</strong> {match.from}</p>
            <p><strong>To:</strong> {match.to}</p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(match.departureTime).toLocaleDateString()}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {new Date(match.departureTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            <button
              onClick={() => handleRequestBuddy(match._id)}
              disabled={isButtonDisabled(match)}
              style={{
                marginTop: "10px",
                padding: "6px 14px",
                background: match.buddyRequestStatus ? "#555" : "#1a73e8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isButtonDisabled(match) ? "not-allowed" : "pointer",
              }}
            >
              {getButtonLabel(match)}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
