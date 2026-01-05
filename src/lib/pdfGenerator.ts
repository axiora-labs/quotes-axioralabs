import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { InvoiceData } from "@/types";

// --- HELPER: Strict Hex to RGB Conversion ---
const hexToRgb = (hex: string): [number, number, number] => {
  let cleanHex = hex.replace('#', '').trim();
  
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }

  const bigint = parseInt(cleanHex, 16);
  if (isNaN(bigint)) return [0, 95, 153]; 

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r, g, b];
};

export const generateProfessionalPDF = async (data: InvoiceData) => {
  // 1. Setup Document
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const [r, g, b] = hexToRgb(data.settings.color);
  const isQuote = data.settings.docType === 'QUOTATION';
  const currency = data.settings.currency;
  const pageWidth = doc.internal.pageSize.width; 
  const pageHeight = doc.internal.pageSize.height; 

  // --- 2. HEADER STRIP ---
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, 12, 'F'); 

  // --- 3. LOGO HANDLING ---
  let titleY = 30;
  let titleX = 15;

  if (data.sender.logoUrl) {
    try {
        // x, y, width, height
        doc.addImage(data.sender.logoUrl, 'PNG', 15, 18, 25, 25);
        titleY = 50; 
        titleX = 15;
    } catch (e) {
        console.warn("Logo load failed", e);
    }
  }

  // --- 4. DOCUMENT TITLE & META ---
  doc.setTextColor(r, g, b);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(data.settings.docType, titleX, titleY);

  // Right Side Meta Data
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  
  const labelX = 130;
  const valueX = 195;
  let headerY = 25;

  const addHeaderRow = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(label, labelX, headerY);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(value, valueX, headerY, { align: 'right' });
    headerY += 6;
  };

  addHeaderRow(`${isQuote ? 'Quote' : 'Invoice'} #:`, data.invoiceNo);
  addHeaderRow("Date:", data.date);
  
  if (data.dueDate) {
    addHeaderRow(isQuote ? "Valid Until:" : "Due Date:", data.dueDate);
  }

  // --- 5. ADDRESS SECTION ---
  // FIXED: Changed 'let' to 'const'
  const addrY = Math.max(titleY + 15, 50);

  // FROM (Sender)
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "bold");
  doc.text("FROM:", 15, addrY);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(data.sender.name || "Business Name", 15, addrY + 5);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  const senderLines = doc.splitTextToSize(data.sender.address || "", 80);
  doc.text(senderLines, 15, addrY + 10);
  
  let senderH = 10 + (senderLines.length * 4);
  if (data.sender.phone) {
    doc.text(data.sender.phone, 15, addrY + senderH);
    senderH += 5;
  }
  if (data.sender.email) {
    doc.text(data.sender.email, 15, addrY + senderH);
    senderH += 5;
  }

  // BILL TO (Client)
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "bold");
  doc.text(isQuote ? "QUOTE FOR:" : "BILL TO:", 110, addrY);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(data.client.name || "Valued Client", 110, addrY + 5);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  const clientLines = doc.splitTextToSize(data.client.address || "", 80);
  doc.text(clientLines, 110, addrY + 10);
  
  let clientH = 10 + (clientLines.length * 4);
  if (data.client.phone) {
    doc.text(data.client.phone, 110, addrY + clientH);
    clientH += 5;
  }

  // --- 6. ITEM TABLE ---
  const startY = Math.max(addrY + senderH, addrY + clientH) + 10;

  autoTable(doc, {
    startY: startY,
    head: [['DESCRIPTION', 'QTY', 'PRICE', 'DISCOUNT', 'TOTAL']],
    body: data.items.map((i) => {
      const baseTotal = i.qty * i.price;
      const discountVal = i.discountType === 'PERCENTAGE' 
        ? baseTotal * (i.discount / 100) 
        : i.discount;
      const lineTotal = Math.max(0, baseTotal - discountVal);

      const discountDisplay = i.discount > 0 
        ? (i.discountType === 'PERCENTAGE' ? `${i.discount}%` : i.discount.toLocaleString()) 
        : '-';

      return [
        i.desc,
        i.qty,
        i.price.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        discountDisplay,
        lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })
      ];
    }),
    theme: 'grid',
    headStyles: {
      fillColor: [r, g, b],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 3
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: 50,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { halign: 'left' },   
      1: { halign: 'center' }, 
      2: { halign: 'right' },  
      3: { halign: 'right', textColor: [200, 50, 50] }, 
      4: { halign: 'right', fontStyle: 'bold' } 
    },
    didDrawPage: (d) => {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${d.pageNumber}`, 195, pageHeight - 10, { align: 'right' });
      doc.text("Generated by Axiora", 15, pageHeight - 10);
    }
  });

  // --- 7. TOTALS SECTION ---
  // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
  let finalY = doc.lastAutoTable.finalY + 10;

  if (finalY > 250) {
    doc.addPage();
    finalY = 20;
  }

  const summaryLabelX = 130;
  const summaryValX = 195;

  const drawSummaryLine = (label: string, value: string, isTotal = false) => {
    doc.setFont("helvetica", isTotal ? "bold" : "normal");
    doc.setFontSize(isTotal ? 12 : 10);
    doc.setTextColor(isTotal ? r : 80, isTotal ? g : 80, isTotal ? b : 80);
    
    doc.text(label, summaryLabelX, finalY);
    doc.text(value, summaryValX, finalY, { align: 'right' });
    finalY += (isTotal ? 8 : 6);
  };

  // 1. Subtotal
  drawSummaryLine("Subtotal:", data.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 }));

  // 2. Dynamic Extra Fees Loop
  if (data.extraFees && data.extraFees.length > 0) {
    data.extraFees.forEach(fee => {
      const feeAmount = fee.type === 'PERCENTAGE' 
        ? (data.subtotal * fee.value / 100) 
        : fee.value;

      const label = fee.type === 'PERCENTAGE' 
        ? `${fee.label} (${fee.value}%):` 
        : `${fee.label}:`;

      drawSummaryLine(label, feeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }));
    });
  }

  // 3. Global Discount
  if (data.globalDiscount > 0) {
    const feesTotal = data.extraFees.reduce((acc, fee) => {
       return acc + (fee.type === 'PERCENTAGE' ? (data.subtotal * fee.value / 100) : fee.value);
    }, 0);
    
    const discountVal = data.globalDiscountType === 'PERCENTAGE'
      ? (data.subtotal + feesTotal) * (data.globalDiscount / 100)
      : data.globalDiscount;

    const discountLabel = data.globalDiscountType === 'PERCENTAGE'
      ? `Bill Discount (${data.globalDiscount}%):`
      : `Bill Discount:`;

    doc.setTextColor(200, 50, 50); 
    doc.text(discountLabel, summaryLabelX, finalY);
    doc.text(`-${discountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, summaryValX, finalY, { align: 'right' });
    finalY += 6;
  }

  // 4. Grand Total
  doc.setDrawColor(200, 200, 200);
  doc.line(summaryLabelX, finalY - 2, summaryValX, finalY - 2);
  finalY += 2;

  drawSummaryLine("TOTAL:", `${currency} ${data.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, true);
  
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.line(summaryLabelX, finalY - 6, summaryValX, finalY - 6);
  doc.line(summaryLabelX, finalY - 7, summaryValX, finalY - 7);

  // --- 8. NOTES & TERMS ---
  const bottomY = finalY + 10;
  let currentNoteY = bottomY;

  if (data.notes) {
    if (currentNoteY > 260) { doc.addPage(); currentNoteY = 20; }
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 15, currentNoteY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const splitNotes = doc.splitTextToSize(data.notes, 110);
    doc.text(splitNotes, 15, currentNoteY + 5);
    currentNoteY += (splitNotes.length * 4) + 10;
  }

  if (data.terms) {
    if (currentNoteY > 260) { doc.addPage(); currentNoteY = 20; }
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions:", 15, currentNoteY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const splitTerms = doc.splitTextToSize(data.terms, 110);
    doc.text(splitTerms, 15, currentNoteY + 5);
  }

  doc.save(`${data.settings.docType}_${data.invoiceNo}.pdf`);
};