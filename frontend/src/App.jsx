import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Draft from "./pages/Draft";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CompanyProfile from "./pages/CompanyProfile";
import { AuthProvider, useAuth } from "./components/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-ms-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ms-border border-t-ms-blue rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"          element={<Landing />} />
          <Route path="/draft"     element={<Draft />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color:      "#201F1E",
              border:     "1px solid #E1DFDD",
              fontFamily: "Inter, Segoe UI, sans-serif",
              fontSize:   "0.83rem",
              boxShadow:  "0 3.2px 7.2px rgba(0,0,0,0.132)",
            },
            success: { iconTheme: { primary:"#107C10", secondary:"#fff" } },
            error:   { iconTheme: { primary:"#D13438", secondary:"#fff" } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}