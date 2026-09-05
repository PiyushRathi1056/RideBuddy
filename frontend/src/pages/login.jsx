import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import RBLogo from "../components/RBLogo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => { document.title = "RideBuddy — Sign In"; }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMsg("");
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMsg("Reset link sent! Check your inbox (and spam folder).");
    } catch (err) {
      setResetMsg("Couldn't send reset email. Make sure the address is correct.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-up">
        <p className="brand"><RBLogo size={28} style={{ verticalAlign: "middle", marginRight: "0.4rem" }} />RIDEBUDDY</p>

        {!showReset ? (
          <>
            <h2>Welcome back</h2>

            {error && <p style={{ color: "var(--red)", fontSize: "0.88rem", marginBottom: "1rem", textAlign: "center" }}>{error}</p>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label>Password</label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => { setShowReset(true); setResetEmail(email); setResetMsg(""); }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.7em", marginTop: "0.5rem" }} disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="auth-footer">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Reset password</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--gray)", marginBottom: "1.25rem", textAlign: "center" }}>
              Enter your email and we'll send you a reset link.
            </p>

            {resetMsg && (
              <p style={{
                fontSize: "0.88rem",
                marginBottom: "1rem",
                textAlign: "center",
                color: resetMsg.startsWith("Reset link") ? "var(--green)" : "var(--red)"
              }}>
                {resetMsg}
              </p>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.7em", marginTop: "0.5rem" }} disabled={resetLoading}>
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="auth-footer">
              <button type="button" className="forgot-link" onClick={() => { setShowReset(false); setResetMsg(""); }}>
                ← Back to Sign In
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
