import React from 'react';
import { Printer, X, Building2, User, Mail, Globe, MapPin, Tag, ShieldCheck, CheckCircle, FileText } from 'lucide-react';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface InvoicePrintModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  // Calculations
  const rawSubtotal = invoice.subtotalAmount || invoice.items.reduce((sum, item) => sum + (item.total || item.qty * item.unitPrice), 0);
  const discountPct = invoice.discountPercent || 0;
  const calculatedDiscount = invoice.discountAmount || (rawSubtotal * discountPct) / 100;
  const afterDiscount = Math.max(0, rawSubtotal - calculatedDiscount);
  const gstPct = invoice.gstPercent || 0;
  const calculatedGst = invoice.gstAmount || (afterDiscount * gstPct) / 100;
  const grandTotal = invoice.amountTotal || (afterDiscount + calculatedGst);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full text-slate-100 shadow-2xl my-6 overflow-hidden">
        {/* Modal Controls Bar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-sm text-white">Executive Corporate Invoice Preview</span>
            <span className="text-xs bg-blue-900/60 text-blue-300 px-2.5 py-0.5 rounded font-mono font-bold border border-blue-700/50">
              {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Printer size={15} />
              Print / Export PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 bg-white text-slate-900 space-y-6">
          {/* Top Branding & Invoice Meta */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <img 
                  src="https://www.toprankindia.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FTopRank%20logo.0yo.5zwcff6~f.webp&w=128&q=75" 
                  alt="TopRank Logo" 
                  className="h-10 object-contain"
                />
                <span className="text-xs bg-slate-900 text-white font-bold px-2.5 py-1 rounded-md tracking-wide uppercase">
                  Enterprise Billing
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-2">
                TopRank Digital & SEO Solutions Pvt. Ltd.
              </p>
              <p className="text-[11px] text-slate-600">
                Tower B, DLF Cyber City, Gurugram, HR 122002 | www.toprankindia.com
              </p>
              <p className="text-[11px] text-slate-500">GSTIN: 06AABCT9981K1Z2 | CIN: U72900HR2022PTC109823</p>
            </div>

            <div className="text-right">
              <h2 className="text-3xl font-black text-blue-900 tracking-wider">INVOICE</h2>
              <p className="font-mono font-bold text-slate-800 text-sm mt-1">{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-500 mt-1">Issue Date: <strong className="text-slate-700">{invoice.issueDate}</strong></p>
              <p className="text-xs font-bold text-rose-700 mt-0.5">Due Date: {invoice.dueDate}</p>
              {invoice.departmentCategory && (
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                  Dept: {invoice.departmentCategory}
                </span>
              )}
            </div>
          </div>

          {/* Client Info Grid */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            {/* Client Details */}
            <div className="space-y-1">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Building2 size={12} className="text-blue-600" />
                Billed To (Client & Company):
              </p>
              <p className="font-black text-sm text-slate-900">{invoice.clientCompany || invoice.clientName}</p>
              <p className="text-slate-700 font-bold flex items-center gap-1">
                <User size={12} className="text-slate-400" />
                Attn: {invoice.clientName}
              </p>
              <p className="text-slate-600 flex items-center gap-1">
                <Mail size={12} className="text-slate-400" />
                {invoice.clientEmail}
              </p>
              {invoice.clientAddress && (
                <p className="text-slate-600 flex items-start gap-1">
                  <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>{invoice.clientAddress}</span>
                </p>
              )}
              {invoice.clientUrl && (
                <p className="text-blue-600 flex items-center gap-1 font-medium">
                  <Globe size={12} className="text-blue-500" />
                  {invoice.clientUrl}
                </p>
              )}
              {invoice.clientGstin && (
                <p className="text-[11px] font-mono font-semibold text-slate-700 pt-1">
                  Client GSTIN: <span className="bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-900">{invoice.clientGstin}</span>
                </p>
              )}
            </div>

            {/* Project & Authority Metadata */}
            <div className="space-y-1.5 border-l border-slate-200 pl-5">
              <div>
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Project Scope:</p>
                <p className="font-bold text-xs text-slate-900">{invoice.projectName}</p>
              </div>

              {invoice.billingAuthority && (
                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Billing Authority Tag:</p>
                  <span className="inline-flex items-center gap-1 font-bold text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md mt-0.5">
                    <ShieldCheck size={12} className="text-indigo-600" />
                    {invoice.billingAuthority}
                  </span>
                </div>
              )}

              {invoice.referredBy && (
                <div>
                  <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Referred By:</p>
                  <p className="text-xs text-slate-700 font-semibold">{invoice.referredBy}</p>
                </div>
              )}

              <div>
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Payment Status:</p>
                <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                  invoice.status === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : invoice.status === 'Overdue'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700 uppercase">
                  <th className="py-2.5 px-3">Service / Deliverable & Department</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Custom Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{item.description}</div>
                      {item.department && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          Dept: {item.department}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700">{item.qty}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.total || item.qty * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Banking Breakdown */}
          <div className="flex justify-between items-start pt-4 border-t border-slate-300 gap-6">
            <div className="text-xs text-slate-600 max-w-sm space-y-1">
              <p className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Official Banking & NEFT Remittance Details:</p>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-0.5 text-[11px]">
                <p><strong className="text-slate-700">Bank Name:</strong> HDFC Bank Ltd (Cyber City Branch)</p>
                <p><strong className="text-slate-700">Account Name:</strong> TopRank Digital Solutions Pvt Ltd</p>
                <p><strong className="text-slate-700">Account No:</strong> 50200098123412</p>
                <p><strong className="text-slate-700">IFSC Code:</strong> HDFC0000128</p>
                <p><strong className="text-slate-700">UPI ID:</strong> toprankindia@hdfcbank</p>
              </div>
            </div>

            <div className="w-64 text-right space-y-1 text-xs">
              <div className="flex justify-between gap-4 text-slate-600">
                <span>Services Subtotal:</span>
                <span className="font-mono font-semibold">{formatCurrency(rawSubtotal)}</span>
              </div>

              {discountPct > 0 && (
                <div className="flex justify-between gap-4 text-emerald-700 font-medium">
                  <span>Special Discount ({discountPct}%):</span>
                  <span className="font-mono">- {formatCurrency(calculatedDiscount)}</span>
                </div>
              )}

              {gstPct > 0 && (
                <div className="flex justify-between gap-4 text-slate-700">
                  <span>GST Rate ({gstPct}%):</span>
                  <span className="font-mono">+ {formatCurrency(calculatedGst)}</span>
                </div>
              )}

              <div className="flex justify-between gap-4 text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                <span>Grand Total Billed:</span>
                <span className="font-mono text-blue-950">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="flex justify-between gap-4 text-emerald-700 font-semibold pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono">{formatCurrency(invoice.amountPaid)}</span>
              </div>

              <div className="flex justify-between gap-4 text-sm font-black text-rose-700 pt-1 border-t border-slate-200">
                <span>Outstanding Due:</span>
                <span className="font-mono">{formatCurrency(invoice.amountPending)}</span>
              </div>
            </div>
          </div>

          {/* Footer & Authorized Signature / Seal */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
            <div>
              <p className="font-bold text-slate-700">Terms & Conditions:</p>
              <p className="text-[10px]">1. Payment is due strictly on or before the specified due date.</p>
              <p className="text-[10px]">2. For invoice inquiries: accounts@toprankindia.com</p>
            </div>

            <div className="text-center relative">
              {/* Optional Digital Seal Stamp */}
              {(invoice.includeSignature !== false) && (
                <div className="mb-2 flex flex-col items-center">
                  <div className="w-20 h-20 border-2 border-dashed border-blue-700 rounded-full flex flex-col items-center justify-center bg-blue-50/50 text-blue-900 p-1 mb-1 rotate-[-4deg] shadow-sm">
                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-950">TOPRANK INDIA</span>
                    <span className="text-[9px] font-extrabold text-blue-700 my-0.5">VERIFIED</span>
                    <span className="text-[7px] font-mono text-blue-800">DIGITAL STAMP</span>
                  </div>
                  <div className="font-serif italic text-base font-black text-blue-900 tracking-wider">
                    {invoice.signatoryName || invoice.billingAuthority?.split('—')[0] || 'Rajesh Malhotra'}
                  </div>
                </div>
              )}
              <div className="w-36 border-b border-slate-400 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Authorized Signatory</p>
              <p className="text-[10px] text-slate-600">{invoice.signatoryTitle || 'TopRank Enterprise Executive Board'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

