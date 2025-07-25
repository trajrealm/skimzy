// src/components/ProtectedRoute.tsx
import { useAuth } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) {
    return <p>Loading...</p>; // or a spinner
  }

  return <>{children}</>;
}
