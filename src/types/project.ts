// Project Types - Foundational architecture for billable vs operational work

export type ProjectType = "internal" | "external";

export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Archived";

export type UserRole = "admin" | "finance" | "manager" | "user";

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

// Activity Types - simple categories for time entries (NO RATES - rates are employee-specific)
export type ActivityType = "dev" | "design" | "admin" | "meeting";

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  dev: "Development",
  design: "Design",
  admin: "Admin",
  meeting: "Meeting",
};

// Time Entry - supports logged vs billable hours separation
export interface TimeEntry {
  id: number;
  projectId: number;
  employeeId: string;
  employeeName: string;
  date: string;
  // Activity type - required for all time entries (NO RATES here - rates are employee-specific)
  activityType: ActivityType;
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
export type TaskStatus = 
  | "hold"
  | "open"
  | "analysis"
  | "analysis_completed"
  | "analysis_approved"
  | "assign_to_development"
  | "unit_testing"
  | "ba_review"
  | "assigned_to_qa"
  | "qa_verified"
  | "qc_completed"
  | "preproduction_deployment"
  | "production_deployment"
  | "closed";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  hold: "Hold",
  open: "Open",
  analysis: "Analysis",
  analysis_completed: "Analysis Completed",
  analysis_approved: "Analysis Approved",
  assign_to_development: "Assign to Development",
  unit_testing: "Unit Testing",
  ba_review: "BA Review",
  assigned_to_qa: "Assigned to QA",
  qa_verified: "QA Verified",
  qc_completed: "QC Completed",
  preproduction_deployment: "Preproduction deployment",
  production_deployment: "Production deployment",
  closed: "Closed",
};

// Status display order for UI
export const TASK_STATUS_ORDER: TaskStatus[] = [
  "hold", "open", "analysis", "analysis_completed", "analysis_approved",
  "assign_to_development", "unit_testing", "ba_review", "assigned_to_qa",
  "qa_verified", "qc_completed", "preproduction_deployment", "production_deployment", "closed"
];

// Roles that can perform transitions
export type TransitionRole = "assignee" | "lead" | "manager" | "admin" | "finance";

// Transition rule: defines who can move task between states
export interface TaskTransitionRule {
  from: TaskStatus;
  to: TaskStatus;
  allowedRoles: TransitionRole[];
  label: string;  // e.g., "Assign", "Start Work", "Submit for Review"
}

// Default workflow transition rules
export const DEFAULT_TASK_TRANSITIONS: TaskTransitionRule[] = [
  { from: "hold", to: "open", allowedRoles: ["lead", "manager", "admin"], label: "Open" },
  { from: "open", to: "analysis", allowedRoles: ["assignee", "lead", "manager", "admin"], label: "Start Analysis" },
  { from: "analysis", to: "analysis_completed", allowedRoles: ["assignee", "lead", "manager", "admin"], label: "Complete Analysis" },
  { from: "analysis_completed", to: "analysis_approved", allowedRoles: ["lead", "manager", "admin"], label: "Approve Analysis" },
  { from: "analysis_approved", to: "assign_to_development", allowedRoles: ["lead", "manager", "admin"], label: "Assign to Dev" },
  { from: "assign_to_development", to: "unit_testing", allowedRoles: ["assignee", "lead", "manager", "admin"], label: "Submit for Testing" },
  { from: "unit_testing", to: "ba_review", allowedRoles: ["assignee", "lead", "manager", "admin"], label: "Submit for BA Review" },
  { from: "ba_review", to: "assigned_to_qa", allowedRoles: ["lead", "manager", "admin"], label: "Assign to QA" },
  { from: "assigned_to_qa", to: "qa_verified", allowedRoles: ["assignee", "lead", "manager", "admin"], label: "QA Verified" },
  { from: "qa_verified", to: "qc_completed", allowedRoles: ["lead", "manager", "admin"], label: "QC Complete" },
  { from: "qc_completed", to: "preproduction_deployment", allowedRoles: ["lead", "manager", "admin"], label: "Deploy to Preprod" },
  { from: "preproduction_deployment", to: "production_deployment", allowedRoles: ["lead", "manager", "admin"], label: "Deploy to Production" },
  { from: "production_deployment", to: "closed", allowedRoles: ["lead", "manager", "admin"], label: "Close" },
  { from: "open", to: "hold", allowedRoles: ["lead", "manager", "admin"], label: "Put on Hold" },
];

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
  // Hierarchy - supports subtasks (WBS)
  parentTaskId?: number;     // null for top-level tasks
  depth: number;             // 0 = root, 1 = subtask, 2 = sub-subtask (UI caps at 2)
  // Assignees: single primary + optional collaborators
  primaryAssigneeId: string;
  primaryAssigneeName: string;
  collaboratorIds?: string[];
  collaboratorNames?: string[];
  // Billing
  isBillable: boolean;       // Can be non-billable even on external projects
  estimatedHours?: number;
  loggedHours: number;       // Own logged hours (not including children)
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
  // Edit tracking
  editedBy?: string;
  editedAt?: string;
  editedVia?: string;
}

