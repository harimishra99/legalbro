import jsPDF from "jspdf";

/**
 * Renders a base64 image into a jsPDF doc at given coordinates.
 * Supports PNG, JPG, SVG (converted via Image element).
 */
async function addImageToPDF(doc, base64, x, y, maxW, maxH) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const ratio   = img.width / img.height;
        let w = maxW, h = maxW / ratio;
        if (h > maxH) { h = maxH; w = maxH * ratio; }
        // detect format
        const fmt = base64.startsWith("data:image/png") ? "PNG"
                  : base64.startsWith("data:image/svg") ? "PNG"   // jsPDF needs raster
                  : "JPEG";
        doc.addImage(base64, fmt, x, y, w, h);
      } catch(e) { /* logo failed silently */ }
      resolve();
    };
    img.onerror = () => resolve();
    img.src = base64;
  });
}

/**
 * Parses raw AI text into structured blocks:
 *   { type: 'h1'|'h2'|'body'|'blank', text }
 */
function parseBlocks(raw) {
  const blocks = [];
  const lines  = raw.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t) { blocks.push({ type:"blank" }); continue; }

    // ALL-CAPS heading like "CLAUSE 1: DEFINITIONS" or "RECITALS"
    if (/^[A-Z][A-Z\s\d\-–:\.]{3,}$/.test(t) && t.length < 80) {
      blocks.push({ type:"h1", text:t }); continue;
    }
    // Numbered clause like "1." "1.1" "2.3.1"
    if (/^\d+(\.\d+)*\.?\s+\S/.test(t)) {
      // Is it a short clause header (no comma, short)?
      const rest = t.replace(/^\d+(\.\d+)*\.?\s+/, "");
      const isHeader = rest.length < 70 && !rest.includes(",") && rest === rest.toUpperCase();
      blocks.push({ type: isHeader ? "h2" : "clause", text:t }); continue;
    }
    // Lettered list like "a)" or "(a)"
    if (/^(\([a-z]\)|[a-z]\))/.test(t)) {
      blocks.push({ type:"list", text:t }); continue;
    }
    // Signature line
    if (/^(signed|signature|name|date|witness|for and on behalf)/i.test(t)) {
      blocks.push({ type:"sig", text:t }); continue;
    }
    blocks.push({ type:"body", text:t });
  }
  return blocks;
}

/**
 * Main PDF generator with full professional letterhead.
 * Returns a promise that resolves when the PDF is saved.
 */
