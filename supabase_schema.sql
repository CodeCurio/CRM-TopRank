-- Run this SQL in your Supabase SQL Editor to create the necessary tables.

CREATE TABLE employees (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "avatar" TEXT,
  "phone" TEXT,
  "status" TEXT DEFAULT 'offline',
  "activeSecondsToday" INTEGER DEFAULT 0,
  "lastPunchIn" TEXT,
  "hourlyRate" NUMERIC DEFAULT 0,
  "completedTasksCount" INTEGER DEFAULT 0,
  "pendingTasksCount" INTEGER DEFAULT 0,
  "productivityScore" INTEGER DEFAULT 0,
  "isAdmin" BOOLEAN DEFAULT false
);

CREATE TABLE projects (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "clientEmail" TEXT,
  "status" TEXT NOT NULL,
  "totalBudget" NUMERIC DEFAULT 0,
  "spentBudget" NUMERIC DEFAULT 0,
  "startDate" TEXT,
  "deadline" TEXT,
  "leadEmployeeId" TEXT REFERENCES employees("id"),
  "leadEmployeeName" TEXT,
  "completionRate" INTEGER DEFAULT 0,
  "description" TEXT,
  "ongoingStatusNote" TEXT
);

CREATE TABLE tasks (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "clientName" TEXT,
  "assignedEmployeeId" TEXT REFERENCES employees("id"),
  "assignedEmployeeName" TEXT,
  "assignedEmployeeAvatar" TEXT,
  "priority" TEXT,
  "status" TEXT,
  "dueDate" TEXT,
  "estimatedHours" NUMERIC DEFAULT 0,
  "loggedHours" NUMERIC DEFAULT 0,
  "progressPercentage" INTEGER DEFAULT 0,
  "createdDate" TEXT,
  "category" TEXT,
  "commentsCount" INTEGER DEFAULT 0
);

CREATE TABLE invoices (
  "id" TEXT PRIMARY KEY,
  "invoiceNumber" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "clientEmail" TEXT,
  "clientCompany" TEXT,
  "projectName" TEXT,
  "issueDate" TEXT,
  "dueDate" TEXT,
  "amountTotal" NUMERIC DEFAULT 0,
  "amountPaid" NUMERIC DEFAULT 0,
  "amountPending" NUMERIC DEFAULT 0,
  "status" TEXT,
  "notes" TEXT,
  "items" JSONB DEFAULT '[]'::jsonb,
  "paymentHistory" JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE attendance (
  "id" TEXT PRIMARY KEY,
  "employeeId" TEXT REFERENCES employees("id"),
  "employeeName" TEXT,
  "date" TEXT,
  "punchIn" TEXT,
  "punchOut" TEXT,
  "totalHours" NUMERIC DEFAULT 0,
  "status" TEXT
);

CREATE TABLE meetings (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "date" TEXT,
  "time" TEXT,
  "duration" TEXT,
  "type" TEXT,
  "projectName" TEXT,
  "hostId" TEXT REFERENCES employees("id"),
  "hostName" TEXT,
  "attendees" JSONB DEFAULT '[]'::jsonb,
  "status" TEXT,
  "meetingLink" TEXT
);

CREATE TABLE discussions (
  "id" TEXT PRIMARY KEY,
  "channel" TEXT NOT NULL,
  "authorId" TEXT REFERENCES employees("id"),
  "authorName" TEXT,
  "authorRole" TEXT,
  "authorAvatar" TEXT,
  "content" TEXT,
  "timestamp" TEXT,
  "isPinned" BOOLEAN DEFAULT false,
  "replies" JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE ledger (
  "id" TEXT PRIMARY KEY,
  "date" TEXT,
  "description" TEXT,
  "type" TEXT,
  "amount" NUMERIC DEFAULT 0,
  "balanceAfter" NUMERIC DEFAULT 0,
  "referenceNo" TEXT,
  "clientName" TEXT
);

-- Note: Ensure to disable Row Level Security (RLS) or add public access policies for ease of testing in dev.
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE discussions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ledger DISABLE ROW LEVEL SECURITY;
