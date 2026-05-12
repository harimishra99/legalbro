import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchCompanyProfile, saveCompanyProfile } from "../lib/api";
import { useAuth } from "../components/AuthContext";

const LS_KEY = "lb_company_profile";

// Always read from localStorage as fallback for non-logged-in use
export function getCompanyProfile() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); }
  catch { return null; }
}

const EMPTY = {
  name:"", tagline:"", cin:"", gstin:"", pan:"",
  address:"", email:"", phone:"", website:"", logo_base64: null,
};

// ── Field components — defined OUTSIDE to prevent focus loss ─────────────────

function TextField({ label, id, value, placeholder, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ms-neutralMid uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        placeholder={placeholder}
        onChange={e => onChange(id, e.target.value)}
        className="w-full border border-ms-border rounded px-3 py-2 text-sm text-ms-neutral placeholder-ms-neutralLight focus:outline-none focus:border-ms-blue focus:ring-1 focus:ring-ms-blue bg-white transition"
      />
    </div>
  );
}

function TextAreaField({ label, id, value, placeholder, onChange }) {
  return (
    <div className="md:col-span-2">
      <label className="block text-xs font-semibold text-ms-neutralMid uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <textarea
        rows={3}
        value={value || ""}
        placeholder={placeholder}
        onChange={e => onChange(id, e.target.value)}
        className="w-full border border-ms-border rounded px-3 py-2 text-sm text-ms-neutral placeholder-ms-neutralLight focus:outline-none focus:border-ms-blue focus:ring-1 focus:ring-ms-blue bg-white resize-none transition"
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CompanyProfile() {
  const navigate    = useNavigate();
  const fileRef     = useRef(null);
  const { user }    = useAuth();

  const [profile,  setProfile]  = useState(EMPTY);
  const [dragging, setDragging] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);

  // ── Load from DB on mount, fall back to localStorage ─────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      if (user) {
        try {
          const data = await fetchCompanyProfile();
          if (data && data.name) {
            // Map logo_base64 → logo for internal use
            const p = { ...EMPTY, ...data, logo: data.logo_base64 || null };
            setProfile(p);
            localStorage.setItem(LS_KEY, JSON.stringify(p));
          } else {
            // Nothing in DB yet — try localStorage
            const local = getCompanyProfile();
            if (local) setProfile({ ...EMPTY, ...local });
          }
        } catch {
          // API unavailable — use localStorage
          const local = getCompanyProfile();
          if (local) setProfile({ ...EMPTY, ...local });
        }
      } else {
        const local = getCompanyProfile();
        if (local) setProfile({ ...EMPTY, ...local });
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleChange = useCallback((key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleLogoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, SVG)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => setProfile(prev => ({ ...prev, logo: e.target.result, logo_base64: e.target.result }));
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleLogoFile(e.dataTransfer.files[0]);
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      toast.error("Company name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name:       profile.name,
        tagline:    profile.tagline,
        cin:        profile.cin,
        gstin:      profile.gstin,
        pan:        profile.pan,
        address:    profile.address,
        email:      profile.email,
        phone:      profile.phone,
        website:    profile.website,
        logo_base64: profile.logo || profile.logo_base64 || "",
      };

      // Save to localStorage always
      localStorage.setItem(LS_KEY, JSON.stringify({ ...payload, logo: payload.logo_base64 }));

      // Save to DB if logged in
      if (user) {
        await saveCompanyProfile(payload);
        toast.success("Profile saved to your account!");
      } else {
        toast.success("Profile saved locally!");
      }
    } catch (e) {
      // DB failed — at least localStorage worked
      toast.success("Saved locally (sign in to sync to cloud)");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (!confirm("Clear your company profile?")) return;
    localStorage.removeItem(LS_KEY);
    setProfile(EMPTY);
    toast.success("Profile cleared");
  };

  const fields = [
    { id:"name",    label:"Company Name *",    ph:"Acme Pvt. Ltd.",              area:false },
    { id:"tagline", label:"Tagline / Slogan",   ph:"Your trusted legal partner",  area:false },
    { id:"cin",     label:"CIN",                ph:"U72900DL2020PTC123456",       area:false },
    { id:"gstin",   label:"GSTIN",              ph:"07AABCU9603R1ZP",             area:false },
    { id:"pan",     label:"PAN",                ph:"AABCU9603R",                  area:false },
    { id:"phone",   label:"Phone",              ph:"+91 98765 43210",             area:false },
    { id:"email",   label:"Email",              ph:"legal@company.com",           area:false },
    { id:"website", label:"Website",            ph:"www.company.com",             area:false },
    { id:"address", label:"Registered Address", ph:"123, Business Park, New Delhi – 110001", area:true },
  ];

  if (loading) return (
    <div className="min-h-screen bg-ms-bg pt-12 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ms-border border-t-ms-blue rounded-full animate-spin" />
    </div>
  );

  const logo = profile.logo || profile.logo_base64 || null;

  return (
    <div className="min-h-screen bg-ms-bg pt-[48px] pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-ms-neutralDark">Company Profile</h1>
            <p className="text-sm text-ms-neutralMid mt-1">
              {user
                ? "Saved to your account — available on all devices"
                : "Sign in to sync across devices"}
            </p>
          </div>
          <button onClick={() => navigate("/draft")} className="text-sm text-ms-blue hover:underline">
            ← Back to Draft
          </button>
        </div>

        {/* Not logged in warning */}
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm text-amber-800">
            ⚠ You're not signed in. Profile will be saved locally only.{" "}
            <button onClick={() => navigate("/login")} className="underline font-medium">Sign in</button> to sync to cloud.
          </div>
        )}

        {/* Live preview */}
        {profile.name && (
          <div className="bg-ms-blueLight border border-ms-blueMid rounded-lg px-4 py-3 mb-6 flex items-center gap-3">
            {logo && <img src={logo} alt="logo" className="h-10 w-auto object-contain" />}
            <div>
              <div className="font-semibold text-ms-neutralDark text-sm">{profile.name}</div>
              {profile.tagline && <div className="text-xs text-ms-neutralMid">{profile.tagline}</div>}
            </div>
            <span className="ml-auto text-[10px] text-ms-blue bg-white border border-ms-blueMid px-2 py-0.5 rounded-full font-medium">
              Live Preview
            </span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-ms border border-ms-border overflow-hidden">

          {/* Logo upload */}
          <div className="p-6 border-b border-ms-border">
            <div className="text-xs font-semibold text-ms-neutralMid uppercase tracking-wider mb-3">
              Company Logo
            </div>
            <div className="flex items-start gap-6">
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                className={`w-40 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all text-center px-2
                  ${dragging ? "border-ms-blue bg-ms-blueLight" : "border-ms-borderMid hover:border-ms-blue hover:bg-ms-blueLight"}`}
              >
                {logo ? (
                  <img src={logo} alt="logo" className="max-h-20 max-w-full object-contain rounded" />
                ) : (
                  <>
                    <span className="text-2xl mb-1">🏢</span>
                    <span className="text-[10px] text-ms-neutralMid leading-tight">
                      Drop logo here<br />or click to upload
                    </span>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleLogoFile(e.target.files[0])} />
              <div className="flex-1">
                <p className="text-sm text-ms-neutralMid leading-relaxed">
                  Upload your company logo. Appears on every document letterhead.
                </p>
                <p className="text-xs text-ms-neutralLight mt-2">PNG, JPG or SVG · Max 2 MB</p>
                {logo && (
                  <button
                    onClick={() => setProfile(p => ({ ...p, logo: null, logo_base64: "" }))}
                    className="mt-3 text-xs text-ms-red hover:underline"
                  >
                    Remove logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="p-6">
            <div className="text-xs font-semibold text-ms-neutralMid uppercase tracking-wider mb-4">
              Company Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(f =>
                f.area ? (
                  <TextAreaField key={f.id} id={f.id} label={f.label}
                    value={profile[f.id]} placeholder={f.ph} onChange={handleChange} />
                ) : (
                  <TextField key={f.id} id={f.id} label={f.label}
                    value={profile[f.id]} placeholder={f.ph} onChange={handleChange} />
                )
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-ms-bg border-t border-ms-border flex items-center justify-between">
            <button onClick={handleClear} className="text-sm text-ms-neutralMid hover:text-ms-red transition-colors">
              Clear Profile
            </button>
            <div className="flex gap-3">
              <button onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm border border-ms-border rounded text-ms-neutral hover:bg-ms-hover transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 text-sm bg-ms-blue text-white rounded hover:bg-ms-blueDark transition-colors font-medium disabled:opacity-60">
                {saving ? "Saving..." : user ? "Save to Account" : "Save Locally"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white border border-ms-border rounded-lg px-4 py-3">
          <div className="text-xs font-semibold text-ms-neutralMid uppercase tracking-wider mb-2">How it works</div>
          <ul className="text-xs text-ms-neutralMid space-y-1.5">
            <li>✓ Logo and company name appear on every generated document letterhead</li>
            <li>✓ CIN, GSTIN and address in document footer on each page</li>
            <li>✓ Saved to your account — works across all devices when signed in</li>
            <li>✓ "Powered by developersinfotech.in" credit at bottom of every PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}