import { useNavigate } from "react-router-dom";
import { DOC_TYPES } from "../lib/docTypes";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-ms-bg pt-12">

      {/* Hero */}
      <section className="bg-ms-blue text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-xs font-medium mb-6 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
            AI-Powered · Instant · Professional
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Draft Legal Documents<br />in Seconds with AI
          </h1>
          <p className="text-white/80 text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Professional NDAs, MOUs, Rent Agreements &amp; more — generated instantly with law-firm precision. Your company letterhead, every time.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate("/draft")}
              className="bg-white text-ms-blue font-semibold px-6 py-2.5 rounded hover:bg-ms-blueLight transition-colors text-sm"
            >
              Get Started Free →
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white/10 border border-white/30 text-white font-medium px-6 py-2.5 rounded hover:bg-white/20 transition-colors text-sm"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-ms-border">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-ms-border">
          {[
            { num: "20+",   label: "Document Types"   },
            { num: "<30s",  label: "Generation Time"  },
            { num: "100%",  label: "AI Structured"    },
            { num: "Free",  label: "To Get Started"   },
          ].map(s => (
            <div key={s.label} className="text-center py-6 px-4">
              <div className="text-2xl font-bold text-ms-blue">{s.num}</div>
              <div className="text-xs text-ms-neutralMid mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-ms-blue uppercase tracking-widest mb-2">Why Legal Bro</p>
          <h2 className="text-2xl font-bold text-ms-neutralDark mb-8">Built for modern professionals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon:"🤖", title:"AI Powered",        body:"Claude & Groq AI generate documents with precise legal language, numbered clauses, and proper signature blocks." },
              { icon:"⚖️", title:"Legally Structured", body:"Every document follows professional legal formatting with jurisdiction-specific clauses and binding terms." },
              { icon:"🏢", title:"Your Letterhead",    body:"Upload your company logo and details once. Every generated PDF carries your professional letterhead automatically." },
            ].map(f => (
              <div key={f.title} className="bg-white border border-ms-border rounded-lg p-5 shadow-ms-sm hover:shadow-ms transition-shadow">
                <div className="w-10 h-10 bg-ms-blueLight rounded-lg flex items-center justify-center text-xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-ms-neutralDark mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-ms-neutralMid leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white border-y border-ms-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-ms-blue uppercase tracking-widest mb-2">How It Works</p>
          <h2 className="text-2xl font-bold text-ms-neutralDark mb-8">Three steps to your document</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { n:"01", title:"Choose Document Type",  body:"Pick from 20+ legal document types. Click once and the form appears immediately below." },
              { n:"02", title:"Fill in Details",       body:"Enter party names, dates, amounts. The AI uses your company profile automatically." },
              { n:"03", title:"Download with Letterhead", body:"Get your AI-drafted PDF with your company letterhead on every page, ready to sign." },
            ].map(s => (
              <div key={s.n} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-ms-blue text-white flex items-center justify-center text-sm font-bold shrink-0">{s.n}</div>
                <div>
                  <h3 className="font-semibold text-ms-neutralDark mb-1 text-sm">{s.title}</h3>
                  <p className="text-xs text-ms-neutralMid leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Document types */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-ms-blue uppercase tracking-widest mb-2">Document Library</p>
          <h2 className="text-2xl font-bold text-ms-neutralDark mb-6">20+ legal document types</h2>
          {Object.entries(DOC_TYPES).map(([cat, docs]) => (
            <div key={cat} className="mb-6">
              <h4 className="text-xs font-semibold text-ms-neutralMid uppercase tracking-widest mb-2">{cat}</h4>
              <div className="flex flex-wrap gap-2">
                {docs.map(d => (
                  <button
                    key={d.id}
                    onClick={() => navigate("/draft")}
                    className="bg-white border border-ms-border rounded px-3 py-1.5 text-xs text-ms-neutral hover:border-ms-blue hover:text-ms-blue hover:bg-ms-blueLight transition-colors"
                  >
                    {d.icon} {d.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-ms-blue text-white text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to draft your first document?</h2>
        <p className="text-white/70 mb-6 text-sm">No credit card required. Generate your first document free.</p>
        <button
          onClick={() => navigate("/draft")}
          className="bg-white text-ms-blue font-semibold px-7 py-3 rounded hover:bg-ms-blueLight transition-colors text-sm"
        >
          Start Drafting Now →
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-ms-neutralDark text-white py-8 px-4 text-center">
        <div className="text-base font-semibold mb-1">⚖ Legal Bro</div>
        <p className="text-xs text-white/50 mb-1">
          AI-Powered Legal Document Drafter · © {new Date().getFullYear()} Legal Bro
        </p>
        <p className="text-xs text-white/30">
          Powered by{" "}
          <a href="https://developersinfotech.in" target="_blank" rel="noreferrer" className="underline hover:text-white/60">
            developersinfotech.in
          </a>
        </p>
      </footer>
    </div>
  );
}