export async function generatePDF(text, docTypeName, profile) {
  const doc    = new jsPDF({ unit:"mm", format:"a4", orientation:"portrait" });
  const pageW  = doc.internal.pageSize.getWidth();   // 210
  const pageH  = doc.internal.pageSize.getHeight();  // 297
  const mL     = 20, mR = 20, mT = 28, mB = 22;
  const usable = pageW - mL - mR;

  // ── Colours ──────────────────────────────────────────────────────────────
  const BLUE   = [0, 120, 212];
  const DARK   = [32, 31, 30];
  const MID    = [96, 94, 92];
  const LIGHT  = [161, 159, 157];
  const WHITE  = [255, 255, 255];

  let pageNum = 0;

  // ── Letterhead drawn on every page ───────────────────────────────────────
  const drawLetterhead = async (isFirst) => {
    pageNum++;

    // Blue header bar
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, pageW, 20, "F");

    // Logo in header (left side)
    let textStartX = mL;
    if (profile?.logo) {
      await addImageToPDF(doc, profile.logo, mL, 2, 28, 16);
      textStartX = mL + 32;
    }

    // Company name in header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    const compName = profile?.name || "Legal Bro";
    doc.text(compName, textStartX, 10);

    // Tagline in header (right-aligned)
    if (profile?.tagline) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(220, 235, 248);
      doc.text(profile.tagline, pageW - mR, 10, { align:"right" });
    }

    // Contact info row below header
    if (profile?.email || profile?.phone || profile?.website) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...MID);
      const contact = [profile?.email, profile?.phone, profile?.website]
        .filter(Boolean).join("   |   ");
      doc.text(contact, pageW / 2, 24, { align:"center" });
    }

    // Thin rule below header area
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.4);
    doc.line(mL, 26, pageW - mR, 26);

    // ── Footer ──────────────────────────────────────────────────────────────
    doc.setDrawColor(200, 198, 196);
    doc.setLineWidth(0.2);
    doc.line(mL, pageH - mB + 2, pageW - mR, pageH - mB + 2);

    // Footer left — company legal details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...MID);
    const footerParts = [];
    if (profile?.cin)   footerParts.push(`CIN: ${profile.cin}`);
    if (profile?.gstin) footerParts.push(`GSTIN: ${profile.gstin}`);
    if (profile?.pan)   footerParts.push(`PAN: ${profile.pan}`);
    if (footerParts.length)
      doc.text(footerParts.join("   "), mL, pageH - mB + 6);

    // Footer centre — address
    if (profile?.address) {
      doc.setFontSize(5.5);
      doc.setTextColor(...LIGHT);
      const addr = profile.address.replace(/\n/g, ", ").slice(0, 100);
      doc.text(addr, pageW / 2, pageH - mB + 6, { align:"center" });
    }

    // Footer right — page number
    doc.setFontSize(6);
    doc.setTextColor(...LIGHT);
    doc.text(`Page ${pageNum}`, pageW - mR, pageH - mB + 6, { align:"right" });

    // Powered by — bottom left, very small
    doc.setFontSize(5.5);
    doc.setTextColor(...LIGHT);
    doc.text("Powered by developersinfotech.in", mL, pageH - mB + 10);
  };

  // ── Content renderer ─────────────────────────────────────────────────────
  const CONTENT_TOP    = 30;   // below header
  const CONTENT_BOTTOM = pageH - mB - 2;

  let curY = CONTENT_TOP;

  const checkNewPage = async (needed) => {
    if (curY + needed > CONTENT_BOTTOM) {
      doc.addPage();
      await drawLetterhead(false);
      curY = CONTENT_TOP;
    }
  };

  const writeLine = (text, font, size, color, indent, lineGap) => {
    doc.setFont("helvetica", font);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, usable - indent);
    lines.forEach((l, i) => {
      doc.text(l, mL + indent, curY);
      curY += lineGap;
    });
  };

  // Draw first page letterhead
  await drawLetterhead(true);

  // Document title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BLUE);
  doc.text(docTypeName.toUpperCase(), pageW / 2, curY + 2, { align:"center" });
  curY += 10;

  // Horizontal rule under title
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.5);
  doc.line(mL, curY, pageW - mR, curY);
  curY += 6;

  // Parse and render blocks
  const blocks = parseBlocks(text);
  let lastType = null;

  for (const block of blocks) {
    if (block.type === "blank") {
      curY += lastType === "h1" ? 1 : 3;
      lastType = "blank";
      continue;
    }

    if (block.type === "h1") {
      await checkNewPage(12);
      if (lastType && lastType !== "blank") curY += 4;
      // Blue background band for major headings
      doc.setFillColor(239, 246, 252);
      doc.setDrawColor(...BLUE);
      doc.setLineWidth(0.3);
      doc.rect(mL - 2, curY - 4, usable + 4, 8, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...BLUE);
      doc.text(block.text, mL, curY);
      curY += 7;
    }
    else if (block.type === "h2") {
      await checkNewPage(9);
      if (lastType && lastType !== "blank") curY += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(block.text, mL, curY);
      curY += 6;
    }
    else if (block.type === "clause") {
      await checkNewPage(7);
      // Extract clause number and rest
      const match = block.text.match(/^(\d+(?:\.\d+)*\.?\s+)(.*)/);
      if (match) {
        const num  = match[1];
        const rest = match[2];
        // Clause number in blue
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...BLUE);
        doc.text(num, mL, curY);
        const numW = doc.getTextWidth(num);
        // Rest in dark, normal weight, wrapped
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...DARK);
        const restLines = doc.splitTextToSize(rest, usable - numW - 1);
        restLines.forEach((l, i) => {
          if (i === 0) doc.text(l, mL + numW + 1, curY);
          else doc.text(l, mL + numW + 1, curY + i * 5);
        });
        curY += restLines.length * 5 + 1;
      } else {
        await writeLine(block.text, "normal", 9, DARK, 0, 5);
        curY += 1;
      }
    }
    else if (block.type === "list") {
      await checkNewPage(6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      const lines = doc.splitTextToSize(block.text, usable - 8);
      lines.forEach((l, i) => {
        doc.text(i === 0 ? "•" : " ", mL + 2, curY);
        doc.text(l.replace(/^(\([a-z]\)|[a-z]\))\s*/, ""), mL + 8, curY);
        curY += 5;
      });
    }
    else if (block.type === "sig") {
      await checkNewPage(8);
      if (lastType !== "sig") curY += 4;
      const t = block.text;
      // "For CompanyName:" or "For and on behalf" — bold label, no underline
      if (/^(for |in witness)/i.test(t)) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...BLUE);
        doc.text(t, mL, curY);
        curY += 7;
      }
      // Lines that need a fill-in underline: Signature / Name / Date / Place / Designation / Witness
      else if (/^(signature|name|date|place|designation|witness|authorized|company seal)/i.test(t)) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        const label = t.endsWith(":") ? t : t + ":";
        doc.text(label, mL, curY);
        doc.setDrawColor(...LIGHT);
        doc.setLineWidth(0.2);
        doc.line(mL + 35, curY + 1, mL + 90, curY + 1);
        curY += 7;
      }
      else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        doc.text(t, mL, curY);
        curY += 6;
      }
    }
    else {
      // body text
      await checkNewPage(6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      const lines = doc.splitTextToSize(block.text, usable);
      for (const l of lines) {
        await checkNewPage(5);
        doc.text(l, mL, curY);
        curY += 5;
      }
      curY += 1;
    }

    lastType = block.type;
  }

  doc.save(`${docTypeName.replace(/\s+/g,"_")}_${profile?.name || "LegalBro"}.pdf`);
}