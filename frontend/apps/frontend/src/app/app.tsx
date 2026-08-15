import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute.js";
import { AuthProvider } from "../context/auth.js";
import { Login } from "../pages/Login.js";
import { Register } from "../pages/Register.js";

function Dashboard() {
  return <div style={{ padding: "2rem" }}>Dashboard (coming soon)</div>;
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;