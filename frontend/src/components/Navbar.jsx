import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { getCompanyProfile } from "../pages/CompanyProfile";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user }       = useAuth();
  const navigate       = useNavigate();
  const { pathname }   = useLocation();
  const [open, setOpen] = useState(false);
  const profile        = getCompanyProfile();

  const handleAuth = async () => {
    setOpen(false);
    if (user) {
      await supabase.auth.signOut();
      toast.success("Signed out");
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const navItems = [
    { to: "/",          label: "Home"      },
    { to: "/draft",     label: "Draft"     },
    { to: "/dashboard", label: "Dashboard" },
    ...(user ? [{ to: "/profile", label: "Company Profile" }] : []),
  ];

  const isActive = (to) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <>
      {/* ── Desktop / Mobile top bar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-12 bg-ms-blue flex items-center px-4 shadow-ms">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-6 shrink-0">
          {profile?.logo ? (
            <img src={profile.logo} alt="logo" className="h-7 w-auto object-contain brightness-0 invert" />
          ) : (
            <span className="text-white font-semibold text-sm tracking-wide">⚖ Legal Bro</span>
          )}
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive(n.to)
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold uppercase">
                {user.email?.[0]}
              </div>
              <span className="text-white/80 text-xs max-w-[140px] truncate">{user.email}</span>
            </div>
          )}
          <button
            onClick={handleAuth}
            className="text-xs font-medium bg-white text-ms-blue px-3 py-1.5 rounded hover:bg-ms-blueLight transition-colors"
          >
            {user ? "Sign Out" : "Sign In"}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden ml-auto text-white p-1.5 rounded hover:bg-white/10 transition-colors"
          aria-label="Menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          )}
        </button>
      </nav>

      {/* ── Mobile slide-down menu ── */}
      {open && (
        <div className="fixed top-12 left-0 right-0 z-40 bg-white border-b border-ms-border shadow-ms-lg md:hidden">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 bg-ms-blueLight border-b border-ms-border">
              <div className="w-9 h-9 rounded-full bg-ms-blue flex items-center justify-center text-white text-sm font-semibold uppercase">
                {user.email?.[0]}
              </div>
              <div>
                <div className="text-xs font-semibold text-ms-neutralDark truncate max-w-[220px]">
                  {user.email}
                </div>
                <div className="text-[10px] text-ms-neutralMid">Signed in</div>
              </div>
            </div>
          )}

          {/* Nav links */}
          {navItems.map(n => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b border-ms-border transition-colors ${
                isActive(n.to)
                  ? "bg-ms-blueLight text-ms-blue border-l-4 border-l-ms-blue"
                  : "text-ms-neutral hover:bg-ms-hover"
              }`}
            >
              <span className="text-base">{navIcon(n.to)}</span>
              {n.label}
            </Link>
          ))}

          {/* Sign in/out */}
          <button
            onClick={handleAuth}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
              user
                ? "text-ms-red hover:bg-red-50"
                : "text-ms-blue hover:bg-ms-blueLight"
            }`}
          >
            <span className="text-base">{user ? "🚪" : "🔐"}</span>
            {user ? "Sign Out" : "Sign In"}
          </button>
        </div>
      )}

      {/* Mobile menu backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

function navIcon(to) {
  if (to === "/")         return "🏠";
  if (to === "/draft")    return "📝";
  if (to === "/dashboard") return "📊";
  if (to === "/profile")  return "🏢";
  return "•";
}