import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";

export default function Incomingrequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(null); // buddyRequestId being accepted/rejected

  const fetchIncoming = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await auth.currentUser.getIdToken();

      const response = await fetch("http://localhost:5000/api/buddy/incoming", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setRequests(data);
    } catch (err) {
      setError("Failed to load requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncoming();
  }, []);

  const handleAction = async (buddyRequestId, action) => {
    try {
      setActing(buddyRequestId);

      const token = await auth.currentUser.getIdToken();

      const response = await fetch(
        `http://localhost:5000/api/buddy/${action}/${buddyRequestId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);
      fetchIncoming();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setActing(null);
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <button onClick={() => navigate("/dashboard")} style={{ marginBottom: "16px" }}>
          ← Back
        </button>

        <h1>Incoming Requests</h1>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && requests.length === 0 && (
          <p>No pending buddy requests.</p>
        )}

        {requests.map((req) => (
          <div
            key={req._id}
            style={{
              border: "1px solid gray",
              margin: "10px 0",
              padding: "14px",
              borderRadius: "6px",
            }}
          >
            <p><strong>From:</strong> {req.fromRideId?.name}</p>
            <p><strong>Email:</strong> {req.fromRideId?.email}</p>
            <p><strong>Route:</strong> {req.fromRideId?.from} → {req.fromRideId?.to}</p>
            <p>
              <strong>Their Time:</strong>{" "}
              {new Date(req.fromRideId?.departureTime).toLocaleDateString()}{" "}
              {new Date(req.fromRideId?.departureTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>
              <strong>Your Time:</strong>{" "}
              {new Date(req.toRideId?.departureTime).toLocaleDateString()}{" "}
              {new Date(req.toRideId?.departureTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleAction(req._id, "accept")}
                disabled={acting === req._id}
                style={{
                  padding: "6px 14px",
                  background: "green",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: acting === req._id ? "not-allowed" : "pointer",
                }}
              >
                {acting === req._id ? "..." : "Accept"}
              </button>

              <button
                onClick={() => handleAction(req._id, "reject")}
                disabled={acting === req._id}
                style={{
                  padding: "6px 14px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: acting === req._id ? "not-allowed" : "pointer",
                }}
              >
                {acting === req._id ? "..." : "Reject"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
