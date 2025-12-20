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

// Task - atomic unit of execution
export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done" | "blocked";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
  blocked: "Blocked",
};

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

// Task categories for reporting
export type TaskCategory = 
  | "development"
  | "design"
  | "testing"
  | "documentation"
  | "meeting"
  | "planning"
  | "support"
  | "other";

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  development: "Development",
  design: "Design",
  testing: "Testing",
  documentation: "Documentation",
  meeting: "Meeting",
  planning: "Planning",
  support: "Support",
  other: "Other",
};

export interface Task {
  id: number;
  projectId: number;         // Required - tasks must belong to a project
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  // Assignees: single primary + optional collaborators
  primaryAssigneeId: string;
  primaryAssigneeName: string;
  collaboratorIds?: string[];
  collaboratorNames?: string[];
  // Billing
  isBillable: boolean;       // Can be non-billable even on external projects
  estimatedHours?: number;
  loggedHours: number;
  // Optional linkages
  milestoneId?: number;
  sprintId?: number;
  // Tags/categories for reporting
  category: TaskCategory;
  tags?: string[];
  // Dates
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
}

// Helper to check if task can transition to a status
export const canTransitionTask = (
  currentStatus: TaskStatus, 
  newStatus: TaskStatus
): boolean => {
  const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    backlog: ["todo"],
    todo: ["in_progress", "backlog"],
    in_progress: ["in_review", "blocked", "todo"],
    in_review: ["done", "in_progress"],
    done: ["in_progress"], // Reopen
    blocked: ["in_progress", "todo"],
  };
  return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
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
