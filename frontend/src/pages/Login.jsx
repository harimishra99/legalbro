import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.includes("Email not confirmed"))
        toast.error("Please confirm your email first, then try again.");
      else if (error.message.includes("Invalid login"))
        toast.error("Incorrect email or password.");
      else
        toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate("/draft");
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options:  { redirectTo: `${window.location.origin}/draft` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-ms-bg pt-12 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white border border-ms-border rounded-lg shadow-ms overflow-hidden">
          {/* Blue top bar */}
          <div className="bg-ms-blue px-6 py-5">
            <div className="text-white font-semibold text-lg">⚖ Legal Bro</div>
            <div className="text-white/70 text-sm mt-0.5">Sign in to your account</div>
          </div>

          <div className="p-6">
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2 border border-ms-border rounded px-4 py-2.5 text-sm text-ms-neutral hover:bg-ms-hover hover:border-ms-blue transition-colors mb-4"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4 text-xs text-ms-neutralLight">
              <div className="flex-1 h-px bg-ms-border" />or<div className="flex-1 h-px bg-ms-border" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ms-neutralMid mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full border border-ms-border rounded px-3 py-2.5 text-sm text-ms-neutral placeholder-ms-neutralLight focus:outline-none focus:border-ms-blue focus:ring-1 focus:ring-ms-blue transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ms-neutralMid mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full border border-ms-border rounded px-3 py-2.5 text-sm text-ms-neutral placeholder-ms-neutralLight focus:outline-none focus:border-ms-blue focus:ring-1 focus:ring-ms-blue transition"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-ms-blue text-white font-semibold py-2.5 rounded text-sm hover:bg-ms-blueDark transition-colors disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          <div className="px-6 py-3 bg-ms-bg border-t border-ms-border text-center">
            <span className="text-xs text-ms-neutralMid">Don't have an account? </span>
            <Link to="/register" className="text-xs text-ms-blue hover:underline font-medium">Create one</Link>
          </div>
        </div>

        <p className="text-center text-[10px] text-ms-neutralLight mt-4">
          Powered by{" "}
          <a href="https://developersinfotech.in" target="_blank" rel="noreferrer" className="hover:underline">
            developersinfotech.in
          </a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.17z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  );
}