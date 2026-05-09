import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleAuth = async () => {
    if (user) {
      await supabase.auth.signOut();
      toast.success("Signed out");
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium tracking-wide transition-colors ${
        pathname === to ? "text-amber-400" : "text-stone-400 hover:text-amber-300"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-8 border-b border-[#2A3450] bg-[rgba(8,11,20,0.92)] backdrop-blur-xl">
      <Link to="/" className="flex items-center gap-2 font-serif text-lg font-bold text-amber-300">
        <span className="w-7 h-7 bg-amber-500 rounded text-[#080B14] flex items-center justify-center text-sm">⚖</span>
        Legal Bro
      </Link>

      <div className="flex items-center gap-6">
        {navLink("/", "Home")}
        {navLink("/draft", "Draft")}
        {navLink("/dashboard", "Dashboard")}
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <span className="text-xs text-stone-400">{user.email?.split("@")[0]}</span>
        )}
        <button
          onClick={handleAuth}
          className="border border-amber-600 text-amber-300 text-xs font-medium px-4 py-1.5 rounded hover:bg-amber-600/10 transition-colors tracking-wide"
        >
          {user ? "Sign Out" : "Sign In"}
        </button>
      </div>
    </nav>
  );
}
