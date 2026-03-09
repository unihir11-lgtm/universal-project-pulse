import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Calendar, Edit, Trash2, Clock, User, ListChecks,
  CheckSquare, ArrowRight, AlertTriangle, Users, BarChart3,
  Zap, TrendingUp, Layers, X,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Constants ---
const WEEKLY_CAPACITY = 40;
const DAILY_CAPACITY = 8;

// --- Helpers ---
const getWorkingDays = (start: string, end: string): string[] => {
  const days: string[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) days.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

const formatDayLabel = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" });
};

const formatShortDay = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit" });
};

// --- Mock Data ---
const projectsData = [
  { id: 1, name: "Go Live" },
  { id: 2, name: "Human Resource" },
  { id: 3, name: "Jain Connection Marketing" },
  { id: 4, name: "Jain Marketplace" },
  { id: 5, name: "Product Support" },
  { id: 6, name: "Super App" },
  { id: 7, name: "Universal Software" },
];

const employeesData = [
  { id: "e1", name: "John Doe", capacity: WEEKLY_CAPACITY },
  { id: "e2", name: "Ravi Kumar", capacity: WEEKLY_CAPACITY },
  { id: "e3", name: "Mehul Patel", capacity: WEEKLY_CAPACITY },
  { id: "e4", name: "Priya Sharma", capacity: WEEKLY_CAPACITY },
  { id: "e5", name: "Amit Singh", capacity: WEEKLY_CAPACITY },
  { id: "e6", name: "Sneha Reddy", capacity: WEEKLY_CAPACITY },
];

interface SprintTaskAssignee {
  employeeId: string;
  employeeName: string;
  dayHours: Record<string, number>; // date -> hours
}

interface Sprint {
  id: number;
  name: string;
  project: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: string;
  tasks: SprintTask[];
}

interface SprintTask {
  id: number;
  name: string;
  project: string;
  assignees: SprintTaskAssignee[];
  estimatedHours: number;
  status: string;
  priority: string;
}

interface QueueTask {
  id: number;
  name: string;
  project: string;
  priority: string;
  assigneeId: string;
  assigneeName: string;
  estimatedHours: number;
  description: string;
  status: string;
}

// Helper to distribute hours evenly across working days
const distributeHours = (hours: number, days: string[]): Record<string, number> => {
  const r: Record<string, number> = {};
  if (!days.length) return r;
  const per = Math.floor(hours / days.length);
  const rem = hours - per * days.length;
  days.forEach((d, i) => { r[d] = per + (i < rem ? 1 : 0); });
  return r;
};

// Group working days by week for display
const groupDaysByWeek = (days: string[]): { weekLabel: string; days: string[] }[] => {
  const weeks: { weekLabel: string; days: string[] }[] = [];
  let currentWeek: string[] = [];
  let currentWeekNum = -1;

  days.forEach(day => {
    const d = new Date(day);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7);

    if (weekNum !== currentWeekNum) {
      if (currentWeek.length > 0) {
        weeks.push({
          weekLabel: `Week ${weeks.length + 1}`,
          days: currentWeek,
        });
      }
      currentWeek = [day];
      currentWeekNum = weekNum;
    } else {
      currentWeek.push(day);
    }
  });
  if (currentWeek.length > 0) {
    weeks.push({ weekLabel: `Week ${weeks.length + 1}`, days: currentWeek });
  }
  return weeks;
};

