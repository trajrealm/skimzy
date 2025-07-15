import {  Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import LibraryPage from './pages/LibraryPage';
import LibraryItemDetailPage from "./pages/LibraryItemDetailPage";
import type { JSX } from "react";

// Optional: a Protected Route wrapper
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/library"
            element={
              <PrivateRoute>
                <LibraryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/library/:id"
            element={
              <PrivateRoute>
                <LibraryItemDetailPage />
              </PrivateRoute>
            }
          />
          {/* Redirect root to login or library depending on auth */}
          <Route
            path="/"
            element={
              <RequireAuthRedirect />
            }
          />
        </Routes>
    </AuthProvider>
  );
}

// Optional component to redirect from "/" to /library or /login based on auth
function RequireAuthRedirect() {
  const { token } = useAuth();
  return token ? <Navigate to="/library" /> : <Navigate to="/login" />;
}

export default App;
