import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { generatePDF } from "../lib/pdfGenerator";
import { DOC_TYPES } from "../lib/docTypes";
import { generateDocument } from "../lib/api";
import { getCompanyProfile } from "./CompanyProfile";
import { useNavigate } from "react-router-dom";

const DAILY_LIMIT = 10;

function getRateCount() {
  const key  = new Date().toISOString().split("T")[0];
  const data = JSON.parse(localStorage.getItem("lb_rate") || "{}");
  return data[key] || 0;
}
function incrementRate() {
  const key  = new Date().toISOString().split("T")[0];
  const data = JSON.parse(localStorage.getItem("lb_rate") || "{}");
  data[key]  = (data[key] || 0) + 1;
  localStorage.setItem("lb_rate", JSON.stringify(data));
}
function getSavedDocs() {
  return JSON.parse(localStorage.getItem("lb_docs") || "[]");
}
function saveDocLocal(doc) {
  const docs = getSavedDocs();
  docs.unshift(doc);
  localStorage.setItem("lb_docs", JSON.stringify(docs));
}

// ── PDF generator with letterhead ─────────────────────────────────────────────
function downloadDocAsPDF(text, docTypeName, profile) {
  const doc    = new jsPDF({ unit: "mm", format: "a4" });
  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const margin = 20;
  const usable = pageW - margin * 2;

  const addLetterhead = (pageNum) => {
    // ── Top letterhead ──
    doc.setFillColor(0, 120, 212); // ms-blue
    doc.rect(0, 0, pageW, 18, "F");

    // Company name in header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    const compName = profile?.name || "Legal Bro";
    doc.text(compName, margin, 11);

    // Tagline right side
    if (profile?.tagline) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(220, 235, 248);
      doc.text(profile.tagline, pageW - margin, 11, { align: "right" });
    }

    // Logo placeholder text right (real logo needs canvas, skip for simplicity)
    // ── Thin blue rule below header ──
    doc.setDrawColor(0, 120, 212);
    doc.setLineWidth(0.3);
    doc.line(margin, 20, pageW - margin, 20);

    // ── Footer ──
    doc.setDrawColor(200, 198, 196);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 14, pageW - margin, pageH - 14);

    // Footer left — company details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(96, 94, 92);
    const footerParts = [];
    if (profile?.gstin)   footerParts.push(`GSTIN: ${profile.gstin}`);
    if (profile?.cin)     footerParts.push(`CIN: ${profile.cin}`);
    if (profile?.address) footerParts.push(profile.address.replace(/\n/g, ", "));
    const footerLeft = footerParts.join("  |  ").slice(0, 90);
    doc.text(footerLeft || " ", margin, pageH - 9);

    // Footer right — powered by + page number
    doc.setFontSize(6);
    doc.setTextColor(161, 159, 157);
    doc.text(`Powered by developersinfotech.in`, margin, pageH - 5);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 5, { align: "right" });
  };

  // ── Content rendering ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(32, 31, 30);

  const lines    = doc.splitTextToSize(text, usable);
  let y          = 26;   // start below letterhead
  const lineH    = 5;
  const bottomY  = pageH - 18;
  let pageNum    = 1;

  addLetterhead(pageNum);

  lines.forEach((line) => {
    if (y + lineH > bottomY) {
      doc.addPage();
      pageNum++;
      addLetterhead(pageNum);
      y = 26;
    }
    // Bold lines that look like headings (ALL CAPS + colon or short)
    const isHeading = /^[A-Z\s\d]+:/.test(line) || (line === line.toUpperCase() && line.trim().length > 2 && line.trim().length < 60);
    doc.setFont("helvetica", isHeading ? "bold" : "normal");
    doc.setFontSize(isHeading ? 9 : 9.5);
    doc.text(line, margin, y);
    y += isHeading ? lineH + 1 : lineH;
  });

  doc.save(`${docTypeName}_${profile?.name || "LegalBro"}.pdf`);
}

const fadeSlide = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.18 } },
};

