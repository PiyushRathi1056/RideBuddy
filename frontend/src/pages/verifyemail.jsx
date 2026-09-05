import { useState, useEffect } from "react";
import { sendEmailVerification, signOut, onAuthStateChanged, reload } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import RBLogo from "../components/RBLogo";

export default function VerifyEmail() {
  const [user, setUser] = useState(null);
  const [resendMsg, setResendMsg] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "RideBuddy — Verify Email";
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleResend = async () => {
    if (!user) return;
    setResendMsg("");
    setResendLoading(true);
    try {
      await sendEmailVerification(user);
      setResendMsg("Verification email sent! Check your inbox.");
    } catch {
      setResendMsg("Couldn't resend. Wait a moment and try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    if (!user) return;
    setCheckLoading(true);
    try {
      // Force-refresh the token so emailVerified reflects the latest state
      await reload(user);
      if (auth.currentUser?.emailVerified) {
        navigate("/dashboard");
      } else {
        setResendMsg("Email not verified yet. Check your inbox and click the link.");
      }
    } catch {
      setResendMsg("Something went wrong. Please try again.");
    } finally {
      setCheckLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-up" style={{ textAlign: "center" }}>
        <p className="brand"><RBLogo size={28} style={{ verticalAlign: "middle", marginRight: "0.4rem" }} />RIDEBUDDY</p>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📧</div>
        <h2>Verify your email</h2>
        <p style={{ fontSize: "0.9rem", color: "var(--gray)", margin: "0.75rem 0 1.5rem" }}>
          We sent a verification link to{" "}
          <strong style={{ color: "var(--white)" }}>{user?.email}</strong>.
          Click it to activate your account.
        </p>

        {resendMsg && (
          <p style={{
            fontSize: "0.85rem",
            marginBottom: "1rem",
            color: resendMsg.startsWith("Verification") ? "var(--green)" : "var(--red)"
          }}>
            {resendMsg}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <button
            className="btn-primary"
            style={{ width: "100%", padding: "0.7em" }}
            onClick={handleCheckVerified}
            disabled={checkLoading}
          >
            {checkLoading ? "Checking..." : "I've verified — Continue"}
          </button>

          <button
            className="btn-secondary"
            style={{ width: "100%", padding: "0.7em" }}
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? "Sending..." : "Resend verification email"}
          </button>

          <button
            className="btn-ghost"
            style={{ width: "100%", padding: "0.7em" }}
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
