// Project Types - Foundational architecture for billable vs operational work

export type ProjectType = "internal" | "external";

export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Archived";

export type UserRole = "admin" | "finance" | "user";

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

export interface Project {
  id: number;
  name: string;
  projectType: ProjectType;
  client: string | null; // null for internal projects
  manager: string;
  status: ProjectStatus;
  assignedEmployees: number;
  hoursLogged: number;
  // Billing fields - only applicable for external projects
  billableRate?: number;
  estimatedBudget?: number;
  invoiced?: number;
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
