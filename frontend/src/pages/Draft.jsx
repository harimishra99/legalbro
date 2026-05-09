import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { DOC_TYPES } from "../lib/docTypes";
import { generateDocument } from "../lib/api";

const DAILY_LIMIT = 10;

function getRateCount() {
  const key = new Date().toISOString().split("T")[0];
  const data = JSON.parse(localStorage.getItem("lb_rate") || "{}");
  return data[key] || 0;
}
function incrementRate() {
  const key = new Date().toISOString().split("T")[0];
  const data = JSON.parse(localStorage.getItem("lb_rate") || "{}");
  data[key] = (data[key] || 0) + 1;
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

const stepVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function Draft() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateCount, setRateCount] = useState(getRateCount());

  const handleGenerate = async () => {
    if (rateCount >= DAILY_LIMIT) {
      toast.error("Daily limit reached (10/10). Try again tomorrow.");
      return;
    }
    const missing = selected.fields.filter((f) => !formValues[f.id]?.trim());
    if (missing.length) {
      toast.error(`Please fill: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    setLoading(true);
    setStep(3);
    setGenerated("");

    try {
      // Try backend first; fall back to direct Anthropic API call
      let text;
      try {
        const res = await generateDocument({
          doc_type: selected.id,
          doc_type_label: selected.desc,
          fields: formValues,
        });
        text = res.generated_text;
      } catch {
        // Fallback: call Groq directly from browser (dev/demo only)
        const prompt = buildPrompt(selected, formValues);
        const groqKey = import.meta.env.VITE_GROQ_API_KEY || "";
        if (!groqKey) throw new Error("No backend and no VITE_GROQ_API_KEY set.");
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 2500,
            messages: [{ role: "user", content: prompt }],
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
      docType: selected.id,
      docTypeName: selected.name,
      docIcon: selected.icon,
      desc: selected.desc,
      text: generated,
      createdAt: new Date().toISOString(),
    });
    toast.success("Saved to dashboard!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    toast.success("Copied to clipboard!");
  };

  const handlePDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.setFont("helvetica");
    doc.setFontSize(10);
    const margin = 20;
    const usable = doc.internal.pageSize.getWidth() - margin * 2;
    const lines = doc.splitTextToSize(generated, usable);
    let y = margin;
    lines.forEach((line) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 5;
    });
    doc.save(`${selected?.name || "document"}_LegalBro.pdf`);
    toast.success("PDF downloaded!");
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const stepInfo = [
    { n: 1, label: "Select Type" },
    { n: 2, label: "Fill Details" },
    { n: 3, label: "Your Document" },
  ];

  return (
    <div className="min-h-screen bg-[#080B14] pt-[60px]">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs text-amber-500 uppercase tracking-widest font-semibold mb-2">
            AI Document Drafter
          </p>
          <h1 className="font-serif text-3xl text-stone-100 mb-2">
            Draft Your Legal Document
          </h1>
          <p className="text-sm text-stone-400">
            Select a document type, fill in the details, and let AI draft it.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-10 relative">
          <div className="absolute top-4 left-0 right-0 h-px bg-[#2A3450] z-0" />
          {stepInfo.map((s, i) => (
            <div key={s.n} className="flex-1 flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  step > s.n
                    ? "bg-green-700 border-green-700 text-white"
                    : step === s.n
                    ? "bg-amber-500 border-amber-500 text-[#080B14]"
                    : "bg-[#161D2E] border-[#2A3450] text-stone-500"
                }`}
              >
                {step > s.n ? "✓" : s.n}
              </div>
              <span
                className={`text-[10px] mt-1.5 uppercase tracking-wider font-medium ${
                  step === s.n ? "text-amber-400" : "text-stone-600"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {Object.entries(DOC_TYPES).map(([cat, docs]) => (
                <div key={cat} className="mb-8">
                  <h4 className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold mb-3">
                    {cat}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {docs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelected(doc)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selected?.id === doc.id
                            ? "border-amber-500 bg-amber-500/5 shadow-[0_0_0_1px_#C9A84C]"
                            : "border-[#2A3450] bg-[#161D2E] hover:border-amber-600 hover:bg-[#1C243A]"
                        }`}
                      >
                        <span className="text-2xl block mb-2">{doc.icon}</span>
                        <div className="text-sm font-medium text-stone-200 leading-tight">
                          {doc.name}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-1">{doc.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => selected && setStep(2)}
                  disabled={!selected}
                  className="bg-amber-500 text-[#080B14] font-semibold px-6 py-2.5 rounded text-sm disabled:opacity-40 hover:bg-amber-400 transition-colors"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && selected && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <div className="bg-[#161D2E] border border-[#2A3450] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#2A3450]">
                  <span className="text-2xl">{selected.icon}</span>
                  <div>
                    <h3 className="font-serif text-lg text-stone-100">{selected.name}</h3>
                    <p className="text-xs text-stone-400 mt-0.5">{selected.desc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selected.fields.map((f) => (
                    <div
                      key={f.id}
                      className={f.full ? "sm:col-span-2" : ""}
                    >
                      <label className="block text-[10px] text-stone-400 uppercase tracking-wider font-medium mb-1.5">
                        {f.label}
                      </label>
                      {f.full && f.ph.length > 30 ? (
                        <textarea
                          rows={3}
                          placeholder={f.ph}
                          value={formValues[f.id] || ""}
                          onChange={(e) =>
                            setFormValues((v) => ({ ...v, [f.id]: e.target.value }))
                          }
                          className="w-full bg-[#080B14] border border-[#2A3450] rounded px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:border-amber-500 outline-none resize-none transition-colors"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={f.ph}
                          value={formValues[f.id] || ""}
                          onChange={(e) =>
                            setFormValues((v) => ({ ...v, [f.id]: e.target.value }))
                          }
                          className="w-full bg-[#080B14] border border-[#2A3450] rounded px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:border-amber-500 outline-none transition-colors"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#2A3450]">
                  <button
                    onClick={goBack}
                    className="border border-[#3A4560] text-stone-400 text-sm px-4 py-2 rounded hover:border-amber-600 hover:text-amber-300 transition-colors"
                  >
                    ← Back
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-stone-500 bg-[#0D1220] border border-[#2A3450] px-3 py-1.5 rounded-full">
                      ⏱ {DAILY_LIMIT - rateCount}/{DAILY_LIMIT} left today
                    </span>
                    <button
                      onClick={handleGenerate}
                      disabled={rateCount >= DAILY_LIMIT}
                      className="bg-amber-500 text-[#080B14] font-semibold px-5 py-2 rounded text-sm hover:bg-amber-400 transition-colors disabled:opacity-40"
                    >
                      ✦ Generate with AI
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <div className="bg-[#0D1220] border border-[#2A3450] rounded-2xl overflow-hidden">
                {/* Toolbar */}
                <div className="bg-[#161D2E] border-b border-[#2A3450] px-5 py-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-medium px-3 py-1 rounded-full">
                      {selected?.name}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {new Date().toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="border border-[#3A4560] text-stone-300 text-xs px-3 py-1.5 rounded hover:border-amber-600 hover:text-amber-300 transition-colors"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={handlePDF}
                      className="border border-[#3A4560] text-stone-300 text-xs px-3 py-1.5 rounded hover:border-amber-600 hover:text-amber-300 transition-colors"
                    >
                      ⬇ PDF
                    </button>
                    <button
                      onClick={handleSave}
                      className="border border-[#3A4560] text-stone-300 text-xs px-3 py-1.5 rounded hover:border-amber-600 hover:text-amber-300 transition-colors"
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={() => { setStep(1); setSelected(null); setFormValues({}); setGenerated(""); }}
                      className="bg-amber-500 text-[#080B14] text-xs font-semibold px-3 py-1.5 rounded hover:bg-amber-400 transition-colors"
                    >
                      + New
                    </button>
                  </div>
                </div>

                {/* Content */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-2 border-[#2A3450] border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-sm text-stone-400 tracking-wide">
                      AI is drafting your document...
                    </p>
                  </div>
                ) : (
                  <pre className="p-6 text-sm leading-relaxed text-stone-300 whitespace-pre-wrap overflow-auto max-h-[600px] font-sans">
                    {generated}
                  </pre>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-[10px] text-amber-600 border border-amber-600/20 bg-amber-600/5 px-3 py-1.5 rounded-full">
                  ✦ Generated by Claude AI · Legal Bro
                </div>
                <button
                  onClick={goBack}
                  className="text-xs text-stone-500 hover:text-amber-400 transition-colors"
                >
                  ← Edit Details
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function buildPrompt(docType, fields) {
  const fieldLines = docType.fields
    .map((f) => `  ${f.label}: ${fields[f.id] || ""}`)
    .join("\n");
  return `You are a professional legal document drafter. Draft a complete, professional ${docType.name} (${docType.desc}) using these details:\n\n${fieldLines}\n\nRequirements:\n- Proper numbered clause structure (1., 1.1, 1.2)\n- Definitions section\n- Formal legal language appropriate for India\n- All standard clauses for this document type\n- Signature block with parties, date, and witnesses\n- Headings in CAPS e.g. CLAUSE 1: DEFINITIONS\n- Include governing law, jurisdiction, dispute resolution\n- Length: 700-1000 words, complete and ready to sign\n\nOutput ONLY the document text.`;
}