export type UserRole = 'admin' | 'employee';
export type AdminRole = 'Founder' | 'Co-Founder';

export type WorkStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type EmployeePresenceStatus = 'active' | 'on_break' | 'in_meeting' | 'offline' | 'on_leave';
export type InvoiceStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue';

export type Department = 
  | 'SEO & Growth'
  | 'Development'
  | 'Design & Creative'
  | 'Client Success'
  | 'Management'
  | 'Human Resources'
  | 'Finance & Accounts'
  | 'Sales & Marketing'
  | 'Legal & Compliance'
  | 'Product & Engineering';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: Department | string;
  avatar: string;
  phone: string;
  status: EmployeePresenceStatus;
  activeSecondsToday: number;
  lastPunchIn: string | null;
  hourlyRate: number;
  completedTasksCount: number;
  pendingTasksCount: number;
  productivityScore: number; // 0 - 100
  isAdmin?: boolean;
  adminRole?: AdminRole;
  aadhaarNumber?: string;
  panNumber?: string;
  password?: string;
  employeeCode?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  clientName: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  assignedEmployeeAvatar?: string;
  priority: TaskPriority;
  status: WorkStatus;
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  progressPercentage: number;
  createdDate: string;
  category: 'SEO Audit' | 'Web Development' | 'Content Marketing' | 'UI/UX Design' | 'PPC Campaign' | 'Client Onboarding';
  commentsCount?: number;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed';
  totalBudget: number;
  spentBudget: number;
  startDate: string;
  deadline: string;
  leadEmployeeId: string;
  leadEmployeeName: string;
  completionRate: number;
  description: string;
  ongoingStatusNote: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  department?: string; // Ads, Website, App, Social Media, Video Editing, etc.
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string; // Contact Person Name
  clientEmail: string;
  clientCompany: string; // Company Name
  clientAddress?: string; // Office / Billing Address
  clientUrl?: string; // Website / URL
  projectName: string;
  issueDate: string;
  dueDate: string;
  amountTotal: number;
  amountPaid: number;
  amountPending: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  departmentCategory?: string; // Primary Department / Service Type
  discountPercent?: number; // Discount %
  discountAmount?: number; // Calculated discount
  gstPercent?: number; // GST Rate (e.g. 18%)
  gstAmount?: number; // Calculated GST
  clientGstin?: string; // Client GSTIN/Tax ID
  subtotalAmount?: number; // Subtotal amount before tax & discount
  referredBy?: string; // Referred By person/partner
  billingAuthority?: string; // Billed/Approved Authority Name Tag
  includeSignature?: boolean; // Authorized Signature & Digital Stamp toggle
  signatoryName?: string; // Authorized Signatory Name
  signatoryTitle?: string; // Authorized Signatory Title
  notes?: string;
  paymentHistory?: {
    id: string;
    amount: number;
    date: string;
    method: string;
    reference: string;
  }[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  punchIn: string;
  punchOut: string | null;
  totalActiveHours: string;
  status: 'Present' | 'WFH' | 'Half Day' | 'On Leave';
  location: string;
}

export interface Meeting {
  id: string;
  title: string;
  projectName: string;
  hostName: string;
  date: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  attendees: {
    employeeId: string;
    employeeName: string;
    status: 'Accepted' | 'Pending' | 'Declined';
    isPresent?: boolean;
  }[];
  agenda: string;
  status: 'Upcoming' | 'Live' | 'Completed';
}

export interface DiscussionReply {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

export interface TeamDiscussion {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  timestamp: string;
  channel: 'general' | 'seo-squad' | 'dev-squad' | 'billing-alerts' | 'announcements';
  likesCount: number;
  replies: DiscussionReply[];
  isPinned?: boolean;
  tag?: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  clientName: string;
  type: 'Credit (Payment Received)' | 'Debit (Project Expense)' | 'Invoice Billed';
  amount: number;
  balanceAfter: number;
  referenceNo: string;
}
