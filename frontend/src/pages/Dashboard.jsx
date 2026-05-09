import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { useAuth } from "../components/AuthContext";

function getSavedDocs() {
  return JSON.parse(localStorage.getItem("lb_docs") || "[]");
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState(getSavedDocs());
  const [viewDoc, setViewDoc] = useState(null);

  const handleDelete = (id) => {
    const updated = docs.filter((d) => d.id !== id);
    setDocs(updated);
    localStorage.setItem("lb_docs", JSON.stringify(updated));
    toast.success("Document deleted");
  };

  const handlePDF = (doc) => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    pdf.setFont("helvetica");
    pdf.setFontSize(10);
    const margin = 20;
    const usable = pdf.internal.pageSize.getWidth() - margin * 2;
    const lines = pdf.splitTextToSize(doc.text, usable);
    let y = margin;
    lines.forEach((line) => {
      if (y > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); y = margin; }
      pdf.text(line, margin, y); y += 5;
    });
    pdf.save(`${doc.docTypeName}_LegalBro.pdf`);
    toast.success("PDF downloaded!");
  };

  const byType = {};
  docs.forEach((d) => { byType[d.docTypeName] = (byType[d.docTypeName] || 0) + 1; });
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
  const today = new Date().toISOString().split("T")[0];
  const rateData = JSON.parse(localStorage.getItem("lb_rate") || "{}");
  const remaining = 10 - (rateData[today] || 0);

  const stats = [
    { num: docs.length, label: "Total Documents" },
    { num: Object.keys(byType).length, label: "Document Types" },
    { num: topType ? topType[0] : "—", label: "Most Used" },
    { num: remaining, label: "Drafts Left Today" },
  ];

  return (
    <div className="min-h-screen bg-[#080B14] pt-[60px]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-[10px] text-amber-500 uppercase tracking-widest font-semibold mb-1">
              My Documents
            </p>
            <h1 className="font-serif text-3xl text-stone-100">Document Dashboard</h1>
            <p className="text-sm text-stone-400 mt-1">All your generated legal documents</p>
          </div>
          <button
            onClick={() => navigate("/draft")}
            className="bg-amber-500 text-[#080B14] font-semibold text-sm px-5 py-2.5 rounded hover:bg-amber-400 transition-colors"
          >
            + Draft New
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[#161D2E] border border-[#2A3450] rounded-xl p-4"
            >
              <div className="font-serif text-2xl text-amber-300 font-bold">{s.num}</div>
              <div className="text-[10px] text-stone-500 uppercase tracking-wider mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#161D2E] border border-[#2A3450] rounded-2xl overflow-hidden">
          <div className="bg-[#1C243A] grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-3 text-[10px] text-stone-500 uppercase tracking-wider border-b border-[#2A3450]">
            <div>Document</div>
            <div>Type</div>
            <div>Date</div>
            <div>Actions</div>
          </div>

          {docs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="font-serif text-xl text-stone-400 mb-2">No documents yet</p>
              <p className="text-sm text-stone-600 mb-6">
                Draft your first legal document to see it here.
              </p>
              <button
                onClick={() => navigate("/draft")}
                className="bg-amber-500 text-[#080B14] font-semibold text-sm px-5 py-2.5 rounded hover:bg-amber-400 transition-colors"
              >
                + Draft Now
              </button>
            </div>
          ) : (
            docs.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center border-b border-[#2A3450] last:border-0 hover:bg-[#1C243A] transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-stone-200">
                    {doc.docIcon} {doc.docTypeName}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">{doc.desc}</div>
                </div>
                <div className="text-xs text-stone-400">{doc.docTypeName}</div>
                <div className="text-xs text-stone-500">
                  {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewDoc(doc)}
                    className="text-[11px] border border-[#3A4560] text-stone-400 px-3 py-1 rounded hover:border-amber-600 hover:text-amber-300 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handlePDF(doc)}
                    className="text-[11px] border border-[#3A4560] text-stone-400 px-3 py-1 rounded hover:border-amber-600 hover:text-amber-300 transition-colors"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-[11px] text-stone-600 px-2 py-1 rounded hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {viewDoc && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setViewDoc(null)}
        >
          <div className="bg-[#161D2E] border border-[#2A3450] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A3450]">
              <h3 className="font-serif text-lg text-stone-100">
                {viewDoc.docIcon} {viewDoc.docTypeName}
              </h3>
              <button
                onClick={() => setViewDoc(null)}
                className="text-stone-500 hover:text-stone-200 transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            <pre className="p-6 text-sm leading-relaxed text-stone-300 whitespace-pre-wrap overflow-auto font-sans">
              {viewDoc.text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
