import ProtectedRoute from "../components/ProtectedRoute";

export default function LibraryPage() {
  return (
    <ProtectedRoute>
      <h1>Your Library</h1>
      {/* Library content */}
    </ProtectedRoute>
  );
}
