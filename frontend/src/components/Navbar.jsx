import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Car, Inbox, LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    const fetchCount = async () => {
      try {
        if (!auth.currentUser) return;
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/buddy/incoming/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setPendingCount(data.count);
      } catch (err) { /* silently fail */ }
    };
    fetchCount();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    fontSize: "0.88rem",
    fontWeight: 500,
    color: isActive(path) ? "var(--green)" : "var(--gray)",
    cursor: "pointer",
    padding: "0.3em 0",
    borderBottom: isActive(path) ? "2px solid var(--green)" : "2px solid transparent",
    transition: "color 0.2s, border-color 0.2s",
    background: "none",
    border: "none",
    borderBottom: isActive(path) ? "2px solid var(--green)" : "2px solid transparent",
    borderRadius: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
  });

  const mobileNavLinkStyle = (path) => ({
    fontSize: "1rem",
    fontWeight: 500,
    color: isActive(path) ? "var(--green)" : "var(--white)",
    cursor: "pointer",
    background: "none",
    border: "none",
    borderRadius: 0,
    padding: "0.4em 0",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    textAlign: "left",
  });

  if (!auth.currentUser) return (
    <nav className="navbar">
      <span className="navbar-brand">RideBuddy</span>
    </nav>
  );

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand" style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          RideBuddy
        </span>

        {/* Desktop links */}
        <div className="nav-links">
          <button style={navLinkStyle("/dashboard")} onClick={() => navigate("/dashboard")}>
            <Home size={15} /> Home
          </button>
          <button style={navLinkStyle("/requestride")} onClick={() => navigate("/requestride")}>
            <Car size={15} /> Rides
          </button>
          <button style={navLinkStyle("/incomingrequests")} onClick={() => navigate("/incomingrequests")}>
            <Inbox size={15} /> Requests
            {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
          </button>
          <button className="btn-danger" onClick={handleLogout} style={{ fontSize: "0.85rem", padding: "0.4em 0.9em", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Hamburger */}
        <button className="nav-hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} color="var(--white)" /> : <Menu size={22} color="var(--white)" />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div className={`nav-mobile-menu ${menuOpen ? "open" : ""}`}>
        <button style={mobileNavLinkStyle("/dashboard")} onClick={() => navigate("/dashboard")}>
          <Home size={17} /> Home
        </button>
        <button style={mobileNavLinkStyle("/requestride")} onClick={() => navigate("/requestride")}>
          <Car size={17} /> Rides
        </button>
        <button style={mobileNavLinkStyle("/incomingrequests")} onClick={() => navigate("/incomingrequests")}>
          <Inbox size={17} /> Requests
          {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
        </button>
        <button className="btn-danger" onClick={handleLogout} style={{ fontSize: "0.9rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </>
  );
}
