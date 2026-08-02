import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Briefcase,
  Search,
  PieChart as PieIcon,
  Filter,
  Layers,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  UserCheck,
  Sparkles,
  Award,
  Wallet,
  Building2,
  ChevronRight,
  X,
  CreditCard,
  Percent,
  Download
} from 'lucide-react';
import { Employee, Invoice, LedgerEntry, Project } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface BusinessAnalyticsProps {
  employees: Employee[];
  invoices: Invoice[];
  ledger: LedgerEntry[];
  projects: Project[];
}

export const BusinessAnalytics: React.FC<BusinessAnalyticsProps> = ({
  employees,
  invoices,
  ledger,
  projects,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'employees_sales' | 'sales_expenses' | 'salary_payroll' | 'services_wise' | 'referral_search'>('employees_sales');
  
  // Search state for referral / employee search
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal state to inspect specific employee / referral partner invoices
  const [inspectPartner, setInspectPartner] = useState<{
    name: string;
    type: 'Employee' | 'Referred By Partner';
    invoices: Invoice[];
  } | null>(null);

  // --- 1. KEY FINANCIAL CALCULATIONS ---
  const financialTotals = useMemo(() => {
    const totalSalesBilled = invoices.reduce((sum, inv) => sum + (inv.amountTotal || 0), 0);
    const totalSalesPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalSalesPending = invoices.reduce((sum, inv) => sum + (inv.amountPending || 0), 0);

    // Expenses / Expansion from Ledger & Projects
    const totalLedgerDebits = ledger
      .filter((l) => l.type === 'Debit (Project Expense)')
      .reduce((sum, l) => sum + (l.amount || 0), 0);
    
    const totalProjectSpent = projects.reduce((sum, p) => sum + (p.spentBudget || 0), 0);
    const totalExpansionExpenses = Math.max(totalLedgerDebits, totalProjectSpent);

    // Monthly Salary Payroll Commitment
    const totalMonthlyPayroll = employees.reduce((sum, emp) => {
      const rate = emp.hourlyRate || 500;
      return sum + (rate * 160); // Standard 160 hours/month base
    }, 0);

    const netProfit = totalSalesPaid - totalExpansionExpenses - totalMonthlyPayroll;
    const profitMargin = totalSalesPaid > 0 ? Math.round((netProfit / totalSalesPaid) * 100) : 0;

    return {
      totalSalesBilled,
      totalSalesPaid,
      totalSalesPending,
      totalExpansionExpenses,
      totalMonthlyPayroll,
      netProfit,
      profitMargin,
    };
  }, [invoices, ledger, projects, employees]);

  // --- 2. EMPLOYEE & REFERRAL SALES BREAKDOWN ---
  const employeeAndReferralSales = useMemo(() => {
    const map = new Map<string, {
      name: string;
      email?: string;
      type: 'Employee' | 'Referred By Partner';
      totalBilled: number;
      totalPaid: number;
      totalPending: number;
      invoiceCount: number;
      invoices: Invoice[];
      department?: string;
      role?: string;
    }>();

    // A. Map by Billed Employee / Referred By from Invoices
    invoices.forEach((inv) => {
      // 1. Check Referred By tag
      if (inv.referredBy && inv.referredBy.trim() !== '') {
        const refName = inv.referredBy.trim();
        const key = `ref:${refName.toLowerCase()}`;
        const existing = map.get(key) || {
          name: refName,
          type: 'Referred By Partner',
          totalBilled: 0,
          totalPaid: 0,
          totalPending: 0,
          invoiceCount: 0,
          invoices: [],
        };
        existing.totalBilled += inv.amountTotal || 0;
        existing.totalPaid += inv.amountPaid || 0;
        existing.totalPending += inv.amountPending || 0;
        existing.invoiceCount += 1;
        existing.invoices.push(inv);
        map.set(key, existing);
      }

      // 2. Check Billing Authority / Lead Employee if matched with employees
      if (inv.billingAuthority && inv.billingAuthority.trim() !== '') {
        const authName = inv.billingAuthority.trim();
        const empMatch = employees.find((e) => e.name.toLowerCase() === authName.toLowerCase());
        if (empMatch) {
          const key = `emp:${empMatch.id}`;
          const existing = map.get(key) || {
            name: empMatch.name,
            email: empMatch.email,
            type: 'Employee',
            totalBilled: 0,
            totalPaid: 0,
            totalPending: 0,
            invoiceCount: 0,
            invoices: [],
            department: empMatch.department,
            role: empMatch.role,
          };
          existing.totalBilled += inv.amountTotal || 0;
          existing.totalPaid += inv.amountPaid || 0;
          existing.totalPending += inv.amountPending || 0;
          existing.invoiceCount += 1;
          existing.invoices.push(inv);
          map.set(key, existing);
        }
      }
    });

    // B. Include all active employees so none are missing
    employees.forEach((emp) => {
      const key = `emp:${emp.id}`;
      if (!map.has(key)) {
        // Find any invoices matching employee name in projectName or description or lead
        const empInvoices = invoices.filter(
          (inv) =>
            inv.billingAuthority?.toLowerCase() === emp.name.toLowerCase() ||
            inv.referredBy?.toLowerCase() === emp.name.toLowerCase()
        );
        const billed = empInvoices.reduce((s, i) => s + (i.amountTotal || 0), 0);
        const paid = empInvoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
        const pending = empInvoices.reduce((s, i) => s + (i.amountPending || 0), 0);

        map.set(key, {
          name: emp.name,
          email: emp.email,
          type: 'Employee',
          totalBilled: billed,
          totalPaid: paid,
          totalPending: pending,
          invoiceCount: empInvoices.length,
          invoices: empInvoices,
          department: emp.department,
          role: emp.role,
        });
      }
    });

    const list = Array.from(map.values());
    // Sort by Total Billed descending
    list.sort((a, b) => b.totalBilled - a.totalBilled);
    return list;
  }, [invoices, employees]);

  // Filtered employees & referrals based on search input
  const filteredSalesData = useMemo(() => {
    if (!searchQuery.trim()) return employeeAndReferralSales;
    const q = searchQuery.toLowerCase();
    return employeeAndReferralSales.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q)) ||
        (item.role && item.role.toLowerCase().includes(q))
    );
  }, [employeeAndReferralSales, searchQuery]);

  // --- 3. SERVICE-WISE REVENUE BREAKDOWN ---
  const serviceWiseBreakdown = useMemo(() => {
    const serviceMap = new Map<string, {
      serviceName: string;
      totalBilled: number;
      totalPaid: number;
      totalPending: number;
      itemCount: number;
      invoiceCount: number;
    }>();

    invoices.forEach((inv) => {
      const primaryCategory = inv.departmentCategory || 'General Marketing & IT';

      // Aggregate from individual items if available
      if (inv.items && inv.items.length > 0) {
        inv.items.forEach((item) => {
          const dept = item.department || primaryCategory;
          const existing = serviceMap.get(dept) || {
            serviceName: dept,
            totalBilled: 0,
            totalPaid: 0,
            totalPending: 0,
            itemCount: 0,
            invoiceCount: 0,
          };
          const itemTotal = item.total || (item.qty * item.unitPrice) || 0;
          existing.totalBilled += itemTotal;
          // Approximate paid ratio based on invoice paid ratio
          const paidRatio = inv.amountTotal > 0 ? (inv.amountPaid / inv.amountTotal) : 0;
          existing.totalPaid += itemTotal * paidRatio;
          existing.totalPending += itemTotal * (1 - paidRatio);
          existing.itemCount += item.qty || 1;
          existing.invoiceCount += 1;
          serviceMap.set(dept, existing);
        });
      } else {
        // Fallback to primary category
        const existing = serviceMap.get(primaryCategory) || {
          serviceName: primaryCategory,
          totalBilled: 0,
          totalPaid: 0,
          totalPending: 0,
          itemCount: 0,
          invoiceCount: 0,
        };
        existing.totalBilled += inv.amountTotal || 0;
        existing.totalPaid += inv.amountPaid || 0;
        existing.totalPending += inv.amountPending || 0;
        existing.itemCount += 1;
        existing.invoiceCount += 1;
        serviceMap.set(primaryCategory, existing);
      }
    });

    const list = Array.from(serviceMap.values());
    list.sort((a, b) => b.totalBilled - a.totalBilled);

    const totalAllBilled = list.reduce((s, item) => s + item.totalBilled, 0) || 1;

    return list.map((item) => ({
      ...item,
      percentage: Math.round((item.totalBilled / totalAllBilled) * 100),
    }));
  }, [invoices]);

  // --- 4. SALARY & PAYROLL TRACKING DATA ---
  const payrollList = useMemo(() => {
    return employees.map((emp) => {
      const rate = emp.hourlyRate || 500;
      const estimatedMonthlySalary = rate * 160;
      
      // Calculate revenue brought by this employee
      const empSales = employeeAndReferralSales.find((item) => item.name.toLowerCase() === emp.name.toLowerCase());
      const totalSalesBilled = empSales ? empSales.totalBilled : 0;
      const totalSalesPaid = empSales ? empSales.totalPaid : 0;
      
      // Revenue ROI Ratio = Total Sales Paid / Monthly Salary
      const roiRatio = estimatedMonthlySalary > 0 ? (totalSalesPaid / estimatedMonthlySalary).toFixed(1) : '0.0';

      return {
        ...emp,
        estimatedMonthlySalary,
        totalSalesBilled,
        totalSalesPaid,
        roiRatio,
      };
    });
  }, [employees, employeeAndReferralSales]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles size={14} className="text-amber-400" />
              Executive Business Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="text-blue-400" size={30} />
              Sales, Expansion & Staff Analytics
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Comprehensive real-time tracking for Total Sales, Operational Expansion Costs, Staff & Referral Performance, Payroll Salaries, and Service-Wise Revenue.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80">
            <span className="text-xs text-slate-300 font-medium px-2">Quick Stats:</span>
            <div className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-lg font-bold border border-emerald-500/30">
              {financialTotals.profitMargin}% Net Margin
            </div>
          </div>
        </div>
      </div>

      {/* Top Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales Billed</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(financialTotals.totalSalesBilled)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-2">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} />
              Paid: {formatCurrency(financialTotals.totalSalesPaid)}
            </span>
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <Clock size={12} />
              Pending: {formatCurrency(financialTotals.totalSalesPending)}
            </span>
          </div>
        </div>

        {/* Card 2: Expansion & Operational Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expansion Expenses</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(financialTotals.totalExpansionExpenses)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-2 text-slate-500">
            <span>Ledger & Project Cost</span>
            <span className="font-bold text-slate-700">Outflow Recorded</span>
          </div>
        </div>

        {/* Card 3: Monthly Staff Payroll Base */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Staff Payroll</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Wallet size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(financialTotals.totalMonthlyPayroll)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-2 text-slate-500">
            <span>Active Staff: {employees.length}</span>
            <span className="font-bold text-amber-600">Estimated Base</span>
          </div>
        </div>

        {/* Card 4: Net Profit / Margin */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Net Business Operating Profit</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className={`text-2xl font-black ${financialTotals.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(financialTotals.netProfit)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-2 text-slate-500">
            <span>Net Operating Margin</span>
            <span className="font-extrabold text-emerald-700">{financialTotals.profitMargin}%</span>
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveSubTab('employees_sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'employees_sales'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck size={16} />
          Employees & Referral Sales
        </button>

        <button
          onClick={() => setActiveSubTab('sales_expenses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'sales_expenses'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard size={16} />
          Sales vs Expansion Ledger
        </button>

        <button
          onClick={() => setActiveSubTab('salary_payroll')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'salary_payroll'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet size={16} />
          Staff Salary & Payroll
        </button>

        <button
          onClick={() => setActiveSubTab('services_wise')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'services_wise'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers size={16} />
          Services-Wise Breakdown
        </button>

        <button
          onClick={() => setActiveSubTab('referral_search')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'referral_search'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Search size={16} />
          Live Referral/Employee Search
        </button>
      </div>

      {/* --- SUB-TAB 1: EMPLOYEES & REFERRAL SALES TRACKER --- */}
      {activeSubTab === 'employees_sales' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="text-amber-500" size={18} />
                  Staff & Referral Sales Contribution Leaderboard
                </h3>
                <p className="text-xs text-slate-500">
                  Track total revenue generated by each employee or Referral Partner based on billed invoices and referral tags.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, role, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Contributor / Referral Partner</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Invoices Billed</th>
                    <th className="py-3 px-4">Total Sales Billed</th>
                    <th className="py-3 px-4">Paid / Collected</th>
                    <th className="py-3 px-4">Pending</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSalesData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            item.type === 'Employee' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{item.name}</div>
                            {item.email && <div className="text-[11px] text-slate-400">{item.email}</div>}
                            {item.department && <div className="text-[10px] text-blue-600 font-semibold">{item.department}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          item.type === 'Employee'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {item.invoiceCount} invoices
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(item.totalBilled)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                        {formatCurrency(item.totalPaid)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600">
                        {formatCurrency(item.totalPending)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setInspectPartner({
                            name: item.name,
                            type: item.type,
                            invoices: item.invoices
                          })}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                        >
                          View Billed Invoices
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredSalesData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                        No sales contributions matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB-TAB 2: SALES VS EXPANSION LEDGER --- */}
      {activeSubTab === 'sales_expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={18} />
                Total Sales & Revenue Flow
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {invoices.length} Invoices Billed
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                <span className="text-xs font-medium text-slate-600">Total Billed Volume</span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  {formatCurrency(financialTotals.totalSalesBilled)}
                </span>
              </div>

              <div className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <span className="text-xs font-medium text-emerald-900">Total Collected Cash</span>
                <span className="font-mono font-black text-emerald-600 text-sm">
                  {formatCurrency(financialTotals.totalSalesPaid)}
                </span>
              </div>

              <div className="flex justify-between items-center bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <span className="text-xs font-medium text-amber-900">Outstanding Pending Payments</span>
                <span className="font-mono font-black text-amber-600 text-sm">
                  {formatCurrency(financialTotals.totalSalesPending)}
                </span>
              </div>
            </div>

            {/* Invoices List */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Recent Invoiced Clients</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {invoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{inv.clientName} ({inv.clientCompany || inv.projectName})</div>
                      <div className="text-[10px] text-slate-400 font-mono">Invoice #{inv.invoiceNumber} • Billed by {inv.billingAuthority || 'Admin'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">{formatCurrency(inv.amountTotal)}</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expansion & Expenses Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="text-rose-500" size={18} />
                Operational Expansion & Costs
              </h3>
              <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                {ledger.filter(l => l.type === 'Debit (Project Expense)').length} Expense Debits
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                <span className="text-xs font-medium text-slate-600">Total Project Expense Debits</span>
                <span className="font-mono font-black text-rose-600 text-sm">
                  {formatCurrency(financialTotals.totalExpansionExpenses)}
                </span>
              </div>

              <div className="flex justify-between items-center bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <span className="text-xs font-medium text-amber-900">Total Monthly Staff Salary Base</span>
                <span className="font-mono font-black text-amber-700 text-sm">
                  {formatCurrency(financialTotals.totalMonthlyPayroll)}
                </span>
              </div>

              <div className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                <span className="text-xs font-medium text-indigo-900">Combined Business Outflow</span>
                <span className="font-mono font-black text-indigo-700 text-sm">
                  {formatCurrency(financialTotals.totalExpansionExpenses + financialTotals.totalMonthlyPayroll)}
                </span>
              </div>
            </div>

            {/* Expenses List */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Recent Expense Log Entries</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {ledger
                  .filter((l) => l.type === 'Debit (Project Expense)')
                  .slice(0, 5)
                  .map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{entry.description}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Ref: {entry.referenceNo || 'EXP-001'} • {entry.date}</div>
                      </div>
                      <div className="font-mono font-bold text-rose-600">
                        -{formatCurrency(entry.amount)}
                      </div>
                    </div>
                  ))}

                {ledger.filter((l) => l.type === 'Debit (Project Expense)').length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No explicit expense debits recorded in ledger yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB-TAB 3: SALARY & PAYROLL TRACKING --- */}
      {activeSubTab === 'salary_payroll' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="text-amber-500" size={18} />
                Staff Salary Payroll & Revenue Return (ROI)
              </h3>
              <p className="text-xs text-slate-500">
                Compare employee monthly salary base against total client revenue brought into TopRank.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl text-xs font-bold text-slate-700">
              <span>Total Staff: {employees.length}</span>
              <span>•</span>
              <span className="text-amber-700 font-mono">Total Monthly Payroll: {formatCurrency(financialTotals.totalMonthlyPayroll)}</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role & Department</th>
                  <th className="py-3 px-4">Hourly Rate</th>
                  <th className="py-3 px-4">Estimated Monthly Salary</th>
                  <th className="py-3 px-4">Revenue Brought In</th>
                  <th className="py-3 px-4">Sales vs Salary ROI Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payrollList.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <img src={emp.avatar} alt={emp.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div>{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{emp.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{emp.role}</div>
                      <div className="text-[10px] text-blue-600">{emp.department}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      ₹{emp.hourlyRate || 500}/hr
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                      {formatCurrency(emp.estimatedMonthlySalary)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {formatCurrency(emp.totalSalesPaid)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold ${
                        parseFloat(emp.roiRatio) >= 1.0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {emp.roiRatio}x ROI
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SUB-TAB 4: SERVICES-WISE REVENUE BREAKDOWN --- */}
      {activeSubTab === 'services_wise' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="text-indigo-500" size={18} />
                Service & Department Revenue Analytics
              </h3>
              <p className="text-xs text-slate-500">
                Revenue generated across different service offerings (Web Development, SEO, Ads, Creative, etc.)
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200">
              {serviceWiseBreakdown.length} Service Categories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceWiseBreakdown.map((service, idx) => (
              <div key={idx} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 hover:border-indigo-300 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{service.serviceName}</div>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {service.percentage}% Share
                  </span>
                </div>

                <div className="text-xl font-black text-slate-900 font-mono">
                  {formatCurrency(service.totalBilled)}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(5, service.percentage))}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600 border-t border-slate-200/60 font-medium">
                  <div>
                    Paid: <strong className="text-emerald-600 font-mono">{formatCurrency(service.totalPaid)}</strong>
                  </div>
                  <div>
                    Pending: <strong className="text-amber-600 font-mono">{formatCurrency(service.totalPending)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUB-TAB 5: LIVE REFERRAL & BILLED EMPLOYEE SEARCH FILTER --- */}
      {activeSubTab === 'referral_search' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Search className="text-blue-600" size={18} />
              Live Staff & Referred By Revenue Search
            </h3>
            <p className="text-xs text-slate-500">
              Type any employee name or Referred By tag to instantly fetch all matching billed invoices, clients, total money brought in, and pending balances.
            </p>

            <div className="relative pt-2">
              <Search size={18} className="absolute left-3.5 top-5 text-slate-400" />
              <input
                type="text"
                placeholder="Type Employee Name or Referred By tag (e.g. Arnav, Rahul, Direct, Partner Name)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            </div>
          </div>

          {/* Results Summary */}
          {searchQuery.trim() ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600 bg-blue-50 p-3 rounded-xl border border-blue-100 font-semibold">
                <span>Search results for: <strong className="text-blue-900 font-extrabold">"{searchQuery}"</strong></span>
                <span>Found {filteredSalesData.length} matching entities</span>
              </div>

              <div className="space-y-4">
                {filteredSalesData.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-base">{item.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.type === 'Employee' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        {item.role && <div className="text-xs text-slate-500">{item.role} • {item.department}</div>}
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono font-bold">
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                          Total Billed: <span className="text-slate-900">{formatCurrency(item.totalBilled)}</span>
                        </div>
                        <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
                          Paid: {formatCurrency(item.totalPaid)}
                        </div>
                      </div>
                    </div>

                    {/* Matched Invoices */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billed Invoices Linked to {item.name}:</h4>
                      {item.invoices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {item.invoices.map((inv) => (
                            <div key={inv.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                              <div className="flex items-center justify-between font-bold">
                                <span className="text-slate-900">{inv.clientName} ({inv.clientCompany || inv.projectName})</span>
                                <span className="font-mono text-blue-600">#{inv.invoiceNumber}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                                <span>Total: <strong className="text-slate-900 font-mono">{formatCurrency(inv.amountTotal)}</strong></span>
                                <span className={`font-bold px-1.5 py-0.2 rounded ${
                                  inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {inv.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No direct invoices linked to this record yet.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-medium">
              Start typing in the search box above to inspect sales records by staff or referral tag.
            </div>
          )}
        </div>
      )}

      {/* MODAL TO INSPECT SPECIFIC PARTNER / STAFF INVOICES */}
      {inspectPartner && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  Billed Invoices: {inspectPartner.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Tag Type: <span className="font-bold text-slate-700">{inspectPartner.type}</span>
                </p>
              </div>
              <button
                onClick={() => setInspectPartner(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {inspectPartner.invoices.map((inv) => (
                <div key={inv.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 text-sm">{inv.clientName} • {inv.clientCompany || inv.projectName}</span>
                    <span className="font-mono text-blue-600">Invoice #{inv.invoiceNumber}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80 font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Total Amount</span>
                      <strong className="text-slate-900">{formatCurrency(inv.amountTotal)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Paid Amount</span>
                      <strong className="text-emerald-600">{formatCurrency(inv.amountPaid)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Pending Amount</span>
                      <strong className="text-amber-600">{formatCurrency(inv.amountPending)}</strong>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Issue Date: {inv.issueDate}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}

              {inspectPartner.invoices.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No invoices currently linked to {inspectPartner.name}.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectPartner(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
