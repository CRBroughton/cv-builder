import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute.js";
import { NavBar } from "../components/NavBar.js";
import { AuthProvider } from "../context/auth.js";
import { ThemeProvider } from "../context/theme.js";
import { Login } from "../pages/Login.js";
import { Register } from "../pages/Register.js";
import { Dashboard } from "../pages/Dashboard.js";
import { CVEditor } from "../pages/CVEditor/index.js";
import { CVEditorProvider } from "../pages/CVEditor/CVEditorProvider.js";

export function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <NavBar />
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
        <Route
          path="/:id"
          element={
            <ProtectedRoute>
              <CVEditorProvider>
                <CVEditor />
              </CVEditorProvider>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;