export default function Draft() {
  const navigate    = useNavigate();
  const [step, setStep]             = useState(1);
  const [selected, setSelected]     = useState(null);
  const [formValues, setFormValues] = useState({});
  const [generated, setGenerated]   = useState("");
  const [loading, setLoading]       = useState(false);
  const [rateCount, setRateCount]   = useState(getRateCount());
  const profile                     = getCompanyProfile();

  const ALL_DOCS = Object.values(DOC_TYPES).flat();

  // ── Step 1: select doc type — once clicked all others collapse ──
  const handleSelect = (doc) => {
    setSelected(doc);
    // small delay so animation feels natural
    setTimeout(() => setStep(2), 280);
  };

  const handleGenerate = async () => {
    if (rateCount >= DAILY_LIMIT) {
      toast.error("Daily limit reached (10/10). Try again tomorrow.");
      return;
    }
    const missing = selected.fields.filter(f => !formValues[f.id]?.trim());
    if (missing.length) {
      toast.error(`Please fill: ${missing.map(f => f.label).join(", ")}`);
      return;
    }
    setLoading(true);
    setStep(3);
    setGenerated("");
    try {
      let text;
      try {
        const res = await generateDocument({
          doc_type:       selected.id,
          doc_type_label: selected.desc,
          fields:         formValues,
        });
        text = res.generated_text;
      } catch {
        const prompt  = buildPrompt(selected, formValues, profile);
        const groqKey = import.meta.env.VITE_GROQ_API_KEY || "";
        if (!groqKey) throw new Error("No backend and no VITE_GROQ_API_KEY set.");
        const res  = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method:  "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
          body:    JSON.stringify({
            model:       "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens:  2500,
            messages:    [{ role: "user", content: prompt }],
          }),
        });
        const data = await res.json();
        text = data.choices?.[0]?.message?.content || "Error generating document.";
      }
      setGenerated(text);
      incrementRate();
      setRateCount(getRateCount());
    } catch (e) {
      toast.error("Generation failed: " + e.message);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!generated || !selected) return;
    saveDocLocal({
      id: Date.now().toString(),
      docType:     selected.id,
      docTypeName: selected.name,
      docIcon:     selected.icon,
      desc:        selected.desc,
      text:        generated,
      createdAt:   new Date().toISOString(),
    });
    toast.success("Saved to dashboard!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    toast.success("Copied to clipboard!");
  };

  const handlePDF = async () => {
    try {
      await generatePDF(generated, selected?.name || "Document", profile);
      toast.success("PDF downloaded!");
    } catch(e) {
      toast.error("PDF failed: " + e.message);
    }
  };

  const resetAll = () => {
    setStep(1); setSelected(null); setFormValues({}); setGenerated("");
  };

  // ── Step indicators ──
  const steps = [
    { n: 1, label: "Select Type"   },
    { n: 2, label: "Fill Details"  },
    { n: 3, label: "Your Document" },
  ];

  return (
    <div className="min-h-screen bg-ms-bg pt-12 pb-16">
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-ms-neutralDark">AI Document Drafter</h1>
          <p className="text-sm text-ms-neutralMid mt-0.5">
            Select a document type, fill in details, and get a professional draft instantly.
          </p>
        </div>

        {/* Company profile nudge */}
        {!profile && (
          <div
            onClick={() => navigate("/profile")}
            className="cursor-pointer mb-5 bg-ms-blueLight border border-ms-blueMid rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-ms-blueMid/40 transition-colors"
          >
            <span className="text-xl">🏢</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-ms-blue">Set up your Company Profile</div>
              <div className="text-xs text-ms-neutralMid">Add your logo &amp; details to get professional letterhead on every document</div>
            </div>
            <svg className="w-4 h-4 text-ms-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        )}

        {/* Progress steps */}
        <div className="flex items-center mb-6">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                  step > s.n  ? "bg-ms-green border-ms-green text-white"
                  : step===s.n? "bg-ms-blue border-ms-blue text-white"
                  :             "bg-white border-ms-borderMid text-ms-neutralLight"
                }`}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <span className={`text-[10px] mt-1 font-medium hidden sm:block ${step===s.n?"text-ms-blue":"text-ms-neutralLight"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${step > s.n ? "bg-ms-green" : "bg-ms-border"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Smart doc type selector ── */}
          {step === 1 && (
            <motion.div key="step1" variants={fadeSlide} initial="hidden" animate="visible" exit="exit">
              <div className="bg-white border border-ms-border rounded-lg shadow-ms-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-ms-border bg-ms-bg">
                  <p className="text-xs font-semibold text-ms-neutralMid uppercase tracking-wider">
                    Choose a document type
                  </p>
                </div>
                <div className="p-4">
                  {Object.entries(DOC_TYPES).map(([cat, docs]) => (
                    <div key={cat} className="mb-5 last:mb-0">
                      <div className="text-[10px] font-semibold text-ms-neutralMid uppercase tracking-widest mb-2 px-1">
                        {cat}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {docs.map(doc => (
                          <motion.button
                            key={doc.id}
                            onClick={() => handleSelect(doc)}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-3 px-3 py-2.5 border border-ms-border rounded-lg text-left hover:border-ms-blue hover:bg-ms-blueLight transition-all group"
                          >
                            <span className="text-xl shrink-0">{doc.icon}</span>
                            <div>
                              <div className="text-xs font-semibold text-ms-neutralDark group-hover:text-ms-blue leading-tight">
                                {doc.name}
                              </div>
                              <div className="text-[10px] text-ms-neutralLight leading-tight mt-0.5 hidden sm:block">
                                {doc.desc}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Form ── */}
          {step === 2 && selected && (
            <motion.div key="step2" variants={fadeSlide} initial="hidden" animate="visible" exit="exit">
              <div className="bg-white border border-ms-border rounded-lg shadow-ms-sm overflow-hidden">
                {/* Selected doc header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-ms-border bg-ms-blueLight">
                  <span className="text-2xl">{selected.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-ms-neutralDark">{selected.name}</div>
                    <div className="text-xs text-ms-neutralMid">{selected.desc}</div>
                  </div>
                  <button
                    onClick={() => { setStep(1); setSelected(null); setFormValues({}); }}
                    className="ml-auto text-xs text-ms-blue hover:underline"
                  >
                    Change ✕
                  </button>
                </div>

                {/* Fields */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selected.fields.map(f => (
                      <div key={f.id} className={f.full ? "sm:col-span-2" : ""}>
                        <label className="block text-xs font-semibold text-ms-neutralMid uppercase tracking-wider mb-1.5">
                          {f.label}
                        </label>
                        {f.full && f.ph?.length > 30 ? (
                          <textarea
                            rows={3}
                            placeholder={f.ph}
                            value={formValues[f.id] || ""}
                            onChange={e => setFormValues(v => ({ ...v, [f.id]: e.target.value }))}
                            className="w-full border border-ms-border rounded px-3 py-2 text-sm text-ms-neutral placeholder-ms-neutralLight focus:outline-none focus:border-ms-blue focus:ring-1 focus:ring-ms-blue transition resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder={f.ph}
                            value={formValues[f.id] || ""}
                            onChange={e => setFormValues(v => ({ ...v, [f.id]: e.target.value }))}
                            className="w-full border border-ms-border rounded px-3 py-2 text-sm text-ms-neutral placeholder-ms-neutralLight focus:outline-none focus:border-ms-blue focus:ring-1 focus:ring-ms-blue transition"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer actions */}
                <div className="px-5 py-3 bg-ms-bg border-t border-ms-border flex items-center justify-between">
                  <span className="text-xs text-ms-neutralLight bg-white border border-ms-border px-3 py-1 rounded-full">
                    ⏱ {DAILY_LIMIT - rateCount}/{DAILY_LIMIT} drafts left today
                  </span>
                  <button
                    onClick={handleGenerate}
                    disabled={rateCount >= DAILY_LIMIT}
                    className="flex items-center gap-2 bg-ms-blue text-white text-sm font-medium px-5 py-2 rounded hover:bg-ms-blueDark transition-colors disabled:opacity-40"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Generate Document
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Output ── */}
          {step === 3 && (
            <motion.div key="step3" variants={fadeSlide} initial="hidden" animate="visible" exit="exit">
              <div className="bg-white border border-ms-border rounded-lg shadow-ms overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-ms-bg border-b border-ms-border flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{selected?.icon}</span>
                    <span className="text-sm font-semibold text-ms-neutralDark">{selected?.name}</span>
                    <span className="text-[10px] bg-ms-blueLight text-ms-blue border border-ms-blueMid px-2 py-0.5 rounded-full font-medium">
                      AI Generated
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { label: "📋 Copy",  fn: handleCopy },
                      { label: "⬇ PDF",   fn: handlePDF  },
                      { label: "💾 Save",  fn: handleSave },
                    ].map(b => (
                      <button
                        key={b.label}
                        onClick={b.fn}
                        className="border border-ms-border text-ms-neutral text-xs px-3 py-1.5 rounded hover:border-ms-blue hover:text-ms-blue hover:bg-ms-blueLight transition-colors"
                      >
                        {b.label}
                      </button>
                    ))}
                    <button
                      onClick={resetAll}
                      className="bg-ms-blue text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-ms-blueDark transition-colors"
                    >
                      + New
                    </button>
                  </div>
                </div>

                {/* Letterhead preview bar */}
                {profile?.name && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-[#0078D4] text-white text-xs">
                    {profile.logo && (
                      <img src={profile.logo} alt="logo" className="h-5 w-auto object-contain brightness-0 invert" />
                    )}
                    <span className="font-semibold">{profile.name}</span>
                    {profile.tagline && <span className="text-white/70 text-[10px]">· {profile.tagline}</span>}
                    <span className="ml-auto text-white/50 text-[10px]">Letterhead applied to PDF</span>
                  </div>
                )}

                {/* Content */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-2 border-ms-border border-t-ms-blue rounded-full animate-spin" />
                    <div className="text-sm text-ms-neutralMid">Generating your document...</div>
                  </div>
                ) : (
                  <pre className="p-5 text-sm leading-relaxed text-ms-neutral whitespace-pre-wrap overflow-auto max-h-[560px] font-sans">
                    {generated}
                  </pre>
                )}

                {/* Bottom credit */}
                <div className="px-4 py-2 bg-ms-bg border-t border-ms-border flex items-center justify-between">
                  <span className="text-[10px] text-ms-neutralLight">
                    Powered by{" "}
                    <a href="https://developersinfotech.in" target="_blank" rel="noreferrer"
                      className="text-ms-blue hover:underline">
                      developersinfotech.in
                    </a>
                  </span>
                  <button onClick={() => setStep(2)} className="text-xs text-ms-blue hover:underline">
                    ← Edit Details
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function buildPrompt(docType, fields, profile) {
  const fieldLines = docType.fields
    .map(f => `  ${f.label}: ${fields[f.id] || ""}`)
    .join("\n");
  const companyCtx = profile?.name
    ? `\nPrepared by: ${profile.name}${profile.address ? `, ${profile.address}` : ""}${profile.gstin ? `, GSTIN: ${profile.gstin}` : ""}${profile.cin ? `, CIN: ${profile.cin}` : ""}.`
    : "";

  return `You are a senior Indian legal document drafter. Draft a complete, professional, ready-to-sign ${docType.name} using these details:

${fieldLines}${companyCtx}

STRICT FORMATTING RULES — follow exactly:
1. Major section headings MUST be written in ALL CAPS on their own line, e.g.:
   RECITALS
   CLAUSE 1: DEFINITIONS
   CLAUSE 2: OBLIGATIONS OF THE PARTIES
   GOVERNING LAW AND JURISDICTION
   DISPUTE RESOLUTION
   MISCELLANEOUS
   IN WITNESS WHEREOF

2. Sub-clauses use numbered format on their own line, e.g.:
   1.1 "Confidential Information" means...
   1.2 "Disclosing Party" means...

3. List items use: a) b) c) format

4. Leave a blank line between each clause and section.

5. Signature block at end — each item on its own line:
   For [Party Name]:
   Signature:
   Name:
   Designation:
   Date:
   Place:
   Witness 1:
   Witness 2:

6. Do NOT use markdown (no **, no #, no ---). Plain text only.
7. Write 800-1100 words. Every clause must be complete and legally binding.

Output ONLY the document. No commentary, no preamble.`;
}