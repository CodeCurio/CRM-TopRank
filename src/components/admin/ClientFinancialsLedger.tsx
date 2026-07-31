import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Plus,
  DollarSign,
  Printer,
  CheckCircle,
  Clock,
  Filter,
  Search,
  BookOpen,
  Send,
  Calendar,
  Building,
  ArrowUpRight,
  TrendingUp,
  Lock,
  Edit2,
  Trash2,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Invoice, LedgerEntry, InvoiceStatus, Employee } from '../../types';
import { formatCurrency, getDaysUntilDue, getInvoiceUrgency } from '../../utils/formatters';

interface ClientFinancialsLedgerProps {
  invoices: Invoice[];
  ledger: LedgerEntry[];
  currentEmployee?: Employee;
  onAddInvoice: (inv: Invoice) => void;
  onUpdateInvoice?: (inv: Invoice) => void;
  onDeleteInvoice?: (id: string) => void;
  onRecordPayment: (invoiceId: string, amount: number, method: string, reference: string) => void;
  onPrintInvoice: (inv: Invoice) => void;
}

export const ClientFinancialsLedger: React.FC<ClientFinancialsLedgerProps> = ({
  invoices,
  ledger,
  currentEmployee,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onRecordPayment,
  onPrintInvoice,
}) => {
  const isFounder = currentEmployee?.adminRole === 'Founder' || (!currentEmployee?.adminRole && currentEmployee?.isAdmin);
  const isCoFounder = currentEmployee?.adminRole === 'Co-Founder';

  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'ledger'>('invoices');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);

  // Edit Invoice Modal State (Founder only)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAmountTotal, setEditAmountTotal] = useState<number>(0);
  const [editAmountPaid, setEditAmountPaid] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<InvoiceStatus>('Pending');

  // Payment Modal State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (NEFT)');
  const [paymentRef, setPaymentRef] = useState('');

  // New Invoice Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientUrl, setNewClientUrl] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newDepartmentCategory, setNewDepartmentCategory] = useState('Ads');
  const [newDueDate, setNewDueDate] = useState('2026-08-15');
  const [newDiscountPercent, setNewDiscountPercent] = useState<number>(0);
  const [newGstPercent, setNewGstPercent] = useState<number>(18);
  const [newReferredBy, setNewReferredBy] = useState('');
  const [newBillingAuthority, setNewBillingAuthority] = useState('Rajesh Malhotra — Director of Billing');
  const [newIncludeSignature, setNewIncludeSignature] = useState<boolean>(true);
  const [newClientGstin, setNewClientGstin] = useState('');
  
  // Dynamic line items state
  const [itemsList, setItemsList] = useState<{ id: string; description: string; department: string; qty: number; unitPrice: number }[]>([
    { id: 'item-1', description: 'Digital Ads & Media Campaign Optimization', department: 'Ads', qty: 1, unitPrice: 50000 }
  ]);

  // Calculate totals
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amountTotal, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + inv.amountPending, 0);

  const overdueInvoices = invoices.filter(
    (inv) => getInvoiceUrgency(inv.dueDate, inv.status) === 'OVERDUE'
  );
  const dueSoonInvoices = invoices.filter(
    (inv) => getInvoiceUrgency(inv.dueDate, inv.status) === 'DUE_SOON'
  );

  const totalUrgentCount = overdueInvoices.length + dueSoonInvoices.length;

  // Filtered invoices logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.projectName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'BLINKING_ALERTS') {
      const urgency = getInvoiceUrgency(inv.dueDate, inv.status);
      return urgency === 'OVERDUE' || urgency === 'DUE_SOON';
    }
    return inv.status === statusFilter;
  });

  const handleOpenEditModal = (inv: Invoice) => {
    setEditingInvoice(inv);
    setEditClientName(inv.clientName);
    setEditProjectName(inv.projectName);
    setEditIssueDate(inv.issueDate);
    setEditDueDate(inv.dueDate);
    setEditAmountTotal(inv.amountTotal);
    setEditAmountPaid(inv.amountPaid);
    setEditStatus(inv.status);
  };

  const handleSaveInvoiceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    const pending = Math.max(0, editAmountTotal - editAmountPaid);
    let computedStatus: InvoiceStatus = editStatus;
    if (pending === 0 && editAmountTotal > 0) {
      computedStatus = 'Paid';
    } else if (editAmountPaid > 0 && pending > 0) {
      computedStatus = 'Partial';
    }

    const updated: Invoice = {
      ...editingInvoice,
      clientName: editClientName,
      projectName: editProjectName,
      issueDate: editIssueDate,
      dueDate: editDueDate,
      amountTotal: editAmountTotal,
      amountPaid: editAmountPaid,
      amountPending: pending,
      status: computedStatus,
    };

    if (onUpdateInvoice) {
      onUpdateInvoice(updated);
    }
    setEditingInvoice(null);
  };

  const handleOpenPaymentModal = (inv: Invoice) => {
    setPaymentModalInvoice(inv);
    setPaymentAmount(inv.amountPending);
    setPaymentRef(`PAY_${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    onRecordPayment(
      paymentModalInvoice.id,
      Number(paymentAmount),
      paymentMethod,
      paymentRef
    );
    setPaymentModalInvoice(null);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newProjectName) return;

    const formattedItems = itemsList.map((item, idx) => ({
      id: `item-${idx + 1}`,
      description: item.description || 'Digital Agency Service',
      department: item.department || newDepartmentCategory,
      qty: Number(item.qty) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: (Number(item.qty) || 1) * (Number(item.unitPrice) || 0),
    }));

    const rawSubtotal = formattedItems.reduce((sum, i) => sum + i.total, 0);
    const discAmt = (rawSubtotal * (Number(newDiscountPercent) || 0)) / 100;
    const afterDisc = Math.max(0, rawSubtotal - discAmt);
    const gstAmt = (afterDisc * (Number(newGstPercent) || 0)) / 100;
    const finalGrandTotal = Math.round(afterDisc + gstAmt);

    const invoiceNum = `TR-INV-2026-0${Math.floor(100 + Math.random() * 900)}`;
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      clientName: newClientName,
      clientEmail: newClientEmail || `${newClientName.toLowerCase().replace(/\s+/g, '')}@client.com`,
      clientCompany: newClientCompany || newClientName,
      clientAddress: newClientAddress,
      clientUrl: newClientUrl,
      clientGstin: newClientGstin,
      projectName: newProjectName,
      departmentCategory: newDepartmentCategory,
      issueDate: '2026-07-31',
      dueDate: newDueDate,
      subtotalAmount: rawSubtotal,
      discountPercent: Number(newDiscountPercent),
      discountAmount: discAmt,
      gstPercent: Number(newGstPercent),
      gstAmount: gstAmt,
      amountTotal: finalGrandTotal,
      amountPaid: 0,
      amountPending: finalGrandTotal,
      status: 'Pending',
      items: formattedItems,
      referredBy: newReferredBy,
      billingAuthority: newBillingAuthority,
      includeSignature: newIncludeSignature,
      signatoryName: newBillingAuthority.split('—')[0]?.trim() || 'Rajesh Malhotra',
      signatoryTitle: newBillingAuthority.split('—')[1]?.trim() || 'Director of Billing Authority',
      paymentHistory: [],
    };

    onAddInvoice(newInv);
    setShowAddModal(false);
    // Reset form
    setNewClientName('');
    setNewClientEmail('');
    setNewClientCompany('');
    setNewClientAddress('');
    setNewClientUrl('');
    setNewClientGstin('');
    setNewProjectName('');
    setNewReferredBy('');
    setItemsList([{ id: 'item-1', description: 'Digital Ads & Media Campaign Optimization', department: 'Ads', qty: 1, unitPrice: 50000 }]);
  };

  return (
    <div className="space-y-6">
      {/* Admin Privilege Banner */}
      <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-sm transition-all ${
        isFounder 
          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' 
          : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
            isFounder ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
          }`}>
            {isFounder ? '👑' : '🛡️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                {isFounder ? 'Founder Admin Mode' : 'Co-Founder Admin Mode'}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                isFounder ? 'bg-amber-500/30 text-amber-300 border-amber-500/50' : 'bg-indigo-500/30 text-indigo-300 border-indigo-500/50'
              }`}>
                {isFounder ? 'Full Unrestricted Access' : 'Billed Data Locked'}
              </span>
            </div>
            <p className="mt-0.5 text-slate-300 text-xs">
              {isFounder 
                ? 'As Founder, you can edit or modify any invoice, issue date, due date, payment entry, or total amount at any time without restriction.'
                : 'As Co-Founder, you have full view access, work assignment rights, and can issue new invoices & record payments. Editing billed invoices or payment records after issuance is restricted to Founder.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Total Client Billed
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(totalBilled)}
          </p>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-600" />
            Across {invoices.length} Active Client Accounts
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Amount Paid (Collected)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {formatCurrency(totalPaid)}
          </p>
          <div className="text-[11px] text-slate-500 mt-2">
            Collection Efficiency:{' '}
            <span className="font-bold text-emerald-600">
              {Math.round((totalPaid / (totalBilled || 1)) * 100)}%
            </span>
          </div>
        </div>

        {/* Amount Pending */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Pending Receivables
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            {formatCurrency(totalPending)}
          </p>
          <div className="text-[11px] text-slate-500 mt-2">
            Outstanding from Clients
          </div>
        </div>

        {/* Due Date Alert Box with Animated Blinking Pulse */}
        <div
          onClick={() => setStatusFilter('BLINKING_ALERTS')}
          className={`cursor-pointer rounded-2xl p-5 text-white shadow-lg transition-all ${
            totalUrgentCount > 0
              ? 'bg-rose-950/90 border border-rose-600 animate-blink-due hover:brightness-110'
              : 'bg-slate-900 border border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-rose-300 flex items-center gap-1">
              <AlertTriangle size={15} className="animate-bounce" />
              Due Date Alert System
            </span>
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <p className="text-2xl font-bold text-rose-300 mt-2">
            {totalUrgentCount} Urgent Action Required
          </p>
          <div className="text-xs font-bold text-rose-200 mt-2 flex items-center justify-between">
            <span>{overdueInvoices.length} Overdue Invoices</span>
            <span className="underline">Click to Filter &rarr;</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-slate-900">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'invoices'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={15} />
              Client Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveSubTab('ledger')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'ledger'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen size={15} />
              Financial Ledger Logs ({ledger.length})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search Client or Invoice #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Create Invoice Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Plus size={16} />
              + Generate New Invoice
            </button>
          </div>
        </div>

        {activeSubTab === 'invoices' ? (
          <div>
            {/* Status Filter Chips */}
            <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mr-2">
                <Filter size={13} />
                Filter:
              </span>
              {[
                { key: 'ALL', label: 'All Invoices' },
                {
                  key: 'BLINKING_ALERTS',
                  label: `🚨 Due Date Blinking Alerts (${totalUrgentCount})`,
                  special: true,
                },
                { key: 'Overdue', label: 'Overdue' },
                { key: 'Pending', label: 'Pending' },
                { key: 'Partial', label: 'Partial Paid' },
                { key: 'Paid', label: 'Fully Paid' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === f.key
                      ? f.special
                        ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                        : 'bg-blue-600 text-white'
                      : f.special
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase bg-slate-950/50">
                    <th className="py-3.5 px-4 align-middle w-[20%]">Invoice # & Client</th>
                    <th className="py-3.5 px-4 align-middle w-[18%]">Project</th>
                    <th className="py-3.5 px-4 align-middle w-[15%]">Due Date</th>
                    <th className="py-3.5 px-4 align-middle w-[14%]">Total Amount</th>
                    <th className="py-3.5 px-4 align-middle w-[16%]">Paid vs Pending</th>
                    <th className="py-3.5 px-4 align-middle w-[12%]">Status</th>
                    <th className="py-3.5 px-4 align-middle text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs align-middle">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        No invoices match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const urgency = getInvoiceUrgency(inv.dueDate, inv.status);
                      const daysLeft = getDaysUntilDue(inv.dueDate);

                      return (
                        <tr
                          key={inv.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            urgency === 'OVERDUE'
                              ? 'bg-rose-950/20'
                              : urgency === 'DUE_SOON'
                              ? 'bg-amber-950/20'
                              : ''
                          }`}
                        >
                          {/* Invoice # & Client */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white font-mono text-sm">
                              {inv.invoiceNumber}
                            </div>
                            <div className="text-slate-300 font-medium">{inv.clientName}</div>
                            <div className="text-[10px] text-slate-500">{inv.clientEmail}</div>
                            {inv.departmentCategory && (
                              <span className="inline-block mt-1 text-[9px] font-bold text-blue-300 bg-blue-950/80 border border-blue-800/60 px-1.5 py-0.5 rounded">
                                Dept: {inv.departmentCategory}
                              </span>
                            )}
                          </td>

                          {/* Project */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-200 font-medium max-w-[180px] truncate">
                              {inv.projectName}
                            </div>
                            <div className="text-[10px] text-blue-400">
                              Issued: {inv.issueDate}
                            </div>
                          </td>

                          {/* Due Date & Days Count */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                              <Calendar size={13} className="text-slate-400" />
                              {inv.dueDate}
                            </div>
                            {inv.status !== 'Paid' && (
                              <div
                                className={`text-[10px] font-bold mt-0.5 ${
                                  daysLeft < 0
                                    ? 'text-rose-400'
                                    : daysLeft <= 3
                                    ? 'text-amber-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {daysLeft < 0
                                  ? `${Math.abs(daysLeft)} Days OVERDUE`
                                  : daysLeft === 0
                                  ? 'DUE TODAY!'
                                  : `Due in ${daysLeft} days`}
                              </div>
                            )}
                          </td>

                          {/* Total Amount */}
                          <td className="py-3.5 px-4 font-bold text-white font-mono text-sm">
                            {formatCurrency(inv.amountTotal)}
                          </td>

                          {/* Paid vs Pending Breakdown */}
                          <td className="py-3.5 px-4">
                            <div className="text-emerald-400 font-medium">
                              Paid: {formatCurrency(inv.amountPaid)}
                            </div>
                            <div
                              className={`font-bold font-mono ${
                                inv.amountPending > 0 ? 'text-amber-400' : 'text-slate-500'
                              }`}
                            >
                              Pending: {formatCurrency(inv.amountPending)}
                            </div>
                          </td>

                          {/* Status Badge with Blinking Alert Indicator */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {urgency === 'OVERDUE' && (
                                <span className="w-3 h-3 rounded-full bg-rose-500 animate-blink-due"></span>
                              )}
                              {urgency === 'DUE_SOON' && (
                                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse-amber"></span>
                              )}

                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  inv.status === 'Paid'
                                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                                    : inv.status === 'Overdue'
                                    ? 'bg-rose-950 text-rose-300 border border-rose-600/80 animate-pulse'
                                    : inv.status === 'Partial'
                                    ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                                    : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {inv.amountPending > 0 && (
                                <button
                                  onClick={() => handleOpenPaymentModal(inv)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow"
                                >
                                  <DollarSign size={13} />
                                  Record Payment
                                </button>
                              )}

                              <button
                                onClick={() => onPrintInvoice(inv)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                title="View & Print Official Invoice"
                              >
                                <Printer size={13} />
                                Invoice
                              </button>

                              {/* Founder Edit & Delete Controls vs Co-Founder Lock Badge */}
                              {isFounder ? (
                                <>
                                  <button
                                    onClick={() => handleOpenEditModal(inv)}
                                    className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                                    title="Founder Override: Edit Billed Invoice, Dates & Amounts"
                                  >
                                    <Edit2 size={13} />
                                    Edit
                                  </button>
                                  {onDeleteInvoice && (
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Founder Override: Delete invoice ${inv.invoiceNumber}?`)) {
                                          onDeleteInvoice(inv.id);
                                        }
                                      }}
                                      className="bg-rose-950 hover:bg-rose-900 text-rose-300 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border border-rose-800"
                                      title="Founder Override: Delete Invoice"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span 
                                  className="bg-slate-900/90 text-slate-400 border border-slate-800 px-2 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-not-allowed select-none"
                                  title="Locked: Only Founder can modify issued invoice dates, amounts, or payment entries after billing"
                                >
                                  <Lock size={12} className="text-amber-400" />
                                  Billed Data Locked
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Ledger Table */
          <div className="overflow-x-auto mt-4">
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-400" />
              Company Revenue & Transaction Ledger Log
            </h4>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase bg-slate-950/50">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Client / Account</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {ledger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono">{item.date}</td>
                    <td className="py-3 px-4 font-bold text-white">{item.clientName}</td>
                    <td className="py-3 px-4 text-slate-300">{item.description}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.type.includes('Credit')
                            ? 'bg-emerald-900/60 text-emerald-300'
                            : 'bg-rose-900/60 text-rose-300'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{item.referenceNo}</td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                        item.type.includes('Credit') ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.type.includes('Credit') ? '+' : '-'} {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <DollarSign size={18} />
                Record Client Payment
              </h3>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <p className="text-slate-400">Invoice Number:</p>
                <p className="font-mono font-bold text-white">{paymentModalInvoice.invoiceNumber}</p>
                <p className="text-slate-400 mt-1">Client Name:</p>
                <p className="font-bold text-slate-200">{paymentModalInvoice.clientName}</p>
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Current Outstanding:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {formatCurrency(paymentModalInvoice.amountPending)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Amount Received (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentModalInvoice.amountPending}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-emerald-400 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5"
                >
                  <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                  <option value="RTGS Transfer">RTGS Transfer</option>
                  <option value="UPI / Razorpay">UPI / Razorpay</option>
                  <option value="Cheque Deposit">Cheque Deposit</option>
                  <option value="IMPS Transfer">IMPS Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reference / UTR / Transaction No.
                </label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs font-mono text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate New Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus size={18} className="text-blue-400" />
                  Generate Comprehensive Invoice Form
                </h3>
                <p className="text-[11px] text-slate-400">Specify client contact, department services, rate customization, GST & authorized billing details</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {/* Section 1: Client & Contact Person Details */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} />
                  Client & Contact Information
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Contact Person Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Sharma"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Company / Organization Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Technologies Pvt Ltd"
                      value={newClientCompany}
                      onChange={(e) => setNewClientCompany(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Client Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. billing@apexglobal.com"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Website / URL (if available)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://apexglobal.com"
                      value={newClientUrl}
                      onChange={(e) => setNewClientUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Office / Billing Address Offers
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot 42, Sector 44, Cyber City, Gurugram"
                      value={newClientAddress}
                      onChange={(e) => setNewClientAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Client GSTIN / Tax Identification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 07AACCA1234F1Z5"
                      value={newClientGstin}
                      onChange={(e) => setNewClientGstin(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Department, Project Scope & Referral */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building size={14} />
                  Project Scope & Department Category
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Project Title / Campaign Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mobile App Development & Ads Retainer Q3"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Primary Department / Service Type <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={newDepartmentCategory}
                      onChange={(e) => setNewDepartmentCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Ads">Ads (Google, Meta, PPC)</option>
                      <option value="Website">Website Development & SEO</option>
                      <option value="App">Mobile App (iOS / Android)</option>
                      <option value="Social Media">Social Media Management</option>
                      <option value="Video Editing">Video Editing & Content</option>
                      <option value="Design & Creative">Design & Creative UI/UX</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Referred By (Partner / Channel)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Siddharth Verma (Partner)"
                      value={newReferredBy}
                      onChange={(e) => setNewReferredBy(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Dynamic Service Line Items & Customized Rates */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} />
                    Services & Customized Rate Selection
                  </h4>
                  <button
                    type="button"
                    onClick={() => setItemsList([...itemsList, { id: `item-${Date.now()}`, description: '', department: newDepartmentCategory, qty: 1, unitPrice: 25000 }])}
                    className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Service Line
                  </button>
                </div>

                <div className="space-y-2">
                  {itemsList.map((item, idx) => (
                    <div key={item.id || idx} className="grid grid-cols-12 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 items-center">
                      <div className="col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="Service description (e.g. App Development Sprint)"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx].description = e.target.value;
                            setItemsList(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5"
                        />
                      </div>

                      <div className="col-span-3">
                        <select
                          value={item.department}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx].department = e.target.value;
                            setItemsList(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2 py-1.5"
                        >
                          <option value="Ads">Ads</option>
                          <option value="Website">Website</option>
                          <option value="App">App</option>
                          <option value="Social Media">Social Media</option>
                          <option value="Video Editing">Video Editing</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx].qty = Number(e.target.value);
                            setItemsList(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 text-xs font-mono text-center text-white rounded-lg px-2 py-1.5"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min={0}
                          placeholder="Rate (₹)"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const updated = [...itemsList];
                            updated[idx].unitPrice = Number(e.target.value);
                            setItemsList(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 font-bold rounded-lg px-2 py-1.5"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        {itemsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setItemsList(itemsList.filter((_, i) => i !== idx))}
                            className="text-rose-400 hover:text-rose-300 font-bold text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Discount %, GST % & Billing Authority Tag */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  Discount, GST & Billing Authority Approval
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Discount in %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newDiscountPercent}
                      onChange={(e) => setNewDiscountPercent(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-emerald-400 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      GST Rate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={28}
                      value={newGstPercent}
                      onChange={(e) => setNewGstPercent(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-blue-400 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Billing Authority (Name Tag)
                    </label>
                    <select
                      value={newBillingAuthority}
                      onChange={(e) => setNewBillingAuthority(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                    >
                      <option value="Rajesh Malhotra — Director of Billing">Rajesh Malhotra — Director of Billing</option>
                      <option value="Ananya Sharma — Co-Founder & CFO">Ananya Sharma — Co-Founder & CFO</option>
                      <option value="Rohan Gupta — Chief Executive Officer">Rohan Gupta — Chief Executive Officer</option>
                      <option value="Priya Nair — Lead Finance Controller">Priya Nair — Lead Finance Controller</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-xs">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIncludeSignature}
                      onChange={(e) => setNewIncludeSignature(e.target.checked)}
                      className="rounded accent-blue-600 w-4 h-4"
                    />
                    <span>Attach Official Authorized Digital Signature & Stamp on Invoice</span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Generate Invoice Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Billed Invoice Modal (Founder Only) */}
      {editingInvoice && isFounder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Edit2 size={18} />
                Founder Override: Edit Billed Invoice Data
              </h3>
              <button
                onClick={() => setEditingInvoice(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInvoiceEdit} className="space-y-3">
              <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/40 text-xs text-amber-200">
                Editing Invoice: <strong className="font-mono text-white text-sm ml-1">{editingInvoice.invoiceNumber}</strong>
                <p className="text-[11px] text-amber-300/80 mt-1">
                  Founder Privilege: You can adjust billed amounts, issue dates, due dates, or status even after initial billing.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={editProjectName}
                    onChange={(e) => setEditProjectName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={editIssueDate}
                    onChange={(e) => setEditIssueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Total Billed Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editAmountTotal}
                    onChange={(e) => setEditAmountTotal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Paid Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={editAmountTotal}
                    value={editAmountPaid}
                    onChange={(e) => setEditAmountPaid(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Payment Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as InvoiceStatus)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
                >
                  Save Billed Invoice Edits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
