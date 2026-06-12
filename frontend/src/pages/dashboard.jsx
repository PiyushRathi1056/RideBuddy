import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const token = await auth.currentUser.getIdToken();

        const response = await fetch(
          "http://localhost:5000/api/buddy/incoming/count",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setPendingCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching pending count:", error);
      }
    };

    fetchPendingCount();
  }, []);

  return (
    <>
      <Navbar />

      <div>
        <h1>RIDE BUDDY</h1>
        <h2>
          Welcome, {auth.currentUser?.displayName || "User"}
        </h2>
      </div>

      <div>
        <button onClick={() => navigate("/requestride")}>
          Request Ride
        </button>

        <br />

        <button
          onClick={() => navigate("/incomingrequests")}
          style={{ position: "relative" }}
        >
          Incoming Requests
          {pendingCount > 0 && (
            <span
              style={{
                marginLeft: "8px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 7px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
