import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/singup";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard";
import Requestride from "./pages/requestride";
import Incomingrequests from "./pages/incomingrequests";
import Matches from "./pages/matches";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
         <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requestride"
          element={
            <ProtectedRoute>
              <Requestride />
            </ProtectedRoute>
          }
        />

        <Route
          path="/incomingrequests"
          element={
            <ProtectedRoute>
              <Incomingrequests/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/matches/:rideId"
          element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
