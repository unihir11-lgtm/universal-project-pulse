// Project Types - Foundational architecture for billable vs operational work

export type ProjectType = "internal" | "external";

export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Archived";

export type UserRole = "admin" | "finance" | "user";

// Billing model drives UI + computations
export type BillingModel = "hourly" | "milestone" | "fixed" | "hybrid";

export const BILLING_MODEL_LABELS: Record<BillingModel, string> = {
  hourly: "Hourly",
  milestone: "Milestone",
  fixed: "Fixed Price",
  hybrid: "Hybrid (Milestone + Hourly)",
};

export const BILLING_MODEL_DESCRIPTIONS: Record<BillingModel, string> = {
  hourly: "Invoices derived from approved time entries",
  milestone: "Invoices derived from milestone completion",
  fixed: "Manual invoice schedule or template",
  hybrid: "Milestones + hourly overages",
};

// Invoice status tracking: Billed vs Billable vs Unbilled
export type InvoiceStatus = "unbilled" | "billable" | "billed";

// Supported currencies - single currency per project, no FX in v1
export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "INR" | "JPY";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  INR: "₹",
  JPY: "¥",
};

// Organization default currency
export const ORG_DEFAULT_CURRENCY: Currency = "USD";

// Time Entry - supports logged vs billable hours separation
export interface TimeEntry {
  id: number;
  projectId: number;
  employeeId: string;
  employeeName: string;
  date: string;
  // Logged hours = actual time worked (for costing/payroll)
  loggedHours: number;
  // Billable hours = approved hours for invoicing (PM can adjust)
  billableHours: number;
  // Whether this entry is billable at all (even on external projects, some time may be non-billable)
  isBillable: boolean;
  description: string;
  task?: string;
  // Status for approval workflow
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
}

// Time entry hours summary
export interface TimeEntrySummary {
  totalLogged: number;    // All logged hours (for payroll)
  totalBillable: number;  // Approved billable hours (for invoicing)
  totalUnbilled: number;  // Billable but not yet invoiced
  totalBilled: number;    // Already invoiced
}

// Milestone - checkpoints, not tasks
export type MilestoneStatus = "not_started" | "in_progress" | "pending_approval" | "completed";

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  pending_approval: "Pending Approval",
  completed: "Completed",
};

export interface Milestone {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  targetDate: string;
  completedDate?: string;
  status: MilestoneStatus;
  // Billing trigger - when completed, triggers invoice for this amount
  billingTrigger: boolean;
  billingAmount?: number;
  // Approval workflow
  approvalRequired: boolean;  // Finance/PM must approve completion
  approvedBy?: string;
  approvedAt?: string;
  // Task linkage (optional) - milestone can complete even if tasks aren't done
  linkedTaskIds?: number[];
  // Order for display
  order: number;
}

// Helper to check if milestone can be completed
export const canCompleteMilestone = (milestone: Milestone, userRole: UserRole): boolean => {
  if (milestone.status === "completed") return false;
  if (milestone.approvalRequired) {
    return userRole === "admin" || userRole === "finance";
  }
  return true;
};

// Helper to check if user can approve milestone
export const canApproveMilestone = (role: UserRole): boolean => {
  return role === "admin" || role === "finance";
};

export interface Project {
  id: number;
  name: string;
  projectType: ProjectType;
  client: string | null; // null for internal projects
  manager: string;
  status: ProjectStatus;
  assignedEmployees: number;
  hoursLogged: number;
  // Billing model - required for external projects
  billingModel?: BillingModel;
  // Billing fields - only applicable for external projects
  billableRate?: number;
  estimatedBudget?: number;
  // Invoice tracking: separate billed vs billable vs unbilled
  invoiced?: number;        // Total billed amount
  billableAmount?: number;  // Ready to invoice
  unbilledAmount?: number;  // Time logged but not yet billable
  // Currency - required for external projects, belongs to project (not user)
  currency?: Currency;
  // Lock currency after first invoice
  currencyLocked?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Helper to check if user can convert project types
export const canConvertProjectType = (role: UserRole): boolean => {
  return role === "admin" || role === "finance";
};

// Helper to check if project is billable
export const isBillable = (project: Project): boolean => {
  return project.projectType === "external";
};

// Helper to check if currency can be changed
export const canChangeCurrency = (project: Project): boolean => {
  return !project.currencyLocked && (project.invoiced ?? 0) === 0;
};

// Format amount with currency symbol
export const formatCurrency = (amount: number, currency: Currency): string => {
  return `${CURRENCY_SYMBOLS[currency]}${amount.toLocaleString()}`;
};

// Get currency for display (returns org default for internal projects)
export const getProjectCurrency = (project: Project): Currency => {
  return project.currency ?? ORG_DEFAULT_CURRENCY;
};