// Maximum UI depth for task hierarchy (DB can support more)
export const MAX_TASK_DEPTH = 2;

// Helper to check if task can transition (simple check - use canUserTransitionTask for role-based)
export const canTransitionTask = (
  currentStatus: TaskStatus, 
  newStatus: TaskStatus
): boolean => {
  return DEFAULT_TASK_TRANSITIONS.some(
    rule => rule.from === currentStatus && rule.to === newStatus
  );
};

// Helper to get available transitions for a status
export const getAvailableTransitions = (currentStatus: TaskStatus): TaskTransitionRule[] => {
  return DEFAULT_TASK_TRANSITIONS.filter(rule => rule.from === currentStatus);
};

// Helper to check if user can perform a specific transition
export const canUserTransitionTask = (
  currentStatus: TaskStatus,
  newStatus: TaskStatus,
  userTransitionRole: TransitionRole
): boolean => {
  const rule = DEFAULT_TASK_TRANSITIONS.find(
    r => r.from === currentStatus && r.to === newStatus
  );
  return rule?.allowedRoles.includes(userTransitionRole) ?? false;
};

// Map UserRole to TransitionRole (basic mapping, can be extended)
export const getTransitionRoleFromUserRole = (userRole: UserRole, isAssignee: boolean): TransitionRole => {
  if (isAssignee) return "assignee";
  if (userRole === "admin") return "admin";
  if (userRole === "finance") return "finance";
  return "lead"; // Default for regular users with team lead permissions
};

// Helper to get subtasks for a parent
export const getSubtasks = (parentId: number, tasks: Task[]): Task[] => {
  return tasks.filter(t => t.parentTaskId === parentId);
};

// Helper to calculate rolled-up hours (own + all descendants)
export const getRolledUpHours = (task: Task, allTasks: Task[]): { logged: number; estimated: number } => {
  const subtasks = getSubtasks(task.id, allTasks);
  
  let totalLogged = task.loggedHours;
  let totalEstimated = task.estimatedHours ?? 0;
  
  for (const subtask of subtasks) {
    const childRollup = getRolledUpHours(subtask, allTasks);
    totalLogged += childRollup.logged;
    totalEstimated += childRollup.estimated;
  }
  
  return { logged: totalLogged, estimated: totalEstimated };
};

// Helper to calculate progress percentage based on subtasks
export const getTaskProgress = (task: Task, allTasks: Task[]): number => {
  const subtasks = getSubtasks(task.id, allTasks);
  
  // No subtasks - progress based on own status
  if (subtasks.length === 0) {
    if (task.status === "closed") return 100;
    if (task.status === "production_deployment") return 95;
    if (task.status === "preproduction_deployment") return 90;
    if (task.status === "qc_completed") return 85;
    if (task.status === "qa_verified") return 80;
    if (task.status === "assigned_to_qa") return 70;
    if (task.status === "ba_review") return 60;
    if (task.status === "unit_testing") return 50;
    if (task.status === "assign_to_development") return 40;
    if (task.status === "analysis_approved") return 30;
    if (task.status === "analysis_completed") return 25;
    if (task.status === "analysis") return 20;
    if (task.status === "open") return 10;
    return 0; // hold
  }
  
  // With subtasks - average progress of children
  const childProgresses = subtasks.map(s => getTaskProgress(s, allTasks));
  return Math.round(childProgresses.reduce((a, b) => a + b, 0) / childProgresses.length);
};

// Helper to check if setting parentId would create circular reference
export const wouldCreateCircularReference = (
  taskId: number,
  newParentId: number,
  allTasks: Task[]
): boolean => {
  // Can't be own parent
  if (taskId === newParentId) return true;
  
  // Walk up the parent chain from newParentId
  let currentId: number | undefined = newParentId;
  const visited = new Set<number>();
  
  while (currentId !== undefined) {
    if (visited.has(currentId)) return true; // Already circular
    if (currentId === taskId) return true;   // Found the task in ancestry
    
    visited.add(currentId);
    const current = allTasks.find(t => t.id === currentId);
    currentId = current?.parentTaskId;
  }
  
  return false;
};

// Helper to check if task can have children
export const canHaveChildren = (task: Task): boolean => {
  return task.depth < MAX_TASK_DEPTH;
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
  // Edit tracking
  editedBy?: string;
  editedAt?: string;
  editedVia?: string;
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
