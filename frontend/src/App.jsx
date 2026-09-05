import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Signup from "./pages/singup";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard";
import Requestride from "./pages/requestride";
import Incomingrequests from "./pages/incomingrequests";
import Matches from "./pages/matches";
import Terms from "./pages/terms";
import Privacy from "./pages/privacy";
import VerifyEmail from "./pages/verifyemail";
import ToastContainer from "./components/Toast";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/"            element={<Landing />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/signup"      element={<Signup />} />
        <Route path="/terms"       element={<Terms />} />
        <Route path="/privacy"     element={<Privacy />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/requestride"     element={<ProtectedRoute><Requestride /></ProtectedRoute>} />
        <Route path="/incomingrequests" element={<ProtectedRoute><Incomingrequests /></ProtectedRoute>} />
        <Route path="/matches/:rideId" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
