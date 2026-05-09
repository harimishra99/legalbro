import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DOC_TYPES } from "../lib/docTypes";

const ALL_DOCS = Object.values(DOC_TYPES).flat();

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080B14] pt-[60px] overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-[calc(100vh-60px)] flex flex-col items-center justify-center text-center px-4 py-20">
        {/* Mesh grid background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Soft radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(201,168,76,0.06) 0%, transparent 70%)",
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-[11px] text-amber-400 uppercase tracking-widest font-semibold mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          AI-Powered Legal Intelligence
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-100 leading-[1.08] max-w-4xl mb-6"
        >
          Draft Legal Documents{" "}
          <br className="hidden sm:block" />
          in Seconds with{" "}
          <span className="text-amber-400">AI</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="text-base sm:text-lg text-stone-400 max-w-xl leading-relaxed mb-10 font-light"
        >
          Professional NDAs, MOUs, Rent Agreements &amp; more — generated
          instantly with law-firm precision.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate("/draft")}
            className="bg-amber-500 text-[#080B14] font-semibold px-7 py-3 rounded text-sm hover:bg-amber-400 transition-all hover:-translate-y-0.5"
          >
            Get Started Free →
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="border border-[#3A4560] text-stone-300 font-medium px-7 py-3 rounded text-sm hover:border-amber-600 hover:text-amber-300 transition-colors"
          >
            View Dashboard
          </button>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="mt-8 inline-flex items-center gap-2 text-[10px] text-amber-600 border border-amber-600/20 bg-amber-600/5 px-3 py-1.5 rounded-full"
        >
          ✦ Powered by Claude AI
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[9px] text-stone-600 uppercase tracking-widest">scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-stone-600 to-transparent" />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-[#2A3450] bg-[#161D2E]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#2A3450] py-1">
          {[
            { num: "20+", label: "Document Types" },
            { num: "<30s", label: "Generation Time" },
            { num: "100%", label: "AI Structured" },
            { num: "Free", label: "To Get Started" },
          ].map((s) => (
            <div key={s.label} className="text-center py-6 px-4">
              <div className="font-serif text-3xl text-amber-300 font-bold">{s.num}</div>
              <div className="text-[10px] text-stone-500 uppercase tracking-wider mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold mb-3">
            Why Legal Bro
          </p>
          <h2 className="font-serif text-4xl text-stone-100 mb-4 leading-tight">
            Built for the modern
            <br />
            legal professional
          </h2>
          <p className="text-stone-400 text-base max-w-md leading-relaxed mb-12">
            Whether you're a startup, freelancer, or enterprise — get
            AI-generated, legally structured documents in seconds.
          </p>

          <div className="border border-[#2A3450] rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#2A3450]">
            {[
              {
                icon: "🤖",
                title: "AI Powered",
                body: "Claude AI generates documents with precise legal language, numbered clauses, and proper signature blocks — not templates.",
              },
              {
                icon: "⚖️",
                title: "Legally Structured",
                body: "Every document follows professional legal formatting with jurisdiction-specific clauses, definitions, and binding terms.",
              },
              {
                icon: "⬇️",
                title: "Instant Download",
                body: "Copy to clipboard or download as PDF instantly. Save to your dashboard and access your documents anytime.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[#161D2E] p-8 hover:bg-[#1C243A] transition-colors"
              >
                <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-xl mb-5">
                  {f.icon}
                </div>
                <h3 className="font-serif text-lg text-stone-100 mb-2">{f.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4 bg-[#161D2E] border-y border-[#2A3450]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold mb-3">
            How It Works
          </p>
          <h2 className="font-serif text-4xl text-stone-100 mb-12">
            Three steps to your document
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Document Type",
                body: "Pick from 20+ legal document types across Core Legal, Business & Corporate, and Employment & HR categories.",
              },
              {
                step: "02",
                title: "Fill in Details",
                body: "Enter the relevant party names, dates, amounts, and other specifics required for your document.",
              },
              {
                step: "03",
                title: "Download & Sign",
                body: "Get your AI-drafted document instantly. Copy, save, or download as a PDF ready for review and signing.",
              },
            ].map((s) => (
              <div key={s.step} className="text-left">
                <div className="font-serif text-5xl text-amber-500/20 font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="font-serif text-lg text-stone-100 mb-2">{s.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCUMENT TYPES ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold mb-3">
            Document Library
          </p>
          <h2 className="font-serif text-4xl text-stone-100 mb-8">
            20+ legal document types
          </h2>

          {Object.entries(DOC_TYPES).map(([cat, docs]) => (
            <div key={cat} className="mb-8">
              <h4 className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold mb-3">
                {cat}
              </h4>
              <div className="flex flex-wrap gap-2">
                {docs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigate("/draft")}
                    className="bg-[#161D2E] border border-[#2A3450] rounded-full px-4 py-1.5 text-sm text-stone-400 hover:border-amber-600 hover:text-amber-300 transition-colors"
                  >
                    {d.icon} {d.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-28 px-4 text-center relative overflow-hidden border-t border-[#2A3450]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)",
          }}
        />
        <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold mb-4 relative">
          Get Started
        </p>
        <h2 className="font-serif text-5xl text-stone-100 mb-4 relative leading-tight">
          Ready to draft your
          <br />
          first document?
        </h2>
        <p className="text-stone-400 mb-8 relative">
          No credit card required. Generate your first document free.
        </p>
        <button
          onClick={() => navigate("/draft")}
          className="relative bg-amber-500 text-[#080B14] font-semibold px-8 py-3.5 rounded text-sm hover:bg-amber-400 transition-all hover:-translate-y-0.5"
        >
          Start Drafting Now →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0D1220] border-t border-[#2A3450] py-8 text-center">
        <div className="font-serif text-lg text-amber-300 mb-2">⚖ Legal Bro</div>
        <p className="text-xs text-stone-600">
          AI-Powered Legal Document Drafter · © {new Date().getFullYear()} Legal Bro · All rights reserved
        </p>
        <p className="text-[10px] text-stone-700 mt-1">
          Documents are AI-generated and should be reviewed by a qualified legal professional.
        </p>
      </footer>
    </div>
  );
}
