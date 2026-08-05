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
  Settings,
  Sparkles,
} from 'lucide-react';
import { Invoice, LedgerEntry, InvoiceStatus, Employee, AgencyService } from '../../types';
import { formatCurrency, getDaysUntilDue, getInvoiceUrgency } from '../../utils/formatters';

interface ClientFinancialsLedgerProps {
  invoices: Invoice[];
  ledger: LedgerEntry[];
  employees?: Employee[];
  services?: AgencyService[];
  currentEmployee?: Employee;
  onAddInvoice: (inv: Invoice) => void;
  onUpdateInvoice?: (inv: Invoice) => void;
  onDeleteInvoice?: (id: string) => void;
  onRecordPayment: (invoiceId: string, amount: number, method: string, reference: string) => void;
  onPrintInvoice: (inv: Invoice) => void;
  onAddService?: (service: AgencyService) => void;
}

export const ClientFinancialsLedger: React.FC<ClientFinancialsLedgerProps> = ({
  invoices,
  ledger,
  employees = [],
  services = [],
  currentEmployee,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onRecordPayment,
  onPrintInvoice,
  onAddService,
}) => {
  const isFounder = currentEmployee?.adminRole === 'Founder' || (!currentEmployee?.adminRole && currentEmployee?.isAdmin);
  const isCoFounder = currentEmployee?.adminRole === 'Co-Founder';

  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'ledger'>('invoices');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);

  // Agency Service Creation State
  const [srvName, setSrvName] = useState('');
  const [srvDept, setSrvDept] = useState('Ads');
  const [srvPrice, setSrvPrice] = useState<number>(50000);
  const [srvDesc, setSrvDesc] = useState('');

  // Edit Invoice Modal State (Full editing capabilities)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [editClientCompany, setEditClientCompany] = useState('');
  const [editClientAddress, setEditClientAddress] = useState('');
  const [editClientUrl, setEditClientUrl] = useState('');
  const [editClientGstin, setEditClientGstin] = useState('');
  const [editAgencyBranch, setEditAgencyBranch] = useState<'Chandigarh' | 'Lucknow'>('Chandigarh');
  const [editProjectName, setEditProjectName] = useState('');
  const [editDepartmentCategory, setEditDepartmentCategory] = useState('Ads');
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDiscountPercent, setEditDiscountPercent] = useState<number>(0);
  const [editGstPercent, setEditGstPercent] = useState<number>(18);
  const [editBillingAuthority, setEditBillingAuthority] = useState('');
  const [editIncludeSignature, setEditIncludeSignature] = useState<boolean>(true);
  const [editReferredBy, setEditReferredBy] = useState('');
  const [editAmountPaid, setEditAmountPaid] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<InvoiceStatus>('Pending');
  const [editItemsList, setEditItemsList] = useState<{ id: string; serviceId?: string; description: string; department: string; qty: number; unitPrice: number }[]>([]);

  // Delete Invoice Confirmation Modal State
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Helper for dynamic future date (+15 days)
  const getFutureDateFormatted = (days = 15) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Payment Modal State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (NEFT)');
  const [paymentRef, setPaymentRef] = useState('');

  // New Invoice Form State
  const [selectedBilledEmpId, setSelectedBilledEmpId] = useState(currentEmployee?.id || '');
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientUrl, setNewClientUrl] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newDepartmentCategory, setNewDepartmentCategory] = useState('Ads');
  const [newDueDate, setNewDueDate] = useState(getFutureDateFormatted(15));
  const [newDiscountPercent, setNewDiscountPercent] = useState<number>(0);
  const [newGstPercent, setNewGstPercent] = useState<number>(18);

  // Referral Dropdown State
  const [referredByType, setReferredByType] = useState<'EMPLOYEE' | 'CLIENT' | 'CUSTOM'>('EMPLOYEE');
  const [selectedRefEmp, setSelectedRefEmp] = useState('');
  const [selectedRefClient, setSelectedRefClient] = useState('');
  const [customRefText, setCustomRefText] = useState('');

  const [newBillingAuthority, setNewBillingAuthority] = useState('');
  const [newIncludeSignature, setNewIncludeSignature] = useState<boolean>(true);
  const [newClientGstin, setNewClientGstin] = useState('');
  const [newAgencyBranch, setNewAgencyBranch] = useState<'Chandigarh' | 'Lucknow'>('Chandigarh');
  
  // Dynamic line items state with optional serviceId
  const [itemsList, setItemsList] = useState<{ id: string; serviceId?: string; description: string; department: string; qty: number; unitPrice: number }[]>([
    { id: 'item-1', description: 'Google & Meta Ads Campaign Optimization', department: 'Ads', qty: 1, unitPrice: 50000 }
  ]);

  // Unique clients list for referral dropdown
  const uniqueClients = Array.from(new Set(invoices.map((inv) => inv.clientName).filter(Boolean)));

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
    setEditClientName(inv.clientName || '');
    setEditClientCompany(inv.clientCompany || '');
    setEditClientEmail(inv.clientEmail || '');
    setEditClientAddress(inv.clientAddress || '');
    setEditClientUrl(inv.clientUrl || '');
    setEditClientGstin(inv.clientGstin || '');
    setEditAgencyBranch((inv.agencyBranch as 'Chandigarh' | 'Lucknow') || 'Chandigarh');
    setEditProjectName(inv.projectName || '');
    setEditDepartmentCategory(inv.departmentCategory || 'Ads');
    setEditIssueDate(inv.issueDate || new Date().toISOString().split('T')[0]);
    setEditDueDate(inv.dueDate || getFutureDateFormatted(15));
    setEditDiscountPercent(inv.discountPercent || 0);
    setEditGstPercent(inv.gstPercent !== undefined ? inv.gstPercent : 18);
    setEditBillingAuthority(inv.billingAuthority || '');
    setEditIncludeSignature(inv.includeSignature !== false);
    setEditReferredBy(inv.referredBy || '');
    setEditAmountPaid(inv.amountPaid || 0);
    setEditStatus(inv.status || 'Pending');
    setEditItemsList(
      inv.items && inv.items.length > 0
        ? inv.items.map((it, idx) => ({
            id: it.id || `edit-item-${idx}-${Date.now()}`,
            description: it.description || '',
            department: it.department || 'Ads',
            qty: it.qty || 1,
            unitPrice: it.unitPrice || 0,
          }))
        : [{ id: 'edit-item-1', description: 'Digital Marketing Services', department: 'Ads', qty: 1, unitPrice: 50000 }]
    );
  };

  const handleSaveInvoiceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    const rawSubtotal = editItemsList.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const discAmt = (rawSubtotal * (editDiscountPercent || 0)) / 100;
    const afterDisc = Math.max(0, rawSubtotal - discAmt);
    const gstAmt = (afterDisc * (editGstPercent || 0)) / 100;
    const finalGrandTotal = Math.round(afterDisc + gstAmt);
    const pending = Math.max(0, finalGrandTotal - editAmountPaid);

    let computedStatus: InvoiceStatus = editStatus;
    if (pending === 0 && finalGrandTotal > 0) {
      computedStatus = 'Paid';
    } else if (editAmountPaid > 0 && pending > 0) {
      computedStatus = 'Partial';
    }

    const updated: Invoice = {
      ...editingInvoice,
      clientName: editClientName.trim(),
      clientCompany: editClientCompany.trim(),
      clientEmail: editClientEmail.trim(),
      clientAddress: editClientAddress.trim(),
      clientUrl: editClientUrl.trim(),
      clientGstin: editClientGstin.trim(),
      agencyBranch: editAgencyBranch,
      projectName: editProjectName.trim(),
      departmentCategory: editDepartmentCategory,
      issueDate: editIssueDate,
      dueDate: editDueDate,
      subtotalAmount: rawSubtotal,
      discountPercent: editDiscountPercent,
      discountAmount: discAmt,
      gstPercent: editGstPercent,
      gstAmount: gstAmt,
      amountTotal: finalGrandTotal,
      amountPaid: editAmountPaid,
      amountPending: pending,
      status: computedStatus,
      items: editItemsList.map((item) => ({
        ...item,
        total: item.qty * item.unitPrice,
      })),
      referredBy: editReferredBy.trim(),
      billingAuthority: editBillingAuthority.trim(),
      includeSignature: editIncludeSignature,
      signatoryName: editBillingAuthority ? editBillingAuthority.split('—')[0]?.trim() : 'Rajesh Malhotra',
      signatoryTitle: editBillingAuthority ? (editBillingAuthority.split('—')[1]?.trim() || 'Billing Lead') : 'Director of Billing',
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

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName) return;
    const newSrv: AgencyService = {
      id: `srv-${Date.now()}`,
      name: srvName,
      department: srvDept,
      defaultPrice: Number(srvPrice) || 0,
      description: srvDesc,
      createdDate: new Date().toISOString().split('T')[0],
    };
    if (onAddService) {
      onAddService(newSrv);
    }
    setSrvName('');
    setSrvDesc('');
    setShowServiceModal(false);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newProjectName) return;

    // Resolve Referred By Value
    let finalReferredBy = '';
    if (referredByType === 'EMPLOYEE' && selectedRefEmp) {
      finalReferredBy = selectedRefEmp;
    } else if (referredByType === 'CLIENT' && selectedRefClient) {
      finalReferredBy = selectedRefClient;
    } else {
      finalReferredBy = customRefText;
    }

    // Resolve Billed / Signatory Authority
    let finalBilledAuth = newBillingAuthority;
    const matchedEmp = employees.find((emp) => emp.id === selectedBilledEmpId);
    if (matchedEmp) {
      finalBilledAuth = `${matchedEmp.name} — ${matchedEmp.role || 'Billing Lead'}`;
    }

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
      clientName: newClientName.trim(),
      clientEmail: newClientEmail ? newClientEmail.trim() : '',
      clientCompany: newClientCompany ? newClientCompany.trim() : '',
      clientAddress: newClientAddress ? newClientAddress.trim() : '',
      clientUrl: newClientUrl ? newClientUrl.trim() : '',
      clientGstin: newClientGstin ? newClientGstin.trim() : '',
      projectName: newProjectName.trim(),
      departmentCategory: newDepartmentCategory,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newDueDate || getFutureDateFormatted(15),
      subtotalAmount: rawSubtotal,
      discountPercent: Number(newDiscountPercent) || 0,
      discountAmount: discAmt,
      gstPercent: Number(newGstPercent) || 0,
      gstAmount: gstAmt,
      amountTotal: finalGrandTotal,
      amountPaid: 0,
      amountPending: finalGrandTotal,
      status: 'Pending',
      items: formattedItems,
      referredBy: finalReferredBy ? finalReferredBy.trim() : '',
      billingAuthority: finalBilledAuth ? finalBilledAuth.trim() : '',
      agencyBranch: newAgencyBranch,
      includeSignature: newIncludeSignature,
      signatoryName: finalBilledAuth ? finalBilledAuth.split('—')[0]?.trim() : 'Rajesh Malhotra',
      signatoryTitle: finalBilledAuth ? (finalBilledAuth.split('—')[1]?.trim() || 'Billing Lead') : 'Director of Billing',
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
    setSelectedRefEmp('');
    setSelectedRefClient('');
    setCustomRefText('');
    setItemsList([{ id: 'item-1', description: 'Google & Meta Ads Campaign Optimization', department: 'Ads', qty: 1, unitPrice: 50000 }]);
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
              ? 'bg-gradient-to-r from-rose-600 to-rose-700 border border-rose-500 text-white shadow-md animate-blink-due hover:brightness-105'
              : 'bg-slate-900 border border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-rose-200 flex items-center gap-1">
              <AlertTriangle size={15} className="animate-bounce text-amber-300" />
              Due Date Alert System
            </span>
            <span className="w-3 h-3 rounded-full bg-rose-400 animate-ping"></span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {totalUrgentCount} Urgent Action Required
          </p>
          <div className="text-xs font-bold text-rose-100 mt-2 flex items-center justify-between">
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
                className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
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

            {/* Manage Services Catalog Button */}
            <button
              onClick={() => setShowServiceModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <Settings size={15} />
              Manage Services ({services.length})
            </button>
          </div>
        </div>

        {activeSubTab === 'invoices' ? (
          <div>
            {/* Status Filter Chips */}
            <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
              <span className="text-xs text-slate-500 font-bold flex items-center gap-1 mr-2">
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
                        : 'bg-blue-600 text-white shadow-sm'
                      : f.special
                      ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-semibold'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto mt-2 rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider bg-slate-100/90">
                    <th className="py-3.5 px-4 align-middle w-[20%]">Invoice # & Client</th>
                    <th className="py-3.5 px-4 align-middle w-[18%]">Project</th>
                    <th className="py-3.5 px-4 align-middle w-[15%]">Due Date</th>
                    <th className="py-3.5 px-4 align-middle w-[14%]">Total Amount</th>
                    <th className="py-3.5 px-4 align-middle w-[16%]">Paid vs Pending</th>
                    <th className="py-3.5 px-4 align-middle w-[12%]">Status</th>
                    <th className="py-3.5 px-4 align-middle text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs align-middle bg-white">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500 font-medium">
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
                          className={`hover:bg-slate-50 transition-colors ${
                            urgency === 'OVERDUE'
                              ? 'bg-rose-50/70'
                              : urgency === 'DUE_SOON'
                              ? 'bg-amber-50/70'
                              : ''
                          }`}
                        >
                          {/* Invoice # & Client */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 font-mono text-sm">
                              {inv.invoiceNumber}
                            </div>
                            <div className="text-slate-800 font-bold mt-0.5">{inv.clientName}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{inv.clientEmail}</div>
                            {inv.departmentCategory && (
                              <span className="inline-block mt-1 text-[9px] font-extrabold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Dept: {inv.departmentCategory}
                              </span>
                            )}
                          </td>

                          {/* Project */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-900 font-semibold max-w-[180px] truncate">
                              {inv.projectName}
                            </div>
                            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                              Issued: {inv.issueDate}
                            </div>
                          </td>

                          {/* Due Date & Days Count */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Calendar size={13} className="text-slate-500" />
                              {inv.dueDate}
                            </div>
                            {inv.status !== 'Paid' && (
                              <div
                                className={`text-[10px] font-bold mt-0.5 ${
                                  daysLeft < 0
                                    ? 'text-rose-600'
                                    : daysLeft <= 3
                                    ? 'text-amber-600'
                                    : 'text-slate-500'
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
                          <td className="py-3.5 px-4 font-black text-slate-900 font-mono text-sm">
                            {formatCurrency(inv.amountTotal)}
                          </td>

                          {/* Paid vs Pending Breakdown */}
                          <td className="py-3.5 px-4">
                            <div className="text-emerald-700 font-bold text-xs">
                              Paid: {formatCurrency(inv.amountPaid)}
                            </div>
                            <div
                              className={`font-bold font-mono text-xs ${
                                inv.amountPending > 0 ? 'text-rose-600' : 'text-slate-400'
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
                                className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                                  inv.status === 'Paid'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : inv.status === 'Overdue'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                                    : inv.status === 'Partial'
                                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {inv.amountPending > 0 && (
                                <button
                                  onClick={() => handleOpenPaymentModal(inv)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                                >
                                  <DollarSign size={13} />
                                  Record Payment
                                </button>
                              )}

                              <button
                                onClick={() => onPrintInvoice(inv)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
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
                                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-colors flex items-center gap-1 shadow-sm"
                                    title="Founder Override: Edit Billed Invoice, Dates & Amounts"
                                  >
                                    <Edit2 size={13} />
                                    Edit
                                  </button>
                                  {onDeleteInvoice && (
                                    <button
                                      onClick={() => setInvoiceToDelete(inv)}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-rose-200"
                                      title="Delete Invoice"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span 
                                  className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-not-allowed select-none"
                                  title="Locked: Only Founder can modify issued invoice dates, amounts, or payment entries after billing"
                                >
                                  <Lock size={12} className="text-amber-500" />
                                  Locked
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
          <div className="overflow-x-auto mt-4 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" />
              Company Revenue & Transaction Ledger Log
            </h4>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider bg-slate-100">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Client / Account</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-800 bg-white">
                {ledger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-600">{item.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.clientName}</td>
                    <td className="py-3 px-4 text-slate-700">{item.description}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                          item.type.includes('Credit')
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{item.referenceNo}</td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-black text-sm ${
                        item.type.includes('Credit') ? 'text-emerald-700' : 'text-rose-700'
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-emerald-700 flex items-center gap-2">
                <DollarSign size={18} />
                Record Client Payment
              </h3>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <p className="text-slate-500 font-medium">Invoice Number:</p>
                <p className="font-mono font-bold text-slate-900">{paymentModalInvoice.invoiceNumber}</p>
                <p className="text-slate-500 font-medium mt-1">Client Name:</p>
                <p className="font-bold text-slate-800">{paymentModalInvoice.clientName}</p>
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-600 font-medium">Current Outstanding:</span>
                  <span className="font-mono font-bold text-rose-600">
                    {formatCurrency(paymentModalInvoice.amountPending)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount Received (₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentModalInvoice.amountPending}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 text-sm font-mono font-bold text-emerald-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-600"
                >
                  <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                  <option value="RTGS Transfer">RTGS Transfer</option>
                  <option value="UPI / Razorpay">UPI / Razorpay</option>
                  <option value="Cheque Deposit">Cheque Deposit</option>
                  <option value="IMPS Transfer">IMPS Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reference / UTR / Transaction No.
                </label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. UTR1234567890"
                  className="w-full bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus size={18} className="text-blue-600" />
                  Generate Comprehensive Invoice Form
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Specify client contact, department services, rate customization, GST & authorized billing details</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {/* Section 1: Client & Contact Person Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} />
                  Client & Contact Information
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Contact Person Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Sharma"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Company / Organization Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Technologies Pvt Ltd"
                      value={newClientCompany}
                      onChange={(e) => setNewClientCompany(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Client Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. billing@apexglobal.com"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Website / URL (if available)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://apexglobal.com"
                      value={newClientUrl}
                      onChange={(e) => setNewClientUrl(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Office / Billing Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot 42, Sector 44, Cyber City, Gurugram"
                      value={newClientAddress}
                      onChange={(e) => setNewClientAddress(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Client GSTIN / Tax Identification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 07AACCA1234F1Z5"
                      value={newClientGstin}
                      onChange={(e) => setNewClientGstin(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">
                    🏢 TopRank Agency Branch Address (Printed on Invoice Header) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newAgencyBranch}
                    onChange={(e) => setNewAgencyBranch(e.target.value as 'Chandigarh' | 'Lucknow')}
                    className="w-full bg-white border border-amber-300 text-xs text-amber-900 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Chandigarh">
                      📍 Chandigarh Branch: Shop No. 8, Sector 34B, Sector 34, Chandigarh, 160022
                    </option>
                    <option value="Lucknow">
                      📍 Lucknow Branch: Sulabh Awas, A47/32, Apartments, Sector 01, Gomti Nagar, Lucknow, UP 226010
                    </option>
                  </select>
                </div>
              </div>

              {/* Section 2: Department, Project Scope, Billed Employee & Referral Dropdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building size={14} />
                  Project Scope, Staff Biller & Referral Source
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Project Title / Campaign Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mobile App Development & Ads Retainer Q3"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Assigned Employee / Billing Lead <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedBilledEmpId}
                      onChange={(e) => setSelectedBilledEmpId(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 font-semibold"
                    >
                      <option value="">-- Choose Staff Biller --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          👤 {emp.name} ({emp.role || emp.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Primary Department Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newDepartmentCategory}
                      onChange={(e) => setNewDepartmentCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 font-semibold"
                    >
                      <option value="Ads">Ads (Google, Meta, PPC)</option>
                      <option value="Website">Website Development & SEO</option>
                      <option value="App">Mobile App (iOS / Android)</option>
                      <option value="Social Media">Social Media Management</option>
                      <option value="Video Editing">Video Editing & Content</option>
                      <option value="Design & Creative">Design & Creative UI/UX</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 font-semibold"
                    />
                  </div>
                </div>

                {/* Referred By Dropdown Section */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <span>Referred By (Partner / Employee / Client)</span>
                    </label>
                    <div className="flex items-center gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setReferredByType('EMPLOYEE')}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          referredByType === 'EMPLOYEE' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Employee
                      </button>
                      <button
                        type="button"
                        onClick={() => setReferredByType('CLIENT')}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          referredByType === 'CLIENT' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Client
                      </button>
                      <button
                        type="button"
                        onClick={() => setReferredByType('CUSTOM')}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          referredByType === 'CUSTOM' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Custom Text
                      </button>
                    </div>
                  </div>

                  {referredByType === 'EMPLOYEE' && (
                    <select
                      value={selectedRefEmp}
                      onChange={(e) => setSelectedRefEmp(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 font-semibold"
                    >
                      <option value="">-- Choose Referring Employee --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={`${emp.name} (${emp.role})`}>
                          👤 {emp.name} — {emp.role || emp.department}
                        </option>
                      ))}
                    </select>
                  )}

                  {referredByType === 'CLIENT' && (
                    <select
                      value={selectedRefClient}
                      onChange={(e) => setSelectedRefClient(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 font-semibold"
                    >
                      <option value="">-- Choose Referring Client --</option>
                      {uniqueClients.map((client, idx) => (
                        <option key={idx} value={`${client} (Client Referral)`}>
                          🏢 {client}
                        </option>
                      ))}
                    </select>
                  )}

                  {referredByType === 'CUSTOM' && (
                    <input
                      type="text"
                      placeholder="Type referral source name (e.g. Siddharth Verma - External Partner)"
                      value={customRefText}
                      onChange={(e) => setCustomRefText(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600 font-medium placeholder:text-slate-400"
                    />
                  )}
                </div>
              </div>

              {/* Section 3: Dynamic Service Dropdown & Customized Rates */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={14} />
                      Services Dropdown & Custom Pricing
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">Pick pre-configured services from catalog or type custom pricing</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowServiceModal(true)}
                      className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus size={11} /> + Create Service
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemsList([...itemsList, { id: `item-${Date.now()}`, description: '', department: newDepartmentCategory, qty: 1, unitPrice: 25000 }])}
                      className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus size={11} /> + Add Line Item
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {itemsList.map((item, idx) => (
                    <div key={item.id || idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        {/* Service Dropdown Selection */}
                        <div className="col-span-12 md:col-span-6">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Select Service from Catalog:
                          </label>
                          <select
                            value={item.serviceId || ''}
                            onChange={(e) => {
                              const selectedSrvId = e.target.value;
                              const srv = services.find((s) => s.id === selectedSrvId);
                              const updated = [...itemsList];
                              if (srv) {
                                updated[idx] = {
                                  ...updated[idx],
                                  serviceId: srv.id,
                                  description: srv.name,
                                  department: srv.department || 'Ads',
                                  unitPrice: srv.defaultPrice || 0,
                                };
                              } else {
                                updated[idx] = { ...updated[idx], serviceId: '' };
                              }
                              setItemsList(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 font-semibold"
                          >
                            <option value="">-- Choose Agency Service Dropdown --</option>
                            {services.map((srv) => (
                              <option key={srv.id} value={srv.id}>
                                {srv.name} ({srv.department}) — ₹{srv.defaultPrice?.toLocaleString('en-IN')}
                              </option>
                            ))}
                            <option value="CUSTOM">✍️ Custom Line Item Title</option>
                          </select>
                        </div>

                        <div className="col-span-12 md:col-span-6">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Line Item Description / Title:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...itemsList];
                              updated[idx].description = e.target.value;
                              setItemsList(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Category</label>
                          <select
                            value={item.department}
                            onChange={(e) => {
                              const updated = [...itemsList];
                              updated[idx].department = e.target.value;
                              setItemsList(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-lg px-2 py-1.5 font-medium"
                          >
                            <option value="Ads">Ads</option>
                            <option value="Website">Website</option>
                            <option value="App">App</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Video Editing">Video Editing</option>
                            <option value="Design & Creative">Design & Creative</option>
                          </select>
                        </div>

                        <div className="col-span-3">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Quantity</label>
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
                            className="w-full bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-center text-slate-900 rounded-lg px-2 py-1.5"
                          />
                        </div>

                        <div className="col-span-4">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Custom Price Rate (₹)</label>
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
                            className="w-full bg-slate-50 border border-slate-300 text-xs font-mono text-emerald-700 font-extrabold rounded-lg px-2 py-1.5"
                          />
                        </div>

                        <div className="col-span-1 text-center pt-3">
                          {itemsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setItemsList(itemsList.filter((_, i) => i !== idx))}
                              className="text-rose-600 hover:text-rose-800 font-bold text-xs p-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Discount %, GST % & Billing Authority Tag */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  Discount, GST & Signatory Stamp Approval
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Discount in %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newDiscountPercent}
                      onChange={(e) => setNewDiscountPercent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 text-xs font-mono font-bold text-emerald-700 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      GST Rate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={28}
                      value={newGstPercent}
                      onChange={(e) => setNewGstPercent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 text-xs font-mono font-bold text-blue-700 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Signatory Tag Header
                    </label>
                    <input
                      type="text"
                      value={newBillingAuthority}
                      onChange={(e) => setNewBillingAuthority(e.target.value)}
                      placeholder="e.g. Rajesh Malhotra — Director of Billing"
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
                  <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
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
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Generate Invoice Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Billed Invoice Modal (Full Editing Capabilities) */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 text-slate-900 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-amber-700 flex items-center gap-2">
                  <Edit2 size={18} />
                  Edit Invoice #{editingInvoice.invoiceNumber}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Update any field: client info, branch address, deliverables, taxes, referral, signature stamp & status.
                </p>
              </div>
              <button
                onClick={() => setEditingInvoice(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInvoiceEdit} className="space-y-4">
              {/* Section 1: Client & Agency Branch Information */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} />
                  1. Client & Agency Branch Info
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Client Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editClientName}
                      onChange={(e) => setEditClientName(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Company Name / Brand
                    </label>
                    <input
                      type="text"
                      value={editClientCompany}
                      onChange={(e) => setEditClientCompany(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Client Email Address
                    </label>
                    <input
                      type="email"
                      value={editClientEmail}
                      onChange={(e) => setEditClientEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Client GSTIN Number
                    </label>
                    <input
                      type="text"
                      value={editClientGstin}
                      onChange={(e) => setEditClientGstin(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Client Office Address
                    </label>
                    <input
                      type="text"
                      value={editClientAddress}
                      onChange={(e) => setEditClientAddress(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Client Website URL
                    </label>
                    <input
                      type="text"
                      value={editClientUrl}
                      onChange={(e) => setEditClientUrl(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-800 mb-1">
                    🏢 TopRank Agency Branch Address (Printed on Invoice) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editAgencyBranch}
                    onChange={(e) => setEditAgencyBranch(e.target.value as 'Chandigarh' | 'Lucknow')}
                    className="w-full bg-white border border-amber-300 text-xs text-amber-900 font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Chandigarh">
                      📍 Chandigarh Branch: Shop No. 8, Sector 34B, Sector 34, Chandigarh, 160022
                    </option>
                    <option value="Lucknow">
                      📍 Lucknow Branch: Sulabh Awas, A47/32, Apartments, Sector 01, Gomti Nagar, Lucknow, UP 226010
                    </option>
                  </select>
                </div>
              </div>

              {/* Section 2: Department, Project Scope, Dates & Referral */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} />
                  2. Campaign Scope & Dates
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Project Scope Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Department Category
                    </label>
                    <select
                      value={editDepartmentCategory}
                      onChange={(e) => setEditDepartmentCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    >
                      <option value="Ads">Ads (Google & Meta PPC)</option>
                      <option value="Website">Website & SEO</option>
                      <option value="App">Mobile App Development</option>
                      <option value="Social Media">Social Media Management</option>
                      <option value="Video Editing">Video Editing & Reels</option>
                      <option value="Design & Creative">Design & UI/UX</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Issue Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={editIssueDate}
                      onChange={(e) => setEditIssueDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Payment Due Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Referred By Partner
                    </label>
                    <input
                      type="text"
                      value={editReferredBy}
                      onChange={(e) => setEditReferredBy(e.target.value)}
                      placeholder="e.g. Employee or Client Referral"
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Deliverables & Items Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} />
                    3. Billed Deliverables & Line Items ({editItemsList.length})
                  </h4>

                  <button
                    type="button"
                    onClick={() =>
                      setEditItemsList([
                        ...editItemsList,
                        {
                          id: `edit-item-${Date.now()}`,
                          description: 'Custom Service Scope',
                          department: 'Ads',
                          qty: 1,
                          unitPrice: 10000,
                        },
                      ])
                    }
                    className="bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 text-xs px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Line Item
                  </button>
                </div>

                {/* Preset Catalog Insert Option */}
                {services.length > 0 && (
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2 text-xs">
                    <span className="text-slate-600 font-bold shrink-0">➕ Quick Insert Catalog Service:</span>
                    <select
                      onChange={(e) => {
                        const srv = services.find((s) => s.id === e.target.value);
                        if (srv) {
                          setEditItemsList([
                            ...editItemsList,
                            {
                              id: `edit-item-${Date.now()}`,
                              serviceId: srv.id,
                              description: srv.name,
                              department: srv.department,
                              qty: 1,
                              unitPrice: srv.defaultPrice || 50000,
                            },
                          ]);
                        }
                        e.target.value = '';
                      }}
                      defaultValue=""
                      className="bg-slate-50 border border-slate-300 text-amber-800 font-bold rounded-lg px-2 py-1 text-xs focus:outline-none"
                    >
                      <option value="" disabled>-- Select Preset Agency Service --</option>
                      {services.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} ({srv.department}) - ₹{srv.defaultPrice?.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  {editItemsList.map((item, idx) => (
                    <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Description</label>
                          <input
                            type="text"
                            required
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...editItemsList];
                              updated[idx].description = e.target.value;
                              setEditItemsList(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-lg px-2 py-1.5 font-medium"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Department</label>
                          <select
                            value={item.department}
                            onChange={(e) => {
                              const updated = [...editItemsList];
                              updated[idx].department = e.target.value;
                              setEditItemsList(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 text-[11px] text-slate-900 rounded-lg px-2 py-1.5 font-medium"
                          >
                            <option value="Ads">Ads</option>
                            <option value="Website">Website</option>
                            <option value="App">App</option>
                            <option value="Social Media">Social</option>
                            <option value="Video Editing">Video</option>
                            <option value="Design & Creative">Design</option>
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Qty</label>
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) => {
                              const updated = [...editItemsList];
                              updated[idx].qty = Number(e.target.value);
                              setEditItemsList(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-center text-slate-900 rounded-lg px-2 py-1.5"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Rate (₹)</label>
                          <input
                            type="number"
                            min={0}
                            value={item.unitPrice}
                            onChange={(e) => {
                              const updated = [...editItemsList];
                              updated[idx].unitPrice = Number(e.target.value);
                              setEditItemsList(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-300 text-xs font-mono text-emerald-700 font-extrabold rounded-lg px-2 py-1.5"
                          />
                        </div>

                        <div className="col-span-1 text-center pt-3">
                          {editItemsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setEditItemsList(editItemsList.filter((_, i) => i !== idx))}
                              className="text-rose-600 hover:text-rose-800 font-bold text-xs p-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Discount, GST, Signature, Paid Amount & Status */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  4. Discount, GST, Stamp & Payment Overrides
                </h4>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editDiscountPercent}
                      onChange={(e) => setEditDiscountPercent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 text-xs font-mono font-bold text-emerald-700 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      GST Rate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={28}
                      value={editGstPercent}
                      onChange={(e) => setEditGstPercent(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 text-xs font-mono font-bold text-blue-700 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Amount Paid (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editAmountPaid}
                      onChange={(e) => setEditAmountPaid(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 text-xs font-mono font-bold text-emerald-700 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Invoice Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as InvoiceStatus)}
                      className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600 font-bold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Signatory Header Tag
                  </label>
                  <input
                    type="text"
                    value={editBillingAuthority}
                    onChange={(e) => setEditBillingAuthority(e.target.value)}
                    placeholder="e.g. Rajesh Malhotra — Director of Billing"
                    className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-600 font-medium"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
                  <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIncludeSignature}
                      onChange={(e) => setEditIncludeSignature(e.target.checked)}
                      className="rounded accent-blue-600 w-4 h-4"
                    />
                    <span>Attach Official Authorized Digital Signature & Stamp on Invoice</span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  Save Billed Invoice Edits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Invoice Confirmation Modal */}
      {invoiceToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <Trash2 size={18} />
                Delete Invoice Confirmation
              </h3>
              <button
                onClick={() => setInvoiceToDelete(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 font-medium">
                Are you sure you want to permanently delete this invoice? This action will remove the record from billing and financials.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <p className="font-mono font-bold text-slate-900 text-sm">
                  Invoice #: <span className="text-blue-700">{invoiceToDelete.invoiceNumber}</span>
                </p>
                <p className="text-slate-700 font-medium">Client: {invoiceToDelete.clientName}</p>
                <p className="text-slate-700 font-medium">Project: {invoiceToDelete.projectName}</p>
                <p className="text-emerald-700 font-mono font-extrabold pt-1">
                  Total Billed: {formatCurrency(invoiceToDelete.amountTotal)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-5">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteInvoice && invoiceToDelete) {
                    onDeleteInvoice(invoiceToDelete.id);
                  }
                  setInvoiceToDelete(null);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                Yes, Delete Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Manage & Create Services Catalog Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-purple-200 rounded-2xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-purple-800 flex items-center gap-2">
                  <Settings size={18} className="text-purple-600" />
                  Admin Agency Services Catalog & Pricing
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Create agency services stored in Supabase. These automatically populate the invoice generator dropdown.
                </p>
              </div>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Create Service Form */}
            <form onSubmit={handleCreateService} className="bg-purple-50/50 p-4 rounded-xl border border-purple-200 space-y-3 mb-5">
              <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-600" />
                + Create New Agency Service (Stores to Supabase)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Service Name / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Chatbot Integration Sprint"
                    value={srvName}
                    onChange={(e) => setSrvName(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Department Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={srvDept}
                    onChange={(e) => setSrvDept(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                  >
                    <option value="Ads">Ads (Google & Meta PPC)</option>
                    <option value="Website">Website & SEO</option>
                    <option value="App">Mobile App Development</option>
                    <option value="Social Media">Social Media Management</option>
                    <option value="Video Editing">Video Editing & Reels</option>
                    <option value="Design & Creative">Design & UI/UX</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Default Rate Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 75000"
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 text-xs font-mono font-bold text-emerald-700 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Service Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief scope summary"
                    value={srvDesc}
                    onChange={(e) => setSrvDesc(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-xs text-slate-900 font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Save Service to Supabase
                </button>
              </div>
            </form>

            {/* List of Existing Services */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen size={14} className="text-blue-600" />
                Active Services Catalog ({services.length})
              </h4>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{srv.name}</span>
                        <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold border border-purple-200">
                          {srv.department}
                        </span>
                      </div>
                      {srv.description && (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{srv.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-700 font-mono font-bold text-xs">
                        ₹{srv.defaultPrice?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
