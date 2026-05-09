import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { getCompanyProfile } from "./CompanyProfile";

function getSavedDocs()  { return JSON.parse(localStorage.getItem("lb_docs")  || "[]"); }
function getRateCount()  {
  const key = new Date().toISOString().split("T")[0];
  return JSON.parse(localStorage.getItem("lb_rate") || "{}")[key] || 0;
}

function downloadPDF(doc, profile) {
  const pdf   = new jsPDF({ unit:"mm", format:"a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 20, usable = pageW - margin * 2;

  const addLetterhead = (pageNum) => {
    pdf.setFillColor(0, 120, 212);
    pdf.rect(0, 0, pageW, 18, "F");
    pdf.setFont("helvetica","bold"); pdf.setFontSize(11); pdf.setTextColor(255,255,255);
    pdf.text(profile?.name || "Legal Bro", margin, 11);
    if (profile?.tagline) {
      pdf.setFont("helvetica","normal"); pdf.setFontSize(7); pdf.setTextColor(220,235,248);
      pdf.text(profile.tagline, pageW - margin, 11, { align:"right" });
    }
    pdf.setDrawColor(0,120,212); pdf.setLineWidth(0.3);
    pdf.line(margin, 20, pageW - margin, 20);
    pdf.setDrawColor(200,198,196); pdf.setLineWidth(0.2);
    pdf.line(margin, pageH - 14, pageW - margin, pageH - 14);
    pdf.setFont("helvetica","normal"); pdf.setFontSize(6.5); pdf.setTextColor(96,94,92);
    const parts = [];
    if (profile?.gstin)   parts.push(`GSTIN: ${profile.gstin}`);
    if (profile?.cin)     parts.push(`CIN: ${profile.cin}`);
    if (profile?.address) parts.push(profile.address.replace(/\n/g,", "));
    pdf.text((parts.join("  |  ") || " ").slice(0, 90), margin, pageH - 9);
    pdf.setFontSize(6); pdf.setTextColor(161,159,157);
    pdf.text("Powered by developersinfotech.in", margin, pageH - 5);
    pdf.text(`Page ${pageNum}`, pageW - margin, pageH - 5, { align:"right" });
  };

  pdf.setFont("helvetica","normal"); pdf.setFontSize(9.5); pdf.setTextColor(32,31,30);
  const lines = pdf.splitTextToSize(doc.text, usable);
  let y = 26, pageNum = 1;
  addLetterhead(pageNum);
  lines.forEach(line => {
    if (y + 5 > pageH - 18) { pdf.addPage(); pageNum++; addLetterhead(pageNum); y = 26; }
    const isH = /^[A-Z\s\d]+:/.test(line) || (line === line.toUpperCase() && line.trim().length > 2 && line.trim().length < 60);
    pdf.setFont("helvetica", isH ? "bold" : "normal"); pdf.setFontSize(isH ? 9 : 9.5);
    pdf.text(line, margin, y); y += isH ? 6 : 5;
  });
  pdf.save(`${doc.docTypeName}_${profile?.name || "LegalBro"}.pdf`);
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const profile   = getCompanyProfile();
  const [docs, setDocs]       = useState(getSavedDocs());
  const [viewDoc, setViewDoc] = useState(null);

  const handleDelete = (id) => {
    const updated = docs.filter(d => d.id !== id);
    setDocs(updated);
    localStorage.setItem("lb_docs", JSON.stringify(updated));
    toast.success("Document deleted");
  };

  const byType  = {};
  docs.forEach(d => { byType[d.docTypeName] = (byType[d.docTypeName] || 0) + 1; });
  const topType = Object.entries(byType).sort((a,b) => b[1]-a[1])[0];

  const stats = [
    { num: docs.length,              label:"Total Documents",  icon:"📄" },
    { num: Object.keys(byType).length, label:"Document Types", icon:"📂" },
    { num: topType?.[0] || "—",     label:"Most Used",        icon:"⭐" },
    { num: 10 - getRateCount(),      label:"Drafts Left Today",icon:"⏱" },
  ];

  return (
    <div className="min-h-screen bg-ms-bg pt-12 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-ms-neutralDark">Document Dashboard</h1>
            <p className="text-sm text-ms-neutralMid mt-0.5">All your generated legal documents</p>
          </div>
          <div className="flex gap-2">
            {!profile && (
              <button
                onClick={() => navigate("/profile")}
                className="border border-ms-blue text-ms-blue text-xs font-medium px-4 py-2 rounded hover:bg-ms-blueLight transition-colors"
              >
                🏢 Setup Letterhead
              </button>
            )}
            <button
              onClick={() => navigate("/draft")}
              className="bg-ms-blue text-white text-sm font-medium px-4 py-2 rounded hover:bg-ms-blueDark transition-colors"
            >
              + Draft New
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white border border-ms-border rounded-lg p-4 shadow-ms-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{s.icon}</span>
                <span className="text-xs text-ms-neutralMid uppercase tracking-wide font-medium">{s.label}</span>
              </div>
              <div className="text-xl font-bold text-ms-blue truncate">{s.num}</div>
            </div>
          ))}
        </div>

        {/* Company profile banner */}
        {profile && (
          <div
            onClick={() => navigate("/profile")}
            className="cursor-pointer mb-4 bg-ms-blueLight border border-ms-blueMid rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-ms-blueMid/30 transition-colors"
          >
            {profile.logo && <img src={profile.logo} alt="logo" className="h-8 w-auto object-contain" />}
            <div>
              <div className="text-sm font-semibold text-ms-neutralDark">{profile.name}</div>
              {profile.gstin && <div className="text-xs text-ms-neutralMid">GSTIN: {profile.gstin}</div>}
            </div>
            <span className="ml-auto text-xs text-ms-blue hover:underline">Edit Profile →</span>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-ms-border rounded-lg shadow-ms-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-2.5 bg-ms-bg border-b border-ms-border text-[10px] font-semibold text-ms-neutralMid uppercase tracking-wider">
            <div>Document</div><div>Type</div><div>Date</div><div>Actions</div>
          </div>

          {docs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-4xl mb-3">📄</div>
              <p className="font-semibold text-ms-neutral mb-1">No documents yet</p>
              <p className="text-sm text-ms-neutralMid mb-5">Draft your first legal document to see it here.</p>
              <button
                onClick={() => navigate("/draft")}
                className="bg-ms-blue text-white text-sm font-medium px-5 py-2.5 rounded hover:bg-ms-blueDark transition-colors"
              >
                + Draft Now
              </button>
            </div>
          ) : docs.map((doc, i) => (
            <div
              key={doc.id}
              className={`grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 sm:gap-4 px-5 py-3.5 items-center border-b border-ms-border last:border-0 hover:bg-ms-hover transition-colors ${i % 2 === 0 ? "" : "bg-ms-bg/40"}`}
            >
              <div>
                <div className="text-sm font-medium text-ms-neutralDark">{doc.docIcon} {doc.docTypeName}</div>
                <div className="text-[11px] text-ms-neutralLight">{doc.desc || doc.docTypeName}</div>
              </div>
              <div className="text-xs text-ms-neutralMid hidden sm:block">{doc.docTypeName}</div>
              <div className="text-xs text-ms-neutralLight">
                {new Date(doc.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setViewDoc(doc)}
                  className="text-[11px] border border-ms-border text-ms-neutralMid px-2.5 py-1 rounded hover:border-ms-blue hover:text-ms-blue hover:bg-ms-blueLight transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => { downloadPDF(doc, profile); toast.success("PDF downloaded!"); }}
                  className="text-[11px] border border-ms-border text-ms-neutralMid px-2.5 py-1 rounded hover:border-ms-blue hover:text-ms-blue hover:bg-ms-blueLight transition-colors"
                >
                  PDF
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-[11px] text-ms-neutralLight px-2 py-1 rounded hover:text-ms-red hover:bg-red-50 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer credit */}
        <p className="text-center text-[10px] text-ms-neutralLight mt-6">
          Powered by{" "}
          <a href="https://developersinfotech.in" target="_blank" rel="noreferrer" className="text-ms-blue hover:underline">
            developersinfotech.in
          </a>
        </p>
      </div>

      {/* View Modal */}
      {viewDoc && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setViewDoc(null)}
        >
          <div className="bg-white border border-ms-border rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col shadow-ms-lg">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-ms-border bg-ms-bg">
              <h3 className="text-sm font-semibold text-ms-neutralDark">
                {viewDoc.docIcon} {viewDoc.docTypeName}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => { downloadPDF(viewDoc, profile); toast.success("PDF downloaded!"); }}
                  className="text-xs border border-ms-border text-ms-neutralMid px-3 py-1 rounded hover:border-ms-blue hover:text-ms-blue transition-colors"
                >
                  ⬇ PDF
                </button>
                <button onClick={() => setViewDoc(null)} className="text-ms-neutralMid hover:text-ms-neutral text-lg leading-none px-1">✕</button>
              </div>
            </div>
            <pre className="p-5 text-sm leading-relaxed text-ms-neutral whitespace-pre-wrap overflow-auto font-sans flex-1">
              {viewDoc.text}
            </pre>
            <div className="px-5 py-2 border-t border-ms-border bg-ms-bg">
              <p className="text-[10px] text-ms-neutralLight">
                Powered by <a href="https://developersinfotech.in" target="_blank" rel="noreferrer" className="text-ms-blue hover:underline">developersinfotech.in</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}