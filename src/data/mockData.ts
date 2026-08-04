import {
  Employee,
  Task,
  Project,
  Invoice,
  AttendanceRecord,
  Meeting,
  TeamDiscussion,
  LedgerEntry,
  AgencyService,
} from "../types";

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_MEETINGS: Meeting[] = [];
export const INITIAL_DISCUSSIONS: TeamDiscussion[] = [];
export const INITIAL_LEDGER: LedgerEntry[] = [];

export const INITIAL_SERVICES: AgencyService[] = [
  { id: 'srv-1', name: 'Google & Meta Ads Campaign Optimization', department: 'Ads', defaultPrice: 50000, description: 'PPC Management, Audience Targeting, Ad Creative Design & Weekly Performance Reports' },
  { id: 'srv-2', name: 'Full-Stack Custom Web Development', department: 'Website', defaultPrice: 120000, description: 'Responsive React/Next.js Website, CMS Integration, Speed Optimization & SEO Setup' },
  { id: 'srv-3', name: 'SEO Growth Retainer & Backlink Strategy', department: 'Website', defaultPrice: 45000, description: 'Technical Audit, On-Page SEO, Keyword Ranking Optimization & High DA Backlinks' },
  { id: 'srv-4', name: 'Mobile App Development (iOS & Android)', department: 'App', defaultPrice: 180000, description: 'Cross-platform Mobile App with Push Notifications & Backend API' },
  { id: 'srv-5', name: 'Social Media Organic Branding & Content', department: 'Social Media', defaultPrice: 35000, description: '15 High-Quality Posts, Reels Production, Caption Copywriting & Community Management' },
  { id: 'srv-6', name: 'Commercial Video Editing & Motion Graphics', department: 'Video Editing', defaultPrice: 40000, description: '4K Commercial Video Editing, Color Grading, Sound Design & Motion Effects' },
  { id: 'srv-7', name: 'UI/UX Mobile & Web Interface Design', department: 'Design & Creative', defaultPrice: 60000, description: 'Figma Wireframes, Interactive Prototypes, Design System & User Journey Mapping' },
];
