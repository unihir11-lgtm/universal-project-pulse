// Project Types - Foundational architecture for billable vs operational work

export type ProjectType = "internal" | "external";

export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Archived";

export type UserRole = "admin" | "finance" | "user";

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
