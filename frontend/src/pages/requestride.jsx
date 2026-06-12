import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import Navbar from "../components/Navbar";
import LocationInput from "../components/LocationInput";

export default function Requestride() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
  });

  const [myRides, setMyRides] = useState([]);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 3);
    return maxDate.toISOString().split("T")[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔄 Fetch user's rides
  const fetchMyRides = async () => {
    try {
      if (!auth.currentUser) return;

      const token = await auth.currentUser.getIdToken();

      const response = await fetch(
        "http://localhost:5000/api/rides/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMyRides(data);
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  };

  useEffect(() => {
    fetchMyRides();
  }, []);

  // 🚗 CREATE RIDE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in");
        return;
      }

      const token = await user.getIdToken();

      const departureTime = new Date(
        `${formData.date}T${formData.time}`
      );

      const response = await fetch("http://localhost:5000/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from: formData.from,
          to: formData.to,
          departureTime,
          name: user.displayName || user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Ride created successfully 🚗");

      fetchMyRides();

      setFormData({
        from: "",
        to: "",
        date: "",
        time: "",
      });

    } catch (error) {
      console.error("Error creating ride:", error);
    }
  };

  // 🗑️ DELETE RIDE
  const handleDelete = async (rideId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this ride?"
    );
    if (!confirmDelete) return;

    try {
      const token = await auth.currentUser.getIdToken();

      const response = await fetch(
        `http://localhost:5000/api/rides/${rideId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Ride deleted successfully 🗑️");

      fetchMyRides();

    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <>
      {/* ⭐ Navbar added */}
      <Navbar />

      <div className="request-ride-container">
        <h1>Request a Ride</h1>

        <form onSubmit={handleSubmit} className="ride-request-form">
          <div className="form-group">
            <label htmlFor="from">From:</label>
            <LocationInput
              id="from"
              name="from"
              value={formData.from}
              onChange={handleInputChange}
              placeholder="Enter pickup location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="to">To:</label>
            <LocationInput
              id="to"
              name="to"
              value={formData.to}
              onChange={handleInputChange}
              placeholder="Enter destination"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={getCurrentDate()}
              max={getMaxDate()}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time:</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Request Ride
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>

        <h2>Your Active Requests</h2>

        {myRides.length === 0 && <p>No active rides.</p>}

        {myRides.map((ride) => (
          <div
            key={ride._id}
            onClick={() => ride.status !== "matched" && navigate(`/matches/${ride._id}`)}
            style={{
              border: ride.status === "matched" ? "2px solid green" : "1px solid gray",
              margin: "10px",
              padding: "10px",
              cursor: ride.status === "matched" ? "default" : "pointer",
              borderRadius: "6px",
            }}
          >
            {ride.status === "matched" && (
              <p style={{ color: "green", fontWeight: "bold", marginBottom: "6px" }}>
                🎉 Matched! You have a buddy for this ride.
              </p>
            )}

            <p><strong>From:</strong> {ride.from}</p>
            <p><strong>To:</strong> {ride.to}</p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(ride.departureTime).toLocaleDateString()}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {new Date(ride.departureTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {ride.status === "matched" && ride.matchedWith && (
              <div style={{ marginTop: "8px", padding: "8px", background: "#1a3a1a", borderRadius: "4px" }}>
                <p style={{ margin: 0 }}><strong>Buddy:</strong> {ride.matchedWith.name}</p>
                <p style={{ margin: 0 }}><strong>Email:</strong> {ride.matchedWith.email}</p>
                <p style={{ margin: 0 }}>
                  <strong>Their time:</strong>{" "}
                  {new Date(ride.matchedWith.departureTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {ride.status !== "matched" && (
              <p style={{ color: "gray", fontSize: "12px", marginTop: "6px" }}>
                Click to find a buddy →
              </p>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(ride._id); }}
              style={{
                marginTop: "10px",
                background: "red",
                color: "white",
                padding: "5px 10px",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </>
  );
}