// Tasks already assigned to sprints
const buildInitialSprints = (): Sprint[] => {
  const sprint2Days = getWorkingDays("2026-03-16", "2026-04-03"); // 15 working days
  const sprint3Days = getWorkingDays("2026-02-24", "2026-03-14"); // 15 working days

  return [
    {
      id: 1, name: "Sprint 1", project: "Universal Software",
      startDate: "2026-02-24", endDate: "2026-03-14", duration: "3 weeks", status: "Active",
      tasks: [
        { id: 101, name: "User Auth Flow", project: "Universal Software", estimatedHours: 40, status: "In Progress", priority: "High",
          assignees: [
            { employeeId: "e1", employeeName: "John Doe", dayHours: {
              "2026-02-24": 4, "2026-02-25": 4, "2026-02-26": 3, "2026-02-27": 3, "2026-02-28": 2,
              "2026-03-03": 2, "2026-03-04": 2, "2026-03-05": 1, "2026-03-06": 0, "2026-03-07": 0,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
            { employeeId: "e4", employeeName: "Priya Sharma", dayHours: {
              "2026-02-24": 3, "2026-02-25": 3, "2026-02-26": 2, "2026-02-27": 2, "2026-02-28": 2,
              "2026-03-03": 2, "2026-03-04": 2, "2026-03-05": 2, "2026-03-06": 1, "2026-03-07": 0,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
        { id: 102, name: "Dashboard API", project: "Universal Software", estimatedHours: 30, status: "Open", priority: "High",
          assignees: [
            { employeeId: "e1", employeeName: "John Doe", dayHours: {
              "2026-02-24": 0, "2026-02-25": 0, "2026-02-26": 2, "2026-02-27": 2, "2026-02-28": 3,
              "2026-03-03": 3, "2026-03-04": 3, "2026-03-05": 4, "2026-03-06": 4, "2026-03-07": 3,
              "2026-03-10": 2, "2026-03-11": 2, "2026-03-12": 2, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
        { id: 103, name: "Profile Page", project: "Universal Software", estimatedHours: 24, status: "In Progress", priority: "Medium",
          assignees: [
            { employeeId: "e2", employeeName: "Ravi Kumar", dayHours: {
              "2026-02-24": 3, "2026-02-25": 3, "2026-02-26": 2, "2026-02-27": 2, "2026-02-28": 2,
              "2026-03-03": 2, "2026-03-04": 2, "2026-03-05": 2, "2026-03-06": 2, "2026-03-07": 2,
              "2026-03-10": 1, "2026-03-11": 1, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
        { id: 104, name: "Unit Tests", project: "Universal Software", estimatedHours: 36, status: "Open", priority: "Medium",
          assignees: [
            { employeeId: "e2", employeeName: "Ravi Kumar", dayHours: {
              "2026-02-24": 2, "2026-02-25": 2, "2026-02-26": 2, "2026-02-27": 2, "2026-02-28": 2,
              "2026-03-03": 2, "2026-03-04": 2, "2026-03-05": 2, "2026-03-06": 2, "2026-03-07": 2,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
            { employeeId: "e5", employeeName: "Amit Singh", dayHours: {
              "2026-02-24": 2, "2026-02-25": 2, "2026-02-26": 2, "2026-02-27": 2, "2026-02-28": 2,
              "2026-03-03": 1, "2026-03-04": 1, "2026-03-05": 1, "2026-03-06": 1, "2026-03-07": 0,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
        { id: 105, name: "Report Module", project: "Universal Software", estimatedHours: 48, status: "Open", priority: "High",
          assignees: [
            { employeeId: "e3", employeeName: "Mehul Patel", dayHours: {
              "2026-02-24": 4, "2026-02-25": 4, "2026-02-26": 4, "2026-02-27": 4, "2026-02-28": 4,
              "2026-03-03": 3, "2026-03-04": 3, "2026-03-05": 2, "2026-03-06": 2, "2026-03-07": 0,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
            { employeeId: "e6", employeeName: "Sneha Reddy", dayHours: {
              "2026-02-24": 3, "2026-02-25": 3, "2026-02-26": 3, "2026-02-27": 3, "2026-02-28": 2,
              "2026-03-03": 2, "2026-03-04": 2, "2026-03-05": 0, "2026-03-06": 0, "2026-03-07": 0,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
        { id: 106, name: "Bug Fixes", project: "Universal Software", estimatedHours: 30, status: "Open", priority: "Low",
          assignees: [
            { employeeId: "e3", employeeName: "Mehul Patel", dayHours: {
              "2026-02-24": 0, "2026-02-25": 0, "2026-02-26": 0, "2026-02-27": 0, "2026-02-28": 0,
              "2026-03-03": 3, "2026-03-04": 3, "2026-03-05": 4, "2026-03-06": 4, "2026-03-07": 4,
              "2026-03-10": 4, "2026-03-11": 4, "2026-03-12": 4, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
      ],
    },
    {
      id: 2, name: "Sprint 2", project: "Universal Software",
      startDate: "2025-03-03", endDate: "2025-03-07", duration: "1 week", status: "Planned",
      tasks: [
        { id: 201, name: "Search Feature", project: "Universal Software", estimatedHours: 20, status: "Open", priority: "High",
          assignees: [{ employeeId: "e4", employeeName: "Priya Sharma", dayHours: distributeHours(20, sprint2Days) }] },
        { id: 202, name: "Notification Service", project: "Universal Software", estimatedHours: 14, status: "Open", priority: "Medium",
          assignees: [{ employeeId: "e5", employeeName: "Amit Singh", dayHours: distributeHours(14, sprint2Days) }] },
      ],
    },
    {
      id: 3, name: "Sprint 1", project: "Super App",
      startDate: "2025-02-24", endDate: "2025-02-28", duration: "1 week", status: "Active",
      tasks: [
        { id: 301, name: "Payment Gateway", project: "Super App", estimatedHours: 24, status: "In Progress", priority: "Critical",
          assignees: [{ employeeId: "e4", employeeName: "Priya Sharma", dayHours: distributeHours(24, sprint3Days) }] },
      ],
    },
    {
      id: 4, name: "Release Sprint", project: "Go Live",
      startDate: "2025-03-10", endDate: "2025-03-28", duration: "3 weeks", status: "Planned",
      tasks: [
        { id: 401, name: "CI/CD Pipeline Setup & Config", project: "Go Live", estimatedHours: 48, status: "In Progress", priority: "High",
          assignees: [
            { employeeId: "e3", employeeName: "Mehul Patel", dayHours: {
              "2025-03-10": 6, "2025-03-11": 7, "2025-03-12": 5, "2025-03-13": 4, "2025-03-14": 3,
              "2025-03-17": 2, "2025-03-18": 2, "2025-03-19": 1, "2025-03-20": 0, "2025-03-21": 0,
              "2025-03-24": 0, "2025-03-25": 0, "2025-03-26": 0, "2025-03-27": 0, "2025-03-28": 0,
            }},
            { employeeId: "e1", employeeName: "John Doe", dayHours: {
              "2025-03-10": 4, "2025-03-11": 4, "2025-03-12": 3, "2025-03-13": 3, "2025-03-14": 2,
              "2025-03-17": 0, "2025-03-18": 0, "2025-03-19": 0, "2025-03-20": 0, "2025-03-21": 0,
              "2025-03-24": 0, "2025-03-25": 0, "2025-03-26": 0, "2025-03-27": 0, "2025-03-28": 0,
            }},
          ] },
        { id: 402, name: "Performance & Load Testing", project: "Go Live", estimatedHours: 56, status: "Open", priority: "High",
          assignees: [
            { employeeId: "e5", employeeName: "Amit Singh", dayHours: {
              "2025-03-10": 2, "2025-03-11": 2, "2025-03-12": 4, "2025-03-13": 4, "2025-03-14": 6,
              "2025-03-17": 6, "2025-03-18": 6, "2025-03-19": 4, "2025-03-20": 2, "2025-03-21": 0,
              "2025-03-24": 0, "2025-03-25": 0, "2025-03-26": 0, "2025-03-27": 0, "2025-03-28": 0,
            }},
            { employeeId: "e2", employeeName: "Ravi Kumar", dayHours: {
              "2025-03-10": 0, "2025-03-11": 0, "2025-03-12": 0, "2025-03-13": 2, "2025-03-14": 4,
              "2025-03-17": 4, "2025-03-18": 6, "2025-03-19": 6, "2025-03-20": 4, "2025-03-21": 2,
              "2025-03-24": 0, "2025-03-25": 0, "2025-03-26": 0, "2025-03-27": 0, "2025-03-28": 0,
            }},
          ] },
        { id: 403, name: "Security Audit & Pen Testing", project: "Go Live", estimatedHours: 40, status: "Open", priority: "Critical",
          assignees: [
            { employeeId: "e6", employeeName: "Sneha Reddy", dayHours: {
              "2025-03-10": 0, "2025-03-11": 0, "2025-03-12": 2, "2025-03-13": 4, "2025-03-14": 4,
              "2025-03-17": 6, "2025-03-18": 6, "2025-03-19": 6, "2025-03-20": 4, "2025-03-21": 2,
              "2025-03-24": 0, "2025-03-25": 0, "2025-03-26": 0, "2025-03-27": 0, "2025-03-28": 0,
            }},
          ] },
        { id: 404, name: "Production Deployment & Monitoring", project: "Go Live", estimatedHours: 36, status: "Open", priority: "Critical",
          assignees: [
            { employeeId: "e3", employeeName: "Mehul Patel", dayHours: {
              "2025-03-10": 0, "2025-03-11": 0, "2025-03-12": 0, "2025-03-13": 0, "2025-03-14": 0,
              "2025-03-17": 4, "2025-03-18": 4, "2025-03-19": 6, "2025-03-20": 6, "2025-03-21": 4,
              "2025-03-24": 0, "2025-03-25": 0, "2025-03-26": 0, "2025-03-27": 0, "2025-03-28": 0,
            }},
            { employeeId: "e1", employeeName: "John Doe", dayHours: {
              "2025-03-10": 0, "2025-03-11": 0, "2025-03-12": 0, "2025-03-13": 0, "2025-03-14": 0,
              "2025-03-17": 0, "2025-03-18": 0, "2025-03-19": 0, "2025-03-20": 4, "2025-03-21": 6,
              "2025-03-24": 2, "2025-03-25": 0, "2025-03-26": 0, "2025-03-27": 0, "2025-03-28": 0,
            }},
          ] },
        { id: 405, name: "UAT & Bug Fixes", project: "Go Live", estimatedHours: 44, status: "Open", priority: "High",
          assignees: [
            { employeeId: "e4", employeeName: "Priya Sharma", dayHours: {
              "2025-03-10": 0, "2025-03-11": 0, "2025-03-12": 0, "2025-03-13": 0, "2025-03-14": 0,
              "2025-03-17": 0, "2025-03-18": 0, "2025-03-19": 2, "2025-03-20": 4, "2025-03-21": 6,
              "2025-03-24": 8, "2025-03-25": 8, "2025-03-26": 6, "2025-03-27": 4, "2025-03-28": 2,
            }},
            { employeeId: "e6", employeeName: "Sneha Reddy", dayHours: {
              "2025-03-10": 0, "2025-03-11": 0, "2025-03-12": 0, "2025-03-13": 0, "2025-03-14": 0,
              "2025-03-17": 0, "2025-03-18": 0, "2025-03-19": 0, "2025-03-20": 0, "2025-03-21": 0,
              "2025-03-24": 4, "2025-03-25": 4, "2025-03-26": 0, "2025-03-27": 0, "2025-03-28": 0,
            }},
          ] },
      ],
    },
  ];
};

// Task queue
const initialTaskQueue: QueueTask[] = [
  { id: 1, name: "User Authentication Flow", project: "Universal Software", priority: "High", assigneeId: "e1", assigneeName: "John Doe", estimatedHours: 16, description: "Implement login/signup with JWT", status: "Ready" },
  { id: 2, name: "Dashboard API Integration", project: "Universal Software", priority: "High", assigneeId: "e4", assigneeName: "Priya Sharma", estimatedHours: 12, description: "Connect dashboard widgets to API", status: "Ready" },
  { id: 3, name: "Payment Gateway Setup", project: "Super App", priority: "Critical", assigneeId: "e5", assigneeName: "Amit Singh", estimatedHours: 24, description: "Integrate Razorpay", status: "Ready" },
  { id: 4, name: "Push Notification Service", project: "Super App", priority: "Medium", assigneeId: "e6", assigneeName: "Sneha Reddy", estimatedHours: 8, description: "Firebase push notifications", status: "Ready" },
  { id: 5, name: "Report Export Module", project: "Universal Software", priority: "Low", assigneeId: "e2", assigneeName: "Ravi Kumar", estimatedHours: 6, description: "PDF/Excel export", status: "Ready" },
  { id: 6, name: "CI/CD Pipeline Setup", project: "Go Live", priority: "High", assigneeId: "e3", assigneeName: "Mehul Patel", estimatedHours: 10, description: "GitHub Actions pipeline", status: "Ready" },
  { id: 7, name: "Mobile Responsive Design", project: "Super App", priority: "Medium", assigneeId: "e6", assigneeName: "Sneha Reddy", estimatedHours: 14, description: "Responsive layouts", status: "Ready" },
  { id: 8, name: "Database Migration Script", project: "Universal Software", priority: "High", assigneeId: "e1", assigneeName: "John Doe", estimatedHours: 8, description: "Schema v2 migration", status: "Ready" },
  { id: 9, name: "Unit Test Coverage", project: "Go Live", priority: "Medium", assigneeId: "e4", assigneeName: "Priya Sharma", estimatedHours: 12, description: "Increase coverage to 80%", status: "Ready" },
  { id: 10, name: "Error Logging System", project: "Universal Software", priority: "Low", assigneeId: "e5", assigneeName: "Amit Singh", estimatedHours: 6, description: "Sentry integration", status: "Ready" },
  { id: 11, name: "User Role Management", project: "Human Resource", priority: "High", assigneeId: "e6", assigneeName: "Sneha Reddy", estimatedHours: 18, description: "RBAC implementation", status: "Ready" },
  { id: 12, name: "Leave Approval Workflow", project: "Human Resource", priority: "Medium", assigneeId: "e2", assigneeName: "Ravi Kumar", estimatedHours: 10, description: "Multi-level approval", status: "Ready" },
];

const Sprints = () => {
  // Sprint form state
  const [sprintName, setSprintName] = useState("");
  const [sprintProject, setSprintProject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sprintStatus, setSprintStatus] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Data state
  const [sprints, setSprints] = useState<Sprint[]>(buildInitialSprints);
  const [taskQueue, setTaskQueue] = useState<QueueTask[]>(initialTaskQueue);

  // Filter state
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Task selection for create sprint form
  const [sprintSelectedTaskIds, setSprintSelectedTaskIds] = useState<number[]>([]);
  // Multi-employee assignment per task: taskId -> employeeId[]
  const [taskEmployeeMap, setTaskEmployeeMap] = useState<Record<number, string[]>>({});
  // Day-wise hours for create form: "taskId-employeeId" -> { date: hours }
  const [createDayHours, setCreateDayHours] = useState<Record<string, Record<string, number>>>({});

  // Sprint detail view
  const [viewingSprint, setViewingSprint] = useState<Sprint | null>(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", project: "", startDate: "", endDate: "", status: "" });

  // --- Computed ---

  const getEmployeeDailyAllocationFromSprints = (employeeId: string, date: string, excludeSprintId?: number) => {
    let total = 0;
    sprints.forEach((s) => {
      if (excludeSprintId && s.id === excludeSprintId) return;
      s.tasks.forEach((task) => {
        task.assignees.forEach((a) => {
          if (a.employeeId === employeeId && a.dayHours[date]) {
            total += a.dayHours[date];
          }
        });
      });
    });
    return total;
  };

  const filteredSprints = sprints.filter((sprint) => {
    const matchesProject = filterProject === "all" || sprint.project === filterProject;
    const matchesStatus = filterStatus === "all" || sprint.status === filterStatus;
    return matchesProject && matchesStatus;
  });

  // Summary stats
  const totalSprintHours = sprints.reduce((sum, s) => sum + s.tasks.reduce((ts, t) => ts + t.estimatedHours, 0), 0);
  const activeSprints = sprints.filter((s) => s.status === "Active").length;
  const overAllocatedCount = useMemo(() => {
    const checked = new Set<string>();
    let count = 0;
    sprints.forEach((s) => {
      const days = getWorkingDays(s.startDate, s.endDate);
      s.tasks.forEach((task) => {
        task.assignees.forEach((a) => {
          days.forEach((day) => {
            const key = `${a.employeeId}-${day}`;
            if (!checked.has(key)) {
              checked.add(key);
              const totalForDay = getEmployeeDailyAllocationFromSprints(a.employeeId, day);
              if (totalForDay > DAILY_CAPACITY) count++;
            }
          });
        });
      });
    });
    return count;
  }, [sprints]);

  // --- Handlers ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintName.trim()) { toast.error("Please enter sprint name"); return; }
    if (!sprintProject) { toast.error("Please select a project"); return; }
    if (!startDate) { toast.error("Please select start date"); return; }
    if (!endDate) { toast.error("Please select end date"); return; }
    if (!sprintStatus) { toast.error("Please select sprint status"); return; }

    const selectedTasks = taskQueue.filter(t => sprintSelectedTaskIds.includes(t.id));
    const workingDays = getWorkingDays(startDate, endDate);

    const sprintTasks: SprintTask[] = selectedTasks.map(task => {
      const empIds = taskEmployeeMap[task.id] || [task.assigneeId];
      return {
        id: task.id,
        name: task.name,
        project: task.project,
        estimatedHours: task.estimatedHours,
        status: task.status,
        priority: task.priority,
        assignees: empIds.map(empId => {
          const emp = employeesData.find(e => e.id === empId);
          const key = `${task.id}-${empId}`;
          const dayHours = createDayHours[key] || distributeHours(task.estimatedHours, workingDays);
          return {
            employeeId: empId,
            employeeName: emp?.name || "Unknown",
            dayHours,
          };
        }),
      };
    });

    const newSprint: Sprint = {
      id: Date.now(),
      name: sprintName,
      project: sprintProject,
      startDate,
      endDate,
      duration: "1 week",
      status: sprintStatus,
      tasks: sprintTasks,
    };
    setSprints((prev) => [...prev, newSprint]);
    toast.success(`Sprint "${sprintName}" created successfully!`);
    setSprintName(""); setSprintProject(""); setStartDate(""); setEndDate(""); setSprintStatus("");
    setSprintSelectedTaskIds([]);
    setTaskEmployeeMap({});
    setCreateDayHours({});
    setShowCreateForm(false);
  };

  const handleEditSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setEditFormData({ name: sprint.name, project: sprint.project, startDate: sprint.startDate, endDate: sprint.endDate, status: sprint.status });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData.name.trim()) { toast.error("Please enter sprint name"); return; }
    if (!selectedSprint) return;
    setSprints((prev) =>
      prev.map((s) =>
        s.id === selectedSprint.id
          ? { ...s, name: editFormData.name, project: editFormData.project, startDate: editFormData.startDate, endDate: editFormData.endDate, status: editFormData.status }
          : s
      )
    );
    toast.success(`Sprint "${editFormData.name}" updated successfully!`);
    setEditDialogOpen(false);
    setSelectedSprint(null);
  };

  const handleDeleteSprint = (sprint: Sprint) => {
    setSprints((prev) => prev.filter((s) => s.id !== sprint.id));
    toast.success(`Sprint "${sprint.name}" deleted.`);
  };

  const handleUpdateSprintDayHours = (sprintId: number, taskId: number, employeeId: string, day: string, hours: number) => {
    setSprints(prev => prev.map(s => {
      if (s.id !== sprintId) return s;
      return {
        ...s,
        tasks: s.tasks.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            assignees: t.assignees.map(a => {
              if (a.employeeId !== employeeId) return a;
              return { ...a, dayHours: { ...a.dayHours, [day]: hours } };
            }),
          };
        }),
      };
    }));
    // Update viewingSprint as well
    setViewingSprint(prev => {
      if (!prev || prev.id !== sprintId) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            assignees: t.assignees.map(a => {
              if (a.employeeId !== employeeId) return a;
              return { ...a, dayHours: { ...a.dayHours, [day]: hours } };
            }),
          };
        }),
      };
    });
  };

  // --- Badge helpers ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return <Badge className="bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30 text-[10px] font-medium">{status}</Badge>;
      case "Active": return <Badge className="bg-[hsl(var(--info))]/15 text-[hsl(var(--info))] border-[hsl(var(--info))]/30 text-[10px] font-medium">{status}</Badge>;
      case "Planned": return <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">{status}</Badge>;
      case "In Progress": return <Badge className="bg-[hsl(var(--info))]/15 text-[hsl(var(--info))] border-[hsl(var(--info))]/30 text-[10px] font-medium">{status}</Badge>;
      case "Open": return <Badge variant="outline" className="text-[10px] font-medium">{status}</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical": return <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px] font-medium">{priority}</Badge>;
      case "High": return <Badge className="bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30 text-[10px] font-medium">{priority}</Badge>;
      case "Medium": return <Badge variant="outline" className="text-[10px] font-medium">{priority}</Badge>;
      case "Low": return <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">{priority}</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">{priority}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  // --- Day-wise Employee Grid Component ---
  const DayWiseEmployeeGrid = ({
    employees,
    workingDays,
    dayHoursMap,
    onUpdateHours,
    getDailyAllocation,
    readOnly = false,
  }: {
    employees: { id: string; name: string }[];
    workingDays: string[];
    dayHoursMap: Record<string, Record<string, number>>; // employeeId -> { date -> hours }
    onUpdateHours: (employeeId: string, day: string, hours: number) => void;
    getDailyAllocation: (employeeId: string, day: string) => number;
    readOnly?: boolean;
  }) => {
    if (workingDays.length === 0) {
      return <p className="text-[10px] text-muted-foreground py-2 px-4">No working days in selected range</p>;
    }

    const weeks = groupDaysByWeek(workingDays);
    const hasMultipleWeeks = weeks.length > 1;

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {/* Week group header row (only if multiple weeks) */}
            {hasMultipleWeeks && (
              <TableRow className="hover:bg-transparent border-0">
                <TableHead className="sticky left-0 bg-background z-10 min-w-[120px]" />
                {weeks.map((week, wi) => (
                  <TableHead
                    key={wi}
                    colSpan={week.days.length}
                    className="text-[10px] py-1 h-auto text-center font-bold text-primary border-l border-r border-border/40"
                  >
                    {week.weekLabel}
                    <span className="text-muted-foreground font-normal ml-1">
                      ({formatShortDay(week.days[0])} – {formatShortDay(week.days[week.days.length - 1])})
                    </span>
                  </TableHead>
                ))}
                <TableHead className="min-w-[60px]" />
              </TableRow>
            )}
            {/* Day columns header */}
            <TableRow className="hover:bg-transparent border-0">
              <TableHead className="text-[10px] py-1.5 h-auto whitespace-nowrap sticky left-0 bg-background z-10 min-w-[120px]">Employee</TableHead>
              {workingDays.map((day, i) => {
                // Add left border at week boundaries
                const isWeekStart = hasMultipleWeeks && i > 0 && weeks.some(w => w.days[0] === day);
                return (
                  <TableHead key={day} className={`text-[10px] py-1.5 h-auto text-center whitespace-nowrap min-w-[72px] ${isWeekStart ? "border-l border-border/40" : ""}`}>
                    {formatShortDay(day)}
                  </TableHead>
                );
              })}
              <TableHead className="text-[10px] py-1.5 h-auto text-center whitespace-nowrap min-w-[60px] font-semibold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => {
              const empDayHours = dayHoursMap[emp.id] || {};
              const totalAssigned = Object.values(empDayHours).reduce((s, h) => s + h, 0);

              return (
                <TableRow key={emp.id} className="border-0 hover:bg-muted/20">
                  <TableCell className="py-1 sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span className="text-xs whitespace-nowrap">{emp.name}</span>
                    </div>
                  </TableCell>
                  {workingDays.map((day, i) => {
                    const thisHours = empDayHours[day] || 0;
                    const otherAllocation = getDailyAllocation(emp.id, day);
                    const remaining = DAILY_CAPACITY - otherAllocation - thisHours;
                    const isWeekStart = hasMultipleWeeks && i > 0 && weeks.some(w => w.days[0] === day);

                    return (
                      <TableCell key={day} className={`py-1 px-1 text-center ${isWeekStart ? "border-l border-border/40" : ""}`}>
                        <div className="flex flex-col items-center gap-0.5">
                          {readOnly ? (
                            <span className={`text-xs font-semibold ${thisHours > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                              {thisHours}h
                            </span>
                          ) : (
                            <Input
                              type="number"
                              min={0}
                              max={DAILY_CAPACITY}
                              value={thisHours || ""}
                              placeholder="0"
                              onChange={(e) => {
                                const val = Math.max(0, Number(e.target.value) || 0);
                                onUpdateHours(emp.id, day, val);
                              }}
                              className="h-7 w-14 text-[11px] text-center p-0 mx-auto"
                            />
                          )}
                          <span className={`text-[9px] leading-none ${remaining < 0 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                            {remaining < 0 && <AlertTriangle className="h-2.5 w-2.5 inline mr-0.5" />}
                            {remaining}h left
                          </span>
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="py-1 text-center">
                    <span className="text-xs font-bold">{totalAssigned}h</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Sprint Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Plan weekly sprints, assign tasks, and track employee capacity
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gap-1.5 shadow-sm"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Sprint
          </Button>
        </div>

        {/* Create Sprint Form */}
        {showCreateForm && (
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Create New Sprint
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreateForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="sprint-name" className="text-xs font-medium">Sprint Name</Label>
                    <Input id="sprint-name" placeholder="e.g., Sprint 1" value={sprintName} onChange={(e) => setSprintName(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sprint-project" className="text-xs font-medium">Project</Label>
                    <Select value={sprintProject} onValueChange={setSprintProject}>
                      <SelectTrigger id="sprint-project" className="h-9 text-sm bg-background"><SelectValue placeholder="Select project" /></SelectTrigger>
                      <SelectContent className="bg-background">
                        {projectsData.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="start-date" className="text-xs font-medium">Start Date</Label>
                    <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="end-date" className="text-xs font-medium">End Date</Label>
                    <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sprint-status" className="text-xs font-medium">Status</Label>
                    <Select value={sprintStatus} onValueChange={setSprintStatus}>
                      <SelectTrigger id="sprint-status" className="h-9 text-sm bg-background"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="Planned">Planned</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Task & Employee Day-wise Assignment */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Select Tasks & Assign Day-wise Hours *</Label>
                  <div className="border rounded-md overflow-hidden">
                    {(() => {
                      const filteredTasks = sprintProject
                        ? taskQueue.filter(t => t.project === sprintProject)
                        : taskQueue;
                      const workingDays = startDate && endDate ? getWorkingDays(startDate, endDate) : [];

                      if (filteredTasks.length === 0) {
                        return (
                          <div className="text-center text-xs text-muted-foreground py-6">
                            {sprintProject ? `No tasks available for ${sprintProject}` : "Select a project to see available tasks"}
                          </div>
                        );
                      }

                      return filteredTasks.map((task) => {
                        const isSelected = sprintSelectedTaskIds.includes(task.id);
                        const assignedEmployeeIds = taskEmployeeMap[task.id] || [task.assigneeId];

                        return (
                          <div key={task.id} className={`border-b last:border-b-0 ${isSelected ? "bg-primary/5" : ""}`}>
                            {/* Task Header Row */}
                            <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/30">
                              <Checkbox
                                className="h-3.5 w-3.5"
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSprintSelectedTaskIds(prev => [...prev, task.id]);
                                    // Auto-distribute hours for default assignee
                                    if (startDate && endDate) {
                                      const days = getWorkingDays(startDate, endDate);
                                      const key = `${task.id}-${task.assigneeId}`;
                                      setCreateDayHours(prev => ({
                                        ...prev,
                                        [key]: prev[key] || distributeHours(task.estimatedHours, days),
                                      }));
                                    }
                                  } else {
                                    setSprintSelectedTaskIds(prev => prev.filter(id => id !== task.id));
                                  }
                                }}
                              />
                              <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs font-semibold text-foreground">{task.name}</span>
                              <Badge variant="outline" className="text-[10px] ml-1">{task.estimatedHours}h</Badge>
                              {getPriorityBadge(task.priority)}
                              <Badge variant="outline" className="text-[10px] ml-auto">
                                <Users className="h-3 w-3 mr-1" />
                                {assignedEmployeeIds.length}
                              </Badge>
                            </div>

                            {/* Employee Day-wise Grid (shown when task is selected) */}
                            {isSelected && (
                              <div className="px-4 py-2 pl-8">
                                {!startDate || !endDate ? (
                                  <p className="text-[10px] text-muted-foreground py-2">Set sprint start & end dates to see day-wise allocation</p>
                                ) : (
                                  <>
                                    {/* Employee selection checkboxes */}
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      {employeesData.map(emp => {
                                        const isEmpSelected = assignedEmployeeIds.includes(emp.id);
                                        return (
                                          <label key={emp.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs cursor-pointer transition-colors ${isEmpSelected ? "bg-primary/10 border-primary/30" : "bg-muted/20 border-border"}`}>
                                            <Checkbox
                                              className="h-3 w-3"
                                              checked={isEmpSelected}
                                              onCheckedChange={(checked) => {
                                                setTaskEmployeeMap(prev => {
                                                  const current = prev[task.id] || [task.assigneeId];
                                                  const updated = checked
                                                    ? [...current, emp.id]
                                                    : current.filter(id => id !== emp.id);
                                                  return { ...prev, [task.id]: updated };
                                                });
                                              }}
                                            />
                                            {emp.name}
                                          </label>
                                        );
                                      })}
                                    </div>

                                    {/* Day-wise grid for selected employees */}
                                    {assignedEmployeeIds.length > 0 && (
                                      <DayWiseEmployeeGrid
                                        employees={assignedEmployeeIds.map(id => {
                                          const emp = employeesData.find(e => e.id === id);
                                          return { id, name: emp?.name || "Unknown" };
                                        })}
                                        workingDays={workingDays}
                                        dayHoursMap={Object.fromEntries(
                                          assignedEmployeeIds.map(empId => [
                                            empId,
                                            createDayHours[`${task.id}-${empId}`] || {},
                                          ])
                                        )}
                                        onUpdateHours={(empId, day, hours) => {
                                          const key = `${task.id}-${empId}`;
                                          setCreateDayHours(prev => ({
                                            ...prev,
                                            [key]: { ...(prev[key] || {}), [day]: hours },
                                          }));
                                        }}
                                        getDailyAllocation={(empId, day) => {
                                          // Sum from other tasks in this create form + existing sprints
                                          let otherCreate = 0;
                                          Object.entries(createDayHours).forEach(([k, dh]) => {
                                            if (k.endsWith(`-${empId}`) && k !== `${task.id}-${empId}`) {
                                              otherCreate += (dh[day] || 0);
                                            }
                                          });
                                          const fromSprints = getEmployeeDailyAllocationFromSprints(empId, day);
                                          return otherCreate + fromSprints;
                                        }}
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                  {sprintSelectedTaskIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {sprintSelectedTaskIds.length} task(s) selected · {taskQueue.filter(t => sprintSelectedTaskIds.includes(t.id)).reduce((sum, t) => sum + t.estimatedHours, 0)}h total estimated
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Button type="submit" size="sm" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Create Sprint
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sprint List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                </div>
                Sprint List
                <Badge variant="outline" className="text-[10px] ml-1">{filteredSprints.length}</Badge>
              </CardTitle>
              <div className="flex gap-2">
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger className="h-8 text-xs w-40 bg-background"><SelectValue placeholder="All Projects" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectsData.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 text-xs w-32 bg-background"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              {filteredSprints.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-10">
                  No sprints found. Create your first sprint to get started.
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  {filteredSprints.map((sprint) => {
                    const totalHours = sprint.tasks.reduce((s, t) => s + t.estimatedHours, 0);
                    const uniqueEmployees = new Set<string>();
                    sprint.tasks.forEach(t => t.assignees.forEach(a => uniqueEmployees.add(a.employeeId)));
                    const workingDays = getWorkingDays(sprint.startDate, sprint.endDate);
                    const isExpanded = viewingSprint?.id === sprint.id;

                    return (
                      <div key={sprint.id} className="border-b last:border-b-0">
                        {/* Sprint Header Row */}
                        <div
                          className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 cursor-pointer group hover:bg-muted/50 transition-colors"
                          onClick={() => setViewingSprint(isExpanded ? null : sprint)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                            <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{sprint.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">— {sprint.project}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                              {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              <ListChecks className="h-3 w-3 mr-1" />
                              {sprint.tasks.length} tasks
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                              <Clock className="h-3 w-3 mr-1" />
                              {totalHours}h
                            </Badge>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              <Users className="h-3 w-3 mr-1" />
                              {uniqueEmployees.size}
                            </Badge>
                            {getStatusBadge(sprint.status)}
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditSprint(sprint)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteSprint(sprint)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded: Task-centric with day-wise employee grid */}
                        {isExpanded && (
                          <div className="px-4 py-2 space-y-2">
                            {sprint.tasks.map((task) => (
                              <div key={task.id} className="border rounded-md overflow-hidden">
                                {/* Task Header */}
                                <div className="flex items-center gap-3 px-3 py-2 bg-muted/20">
                                  <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-xs font-semibold text-foreground">{task.name}</span>
                                  <Badge variant="outline" className="text-[10px]">{task.estimatedHours}h</Badge>
                                  {getPriorityBadge(task.priority)}
                                  {getStatusBadge(task.status)}
                                  <Badge variant="outline" className="text-[10px] ml-auto">
                                    <Users className="h-3 w-3 mr-1" />
                                    {task.assignees.length}
                                  </Badge>
                                </div>
                                {/* Day-wise employee grid */}
                                <div className="pl-6 py-1">
                                  <DayWiseEmployeeGrid
                                    employees={task.assignees.map(a => ({ id: a.employeeId, name: a.employeeName }))}
                                    workingDays={workingDays}
                                    dayHoursMap={Object.fromEntries(
                                      task.assignees.map(a => [a.employeeId, a.dayHours])
                                    )}
                                    onUpdateHours={(empId, day, hours) => {
                                      handleUpdateSprintDayHours(sprint.id, task.id, empId, day, hours);
                                    }}
                                    getDailyAllocation={(empId, day) => {
                                      // Get allocation from OTHER tasks/sprints for this employee on this day
                                      let total = 0;
                                      sprints.forEach(s => {
                                        s.tasks.forEach(t => {
                                          if (s.id === sprint.id && t.id === task.id) return; // exclude current
                                          t.assignees.forEach(a => {
                                            if (a.employeeId === empId) total += (a.dayHours[day] || 0);
                                          });
                                        });
                                      });
                                      return total;
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Sprint Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Sprint</DialogTitle>
              <DialogDescription>Update sprint details</DialogDescription>
            </DialogHeader>
            {selectedSprint && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sprint-name">Sprint Name</Label>
                  <Input id="edit-sprint-name" value={editFormData.name} onChange={(e) => setEditFormData((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sprint-project">Project</Label>
                  <Select value={editFormData.project} onValueChange={(v) => setEditFormData((p) => ({ ...p, project: v }))}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent className="bg-background">
                      {projectsData.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-date">Start Date</Label>
                    <Input id="edit-start-date" type="date" value={editFormData.startDate} onChange={(e) => setEditFormData((p) => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-end-date">End Date</Label>
                    <Input id="edit-end-date" type="date" value={editFormData.endDate} onChange={(e) => setEditFormData((p) => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sprint-status">Status</Label>
                  <Select value={editFormData.status} onValueChange={(v) => setEditFormData((p) => ({ ...p, status: v }))}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Sprints;
