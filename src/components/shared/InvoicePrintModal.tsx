import React, { useEffect, useState } from 'react';
import { Printer, X, Building2, User, Mail, Globe, MapPin, ShieldCheck, FileText, CheckCircle2, Share2, Download, MessageSquare, Copy, Check, Loader2 } from 'lucide-react';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { TopRankSignatureStamp } from './TopRankSignatureStamp';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface InvoicePrintModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showShareFallbackModal, setShowShareFallbackModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Generate standardized PDF filename based on client name and invoice number
  const getPdfFilename = () => {
    const rawClient = (invoice.clientName || invoice.clientCompany || 'Client').trim();
    const cleanClient = rawClient.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    const cleanInvNum = (invoice.invoiceNumber || 'INV').replace(/[^a-zA-Z0-9]/g, '_');
    return `${cleanClient}_Invoice_${cleanInvNum}.pdf`;
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    const printDocTitle = getPdfFilename().replace(/\.pdf$/i, '');
    document.title = printDocTitle;

    window.focus();
    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) return;

    setIsGeneratingPdf(true);
    const filename = getPdfFilename();

    const opt = {
      margin: [6, 6, 6, 6] as [number, number, number, number],
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF generation error:', err);
      // Fallback to window print
      handlePrint();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareInvoice = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) {
      setShowShareFallbackModal(true);
      return;
    }

    setIsGeneratingPdf(true);
    const filename = getPdfFilename();

    const opt = {
      margin: [6, 6, 6, 6] as [number, number, number, number],
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    try {
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `Tax Invoice ${invoice.invoiceNumber} - TopRank Digital Service`,
          text: `Official Tax Invoice for ${invoice.clientName} (${invoice.invoiceNumber}). Total Amount: ₹${invoice.amountTotal?.toLocaleString('en-IN')}`,
          files: [pdfFile]
        });
      } else {
        setShowShareFallbackModal(true);
      }
    } catch (err) {
      console.warn('Native share failed or unhandled, using fallback dialog:', err);
      setShowShareFallbackModal(true);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyInvoiceSummary = () => {
    const summaryText = `📄 TAX INVOICE DETAILS
TopRank Digital Service
Invoice #: ${invoice.invoiceNumber}
Client: ${invoice.clientName} ${invoice.clientCompany ? `(${invoice.clientCompany})` : ''}
Project: ${invoice.projectName || 'Digital Services'}
Total Billed: ₹${invoice.amountTotal?.toLocaleString('en-IN')}
Paid Amount: ₹${invoice.amountPaid?.toLocaleString('en-IN')}
Pending Due: ₹${invoice.amountPending?.toLocaleString('en-IN')}
Due Date: ${invoice.dueDate}
Branch: ${invoice.agencyBranch || 'Chandigarh'}
----------------------------------
Contact Accounts: +91 9305030523 | accounts@toprankindia.com`;

    navigator.clipboard.writeText(summaryText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Safe Calculations
  const rawSubtotal = invoice.subtotalAmount || invoice.items.reduce((sum, item) => sum + (item.total || item.qty * item.unitPrice), 0);
  const discountPct = Number(invoice.discountPercent || 0);
  const calculatedDiscount = invoice.discountAmount || (rawSubtotal * discountPct) / 100;
  const afterDiscount = Math.max(0, rawSubtotal - calculatedDiscount);
  const gstPct = Number(invoice.gstPercent || 0);
  const calculatedGst = invoice.gstAmount || (afterDiscount * gstPct) / 100;
  const grandTotal = invoice.amountTotal || (afterDiscount + calculatedGst);

  // Clean data presence checks
  const hasClientCompany = Boolean(invoice.clientCompany && invoice.clientCompany.trim() && invoice.clientCompany.trim() !== invoice.clientName?.trim());
  const hasClientEmail = Boolean(invoice.clientEmail && invoice.clientEmail.trim());
  const hasClientAddress = Boolean(invoice.clientAddress && invoice.clientAddress.trim());
  const hasClientGstin = Boolean(invoice.clientGstin && invoice.clientGstin.trim());
  const hasClientUrl = Boolean(invoice.clientUrl && invoice.clientUrl.trim());
  const hasReferredBy = Boolean(invoice.referredBy && invoice.referredBy.trim());
  const hasBillingAuth = Boolean(invoice.billingAuthority && invoice.billingAuthority.trim());
  const hasDepartment = Boolean(invoice.departmentCategory && invoice.departmentCategory.trim());

  return (
    <div
      id="printable-invoice-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* CSS Print Styles targeting printable invoice container only */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-modal-overlay,
          #printable-invoice-wrapper,
          #printable-invoice,
          #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice-modal-overlay {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            z-index: 999999 !important;
          }
          #printable-invoice-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          #printable-invoice {
            padding: 20px !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            color: #0f172a !important;
          }
          .no-print-control {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Modal Card Container */}
      <div
        id="printable-invoice-wrapper"
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full text-slate-100 shadow-2xl my-4 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Sticky Controls Header Bar (No Print) */}
        <div className="no-print-control bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <FileText size={16} className="text-blue-400" />
              Corporate Tax Invoice Preview
            </span>
            <span className="text-xs bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded font-mono font-bold border border-blue-800/60">
              {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleShareInvoice}
              disabled={isGeneratingPdf}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
              title="Share invoice PDF directly via WhatsApp, Mail, or Apps"
            >
              {isGeneratingPdf ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />}
              Share PDF
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
              title="Download clean PDF file"
            >
              <Download size={15} />
              Download PDF
            </button>

            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <Printer size={15} />
              Print
            </button>

            <button
              onClick={onClose}
              className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
              title="Close Invoice Preview (Esc)"
            >
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Sheet */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-900 flex-1">
          <div
            id="printable-invoice"
            className="p-6 sm:p-10 bg-white text-slate-900 rounded-xl shadow-xl space-y-6 mx-auto max-w-3xl border border-slate-200"
          >
            {/* Top Branding & Invoice Meta */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-5 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <img
                    src="https://www.toprankindia.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FTopRank%20logo.0yo.5zwcff6~f.webp&w=128&q=75"
                    alt="TopRank Logo"
                    className="h-9 object-contain"
                  />
                  <span className="text-[10px] bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded tracking-wider uppercase">
                    TAX INVOICE
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900 pt-1">
                  TopRank Digital Service
                </p>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {invoice.agencyBranch === 'Lucknow'
                    ? 'Sulabh Awas, A47/32, Apartments, Sector 01, Gomti Nagar, Lucknow, Uttar Pradesh 226010'
                    : 'Shop No. 8, Sector 34B, Sector 34, Chandigarh, 160022'}{' '}
                  | www.toprankindia.com
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  GSTIN: 06AABCT9981K1Z2 &bull; Contact: +91 9305030523
                </p>
              </div>

              <div className="text-right shrink-0">
                <h2 className="text-2xl sm:text-3xl font-black text-blue-900 tracking-wider">INVOICE</h2>
                <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{invoice.invoiceNumber}</p>
                <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                  <p>Issue Date: <strong className="text-slate-800">{invoice.issueDate}</strong></p>
                  <p className="font-bold text-rose-700">Due Date: {invoice.dueDate}</p>
                </div>
                {hasDepartment && (
                  <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                    Dept: {invoice.departmentCategory}
                  </span>
                )}
              </div>
            </div>

            {/* Client Info & Project Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              {/* Billed To Details */}
              <div className="space-y-1">
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Building2 size={12} className="text-blue-600" />
                  Billed To (Client):
                </p>
                
                {hasClientCompany ? (
                  <>
                    <p className="font-black text-sm text-slate-900">{invoice.clientCompany}</p>
                    <p className="text-slate-700 font-semibold flex items-center gap-1">
                      <User size={12} className="text-slate-400" />
                      Attn: {invoice.clientName}
                    </p>
                  </>
                ) : (
                  <p className="font-black text-sm text-slate-900">{invoice.clientName}</p>
                )}

                {hasClientEmail && (
                  <p className="text-slate-600 flex items-center gap-1">
                    <Mail size={12} className="text-slate-400" />
                    {invoice.clientEmail}
                  </p>
                )}

                {hasClientAddress && (
                  <p className="text-slate-600 flex items-start gap-1">
                    <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                    <span>{invoice.clientAddress}</span>
                  </p>
                )}

                {hasClientUrl && (
                  <p className="text-blue-600 flex items-center gap-1 font-medium">
                    <Globe size={12} className="text-blue-500" />
                    {invoice.clientUrl}
                  </p>
                )}

                {hasClientGstin && (
                  <p className="text-[10px] font-mono font-bold text-slate-700 pt-1">
                    GSTIN: <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-900">{invoice.clientGstin}</span>
                  </p>
                )}
              </div>

              {/* Scope & Billing Meta Details */}
              <div className="space-y-2 sm:border-l sm:border-slate-200 sm:pl-4">
                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Project Scope / Campaign:</p>
                  <p className="font-bold text-xs text-slate-900">{invoice.projectName || 'Digital Agency Services'}</p>
                </div>

                {hasBillingAuth && (
                  <div>
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Staff Biller / Signatory:</p>
                    <span className="inline-flex items-center gap-1 font-bold text-[11px] bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-md mt-0.5">
                      <ShieldCheck size={12} className="text-indigo-600" />
                      {invoice.billingAuthority}
                    </span>
                  </div>
                )}

                {hasReferredBy && (
                  <div>
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Referred By Channel:</p>
                    <p className="text-xs text-slate-800 font-semibold">{invoice.referredBy}</p>
                  </div>
                )}

                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Payment Status:</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border mt-0.5 ${
                    invoice.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : invoice.status === 'Overdue'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    <CheckCircle2 size={11} />
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Services Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Service Deliverable & Category</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.description}</div>
                        {item.department && (
                          <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            {item.department}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-700 font-semibold">{item.qty}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.total || item.qty * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Terms & Conditions Grid */}
            <div className="flex flex-col sm:flex-row justify-between items-start pt-3 border-t border-slate-300 gap-6">
              <div className="text-xs text-slate-600 max-w-sm w-full space-y-1">
                <p className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                  Terms & Conditions:
                </p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-[11px] leading-snug">
                  <p>1. Payment is due strictly on or before the specified due date.</p>
                  <p>2. Delayed payments may attract a late interest fee of 1.5% per month.</p>
                  <p>3. All deliverables & services rendered are subject to company policy.</p>
                  <p>4. For billing inquiries contact: accounts@toprankindia.com | +91 9305030523</p>
                </div>
              </div>

              <div className="w-full sm:w-72 text-right space-y-1.5 text-xs">
                <div className="flex justify-between gap-4 text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(rawSubtotal)}</span>
                </div>

                {/* Only display Discount if > 0 */}
                {discountPct > 0 && calculatedDiscount > 0 && (
                  <div className="flex justify-between gap-4 text-emerald-700 font-semibold">
                    <span>Discount ({discountPct}%):</span>
                    <span className="font-mono">- {formatCurrency(calculatedDiscount)}</span>
                  </div>
                )}

                {/* Only display GST if > 0 */}
                {gstPct > 0 && calculatedGst > 0 && (
                  <div className="flex justify-between gap-4 text-slate-700">
                    <span>GST ({gstPct}%):</span>
                    <span className="font-mono">+ {formatCurrency(calculatedGst)}</span>
                  </div>
                )}

                <div className="flex justify-between gap-4 text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                  <span>Grand Total:</span>
                  <span className="font-mono text-blue-950">{formatCurrency(grandTotal)}</span>
                </div>

                <div className="flex justify-between gap-4 text-emerald-700 font-bold pt-1">
                  <span>Amount Paid:</span>
                  <span className="font-mono">{formatCurrency(invoice.amountPaid)}</span>
                </div>

                <div className="flex justify-between gap-4 text-sm font-black text-rose-700 pt-1 border-t border-slate-200">
                  <span>Pending Due:</span>
                  <span className="font-mono">{formatCurrency(invoice.amountPending)}</span>
                </div>
              </div>
            </div>

            {/* Footer with TopRank Official Stamp + Signature */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-4 text-[10px] text-slate-500">
              <div>
                <p className="font-bold text-slate-800 text-[11px]">TopRank Digital Service</p>
                <p>Computer-generated corporate tax invoice.</p>
                <p className="text-slate-500 font-medium">Thank you for choosing TopRank as your digital growth partner!</p>
              </div>

              {/* Official Stamp & Handwritten Signature Display */}
              <div className="text-right flex flex-col items-center sm:items-end">
                {invoice.includeSignature !== false && (
                  <div className="mb-1">
                    <TopRankSignatureStamp width={210} height={110} />
                  </div>
                )}
                <div className="w-40 border-b border-slate-400 my-1"></div>
                <p className="font-bold text-slate-900 text-xs">Authorized Signatory Stamp</p>
                <p className="text-[10px] text-slate-600 font-semibold">
                  {invoice.signatoryTitle || invoice.billingAuthority || 'TopRank Digital Executive Board'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (No Print) */}
        <div className="no-print-control bg-slate-950 px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <p className="text-xs text-slate-400">PDF Filename: <strong className="text-amber-300 font-mono">{getPdfFilename()}</strong></p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareInvoice}
              disabled={isGeneratingPdf}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <Share2 size={15} />
              Share
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <Download size={15} />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <Printer size={15} />
              Print
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>

      {/* Share Options Fallback Dialog */}
      {showShareFallbackModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <Share2 size={18} />
                Share Invoice #{invoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setShowShareFallbackModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Share this invoice directly with client <strong className="text-amber-300">{invoice.clientName}</strong>:
            </p>

            <div className="space-y-2.5">
              {/* WhatsApp Share */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Hi ${invoice.clientName}, please find your Tax Invoice #${invoice.invoiceNumber} from TopRank Digital Service.\n\nTotal Billed: ₹${invoice.amountTotal?.toLocaleString('en-IN')}\nPending Due: ₹${invoice.amountPending?.toLocaleString('en-IN')}\nDue Date: ${invoice.dueDate}\n\nThank you!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-between shadow-md"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  Share Summary via WhatsApp
                </span>
                <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded">WhatsApp</span>
              </a>

              {/* Email Share */}
              <a
                href={`mailto:${invoice.clientEmail || ''}?subject=${encodeURIComponent(
                  `Tax Invoice ${invoice.invoiceNumber} - TopRank Digital Service`
                )}&body=${encodeURIComponent(
                  `Dear ${invoice.clientName},\n\nPlease find attached the Tax Invoice ${invoice.invoiceNumber} for ${invoice.projectName || 'Digital Services'}.\n\nTotal Amount: ₹${invoice.amountTotal?.toLocaleString('en-IN')}\nDue Date: ${invoice.dueDate}\n\nKind Regards,\nTopRank Digital Service\nContact: +91 9305030523`
                )}`}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-between shadow-md"
              >
                <span className="flex items-center gap-2">
                  <Mail size={16} />
                  Send via Email
                </span>
                <span className="text-[10px] bg-blue-700 px-2 py-0.5 rounded">Email</span>
              </a>

              {/* Download PDF */}
              <button
                onClick={() => {
                  setShowShareFallbackModal(false);
                  handleDownloadPdf();
                }}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-between shadow-md"
              >
                <span className="flex items-center gap-2">
                  <Download size={16} />
                  Download PDF ({getPdfFilename()})
                </span>
                <span className="text-[10px] bg-amber-700 px-2 py-0.5 rounded">PDF File</span>
              </button>

              {/* Copy Summary */}
              <button
                onClick={handleCopyInvoiceSummary}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-between border border-slate-700"
              >
                <span className="flex items-center gap-2">
                  {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  {copiedLink ? 'Copied Invoice Summary!' : 'Copy Formatted Invoice Text'}
                </span>
                <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">Clipboard</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 text-right">
              <button
                onClick={() => setShowShareFallbackModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

