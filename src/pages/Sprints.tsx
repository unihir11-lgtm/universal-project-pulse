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
  assigneeId: string;
  assigneeName: string;
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

// Tasks already assigned to sprints
const initialSprintsData: Sprint[] = [
  {
    id: 1,
    name: "Sprint 1",
    project: "Universal Software",
    startDate: "2025-02-24",
    endDate: "2025-02-28",
    duration: "1 week",
    status: "Active",
    tasks: [
      { id: 101, name: "User Auth Flow", project: "Universal Software", assigneeId: "e1", assigneeName: "John Doe", estimatedHours: 16, status: "In Progress", priority: "High" },
      { id: 102, name: "Dashboard API", project: "Universal Software", assigneeId: "e1", assigneeName: "John Doe", estimatedHours: 12, status: "Open", priority: "High" },
      { id: 103, name: "Profile Page", project: "Universal Software", assigneeId: "e2", assigneeName: "Ravi Kumar", estimatedHours: 8, status: "In Progress", priority: "Medium" },
      { id: 104, name: "Unit Tests", project: "Universal Software", assigneeId: "e2", assigneeName: "Ravi Kumar", estimatedHours: 12, status: "Open", priority: "Medium" },
      { id: 105, name: "Report Module", project: "Universal Software", assigneeId: "e3", assigneeName: "Mehul Patel", estimatedHours: 20, status: "Open", priority: "High" },
      { id: 106, name: "Bug Fixes", project: "Universal Software", assigneeId: "e3", assigneeName: "Mehul Patel", estimatedHours: 20, status: "Open", priority: "Low" },
    ],
  },
  {
    id: 2,
    name: "Sprint 2",
    project: "Universal Software",
    startDate: "2025-03-03",
    endDate: "2025-03-07",
    duration: "1 week",
    status: "Planned",
    tasks: [
      { id: 201, name: "Search Feature", project: "Universal Software", assigneeId: "e4", assigneeName: "Priya Sharma", estimatedHours: 20, status: "Open", priority: "High" },
      { id: 202, name: "Notification Service", project: "Universal Software", assigneeId: "e5", assigneeName: "Amit Singh", estimatedHours: 14, status: "Open", priority: "Medium" },
    ],
  },
  {
    id: 3,
    name: "Sprint 1",
    project: "Super App",
    startDate: "2025-02-24",
    endDate: "2025-02-28",
    duration: "1 week",
    status: "Active",
    tasks: [
      { id: 301, name: "Payment Gateway", project: "Super App", assigneeId: "e4", assigneeName: "Priya Sharma", estimatedHours: 24, status: "In Progress", priority: "Critical" },
    ],
  },
];

// Task queue — tasks not yet in any sprint
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
  const [sprints, setSprints] = useState<Sprint[]>(initialSprintsData);
  const [taskQueue, setTaskQueue] = useState<QueueTask[]>(initialTaskQueue);

  // Filter state
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Task selection for create sprint form
  const [sprintSelectedTaskIds, setSprintSelectedTaskIds] = useState<number[]>([]);
  // Multi-employee assignment per task: taskId -> employeeId[]
  const [taskEmployeeMap, setTaskEmployeeMap] = useState<Record<number, string[]>>({});

  // Sprint detail view
  const [viewingSprint, setViewingSprint] = useState<Sprint | null>(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", project: "", startDate: "", endDate: "", status: "" });

  // --- Computed ---

  const getEmployeeAllocationForSprint = (sprint: Sprint) => {
    const allocationMap = new Map<string, { name: string; assigned: number; tasks: string[] }>();
    sprint.tasks.forEach((task) => {
      const existing = allocationMap.get(task.assigneeId) || { name: task.assigneeName, assigned: 0, tasks: [] };
      existing.assigned += task.estimatedHours;
      existing.tasks.push(task.name);
      allocationMap.set(task.assigneeId, existing);
    });
    return Array.from(allocationMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      capacity: WEEKLY_CAPACITY,
      assigned: data.assigned,
      remaining: WEEKLY_CAPACITY - data.assigned,
      tasks: data.tasks,
      isOverAllocated: data.assigned > WEEKLY_CAPACITY,
    }));
  };

  const getEmployeeWeeklyAllocation = (employeeId: string, sprintStartDate: string, sprintEndDate: string) => {
    let totalHours = 0;
    const details: { sprintName: string; project: string; hours: number }[] = [];
    sprints.forEach((s) => {
      const overlaps = s.startDate <= sprintEndDate && s.endDate >= sprintStartDate;
      if (overlaps) {
        let sprintHours = 0;
        s.tasks.filter((t) => t.assigneeId === employeeId).forEach((t) => {
          sprintHours += t.estimatedHours;
          totalHours += t.estimatedHours;
        });
        if (sprintHours > 0) {
          details.push({ sprintName: s.name, project: s.project, hours: sprintHours });
        }
      }
    });
    return { totalHours, details };
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
      s.tasks.forEach((t) => {
        if (!checked.has(t.assigneeId + s.startDate)) {
          checked.add(t.assigneeId + s.startDate);
          const { totalHours } = getEmployeeWeeklyAllocation(t.assigneeId, s.startDate, s.endDate);
          if (totalHours > WEEKLY_CAPACITY) count++;
        }
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

    const newSprint: Sprint = {
      id: Date.now(),
      name: sprintName,
      project: sprintProject,
      startDate,
      endDate,
      duration: "1 week",
      status: sprintStatus,
      tasks: [],
    };
    setSprints((prev) => [...prev, newSprint]);
    toast.success(`Sprint "${sprintName}" created successfully!`);
    setSprintName(""); setSprintProject(""); setStartDate(""); setEndDate(""); setSprintStatus("");
    setSprintSelectedTaskIds([]);
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

  const getUtilColor = (pct: number) => {
    if (pct > 100) return "text-destructive";
    if (pct >= 80) return "text-[hsl(var(--warning))]";
    if (pct >= 50) return "text-foreground";
    return "text-[hsl(var(--success))]";
  };

  const getProgressColor = (pct: number) => {
    if (pct > 100) return "[&>div]:bg-destructive";
    if (pct >= 80) return "[&>div]:bg-[hsl(var(--warning))]";
    return "[&>div]:bg-primary";
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

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Layers className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Sprints</p>
                  <p className="text-xl font-bold text-foreground">{sprints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[hsl(var(--info))]/5 to-[hsl(var(--info))]/10 border-[hsl(var(--info))]/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[hsl(var(--info))]/15 flex items-center justify-center">
                  <Zap className="h-4.5 w-4.5 text-[hsl(var(--info))]" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active</p>
                  <p className="text-xl font-bold text-foreground">{activeSprints}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-accent/15 flex items-center justify-center">
                  <TrendingUp className="h-4.5 w-4.5 text-accent" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Hours</p>
                  <p className="text-xl font-bold text-foreground">{totalSprintHours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`bg-gradient-to-br ${overAllocatedCount > 0 ? "from-destructive/5 to-destructive/10 border-destructive/20" : "from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${overAllocatedCount > 0 ? "bg-destructive/15" : "bg-[hsl(var(--success))]/15"}`}>
                  <AlertTriangle className={`h-4.5 w-4.5 ${overAllocatedCount > 0 ? "text-destructive" : "text-[hsl(var(--success))]"}`} />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Over-Allocated</p>
                  <p className="text-xl font-bold text-foreground">{overAllocatedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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

                {/* Task & Employee Assignment Table */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Select Tasks from Queue *</Label>
                  <div className="border rounded-md overflow-hidden">
                    {(() => {
                      const filteredTasks = sprintProject
                        ? taskQueue.filter(t => t.project === sprintProject)
                        : taskQueue;

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
                                  setSprintSelectedTaskIds(prev =>
                                    checked ? [...prev, task.id] : prev.filter(id => id !== task.id)
                                  );
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
                            {/* Employee Selection Grid */}
                            <div className="px-4 py-2 pl-12">
                              <Table>
                                <TableHeader>
                                  <TableRow className="hover:bg-transparent border-0">
                                    <TableHead className="text-[10px] py-1 h-auto w-8"></TableHead>
                                    <TableHead className="text-[10px] py-1 h-auto">Employee</TableHead>
                                    <TableHead className="text-[10px] py-1 h-auto text-center">Weekly Capacity</TableHead>
                                    <TableHead className="text-[10px] py-1 h-auto text-center">Allocated Hours</TableHead>
                                    <TableHead className="text-[10px] py-1 h-auto text-center">Remaining Hours</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {employeesData.map((emp) => {
                                    const isEmpSelected = assignedEmployeeIds.includes(emp.id);
                                    const allocatedHours = startDate && endDate
                                      ? getEmployeeWeeklyAllocation(emp.id, startDate, endDate).totalHours
                                      : 0;
                                    const remaining = WEEKLY_CAPACITY - allocatedHours;

                                    return (
                                      <TableRow key={emp.id} className={`border-0 hover:bg-muted/20 ${isEmpSelected ? "bg-primary/5" : ""}`}>
                                        <TableCell className="py-1 pr-0">
                                          <Checkbox
                                            className="h-3.5 w-3.5"
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
                                        </TableCell>
                                        <TableCell className="py-1">
                                          <span className="text-xs">{emp.name}</span>
                                        </TableCell>
                                        <TableCell className="py-1 text-center text-xs">{WEEKLY_CAPACITY}h</TableCell>
                                        <TableCell className="py-1 text-center text-xs font-medium">{allocatedHours}h</TableCell>
                                        <TableCell className={`py-1 text-center text-xs font-medium ${remaining < 0 ? "text-destructive" : ""}`}>{remaining}h</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  {sprintSelectedTaskIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {sprintSelectedTaskIds.length} task(s) selected · {taskQueue.filter(t => sprintSelectedTaskIds.includes(t.id)).reduce((sum, t) => sum + t.estimatedHours, 0)}h total
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
                    // Group tasks by unique employees
                    const tasksByEmployee = new Map<string, { name: string; tasks: SprintTask[] }>();
                    sprint.tasks.forEach((task) => {
                      const existing = tasksByEmployee.get(task.assigneeId) || { name: task.assigneeName, tasks: [] };
                      existing.tasks.push(task);
                      tasksByEmployee.set(task.assigneeId, existing);
                    });

                    return (
                      <div key={sprint.id} className="border-b last:border-b-0">
                        {/* Sprint Header Row */}
                        <div
                          className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 cursor-pointer group hover:bg-muted/50 transition-colors"
                          onClick={() => setViewingSprint(viewingSprint?.id === sprint.id ? null : sprint)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
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
                              {tasksByEmployee.size}
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

                        {/* Expanded: Task-centric nested view */}
                        {viewingSprint?.id === sprint.id && (
                          <div className="px-4 py-2 space-y-1">
                            {sprint.tasks.map((task) => {
                              const { totalHours: empWeekAlloc } = getEmployeeWeeklyAllocation(task.assigneeId, sprint.startDate, sprint.endDate);
                              const remaining = WEEKLY_CAPACITY - empWeekAlloc;

                              return (
                                <div key={task.id} className="border rounded-md overflow-hidden">
                                  {/* Task Header */}
                                  <div className="flex items-center gap-3 px-3 py-2 bg-muted/20">
                                    <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-foreground">{task.name}</span>
                                    <Badge variant="outline" className="text-[10px]">{task.estimatedHours}h</Badge>
                                    {getPriorityBadge(task.priority)}
                                    {getStatusBadge(task.status)}
                                  </div>
                                  {/* Employee Detail Row */}
                                  <div className="pl-8">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="hover:bg-transparent border-0">
                                          <TableHead className="text-[10px] py-1 h-auto">Employee</TableHead>
                                          <TableHead className="text-[10px] py-1 h-auto text-center">Weekly Capacity</TableHead>
                                          <TableHead className="text-[10px] py-1 h-auto text-center">Allocated Hours</TableHead>
                                          <TableHead className="text-[10px] py-1 h-auto text-center">Remaining Hours</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        <TableRow className="border-0 hover:bg-muted/20">
                                          <TableCell className="py-1">
                                            <div className="flex items-center gap-1.5">
                                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-2.5 w-2.5 text-primary" />
                                              </div>
                                              <span className="text-xs">{task.assigneeName}</span>
                                              {remaining < 0 && <AlertTriangle className="h-3 w-3 text-destructive" />}
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-1 text-center text-xs">{WEEKLY_CAPACITY}h</TableCell>
                                          <TableCell className="py-1 text-center text-xs font-medium">{empWeekAlloc}h</TableCell>
                                          <TableCell className={`py-1 text-center text-xs font-medium ${remaining < 0 ? "text-destructive" : ""}`}>{remaining}h</TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              );
                            })}
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


        {/* Sprint Dashboard */}
        {viewingSprint && (
          <Card className="border-primary/15 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {viewingSprint.name} — {viewingSprint.project}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(viewingSprint.startDate)} – {formatDate(viewingSprint.endDate)} · {viewingSprint.tasks.length} tasks · {viewingSprint.duration}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setViewingSprint(null)}>
                  <X className="h-3.5 w-3.5" />
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
              {/* Employee Capacity Table */}
              <div>
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Team Capacity</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5">Employee</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5 text-center">Capacity</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5 text-center">This Sprint</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5 text-center">Total Week</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5 text-center">Remaining</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5 w-40">Utilization</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5">Breakdown</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const sprintAllocations = getEmployeeAllocationForSprint(viewingSprint);
                        if (sprintAllocations.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                                No tasks assigned to this sprint yet.
                              </TableCell>
                            </TableRow>
                          );
                        }
                        return sprintAllocations.map((emp) => {
                          const { totalHours: weekTotal, details } = getEmployeeWeeklyAllocation(emp.id, viewingSprint.startDate, viewingSprint.endDate);
                          const remaining = WEEKLY_CAPACITY - weekTotal;
                          const pct = Math.round((weekTotal / WEEKLY_CAPACITY) * 100);
                          const isOver = weekTotal > WEEKLY_CAPACITY;
                          return (
                            <TableRow key={emp.id} className={isOver ? "bg-destructive/5" : ""}>
                              <TableCell className="py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-3 w-3 text-primary" />
                                  </div>
                                  <span className="text-sm font-medium">{emp.name}</span>
                                  {isOver && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm py-2.5 text-center font-mono text-muted-foreground">{WEEKLY_CAPACITY}h</TableCell>
                              <TableCell className="text-sm py-2.5 text-center font-mono font-semibold">{emp.assigned}h</TableCell>
                              <TableCell className={`text-sm py-2.5 text-center font-mono font-semibold ${isOver ? "text-destructive" : ""}`}>
                                {weekTotal}h
                              </TableCell>
                              <TableCell className={`text-sm py-2.5 text-center font-mono font-semibold ${remaining < 0 ? "text-destructive" : ""}`}>
                                {remaining}h
                              </TableCell>
                              <TableCell className="py-2.5">
                                <div className="flex items-center gap-2">
                                  <Progress value={Math.min(pct, 100)} className={`h-1.5 flex-1 ${getProgressColor(pct)}`} />
                                  <span className={`text-[10px] font-mono font-semibold min-w-[32px] text-right ${getUtilColor(pct)}`}>
                                    {pct}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5">
                                <div className="flex flex-wrap gap-1">
                                  {details.map((d, i) => (
                                    <Badge key={i} variant="outline" className="text-[9px]">{d.sprintName} · {d.project} ({d.hours}h)</Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Tasks in this sprint */}
              <div>
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sprint Tasks</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5">Task</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5">Assignee</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5">Priority</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5 text-center">Hours</TableHead>
                        <TableHead className="text-[11px] font-semibold uppercase tracking-wider py-2.5">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingSprint.tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="text-sm py-2.5 font-medium">{task.name}</TableCell>
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-2.5 w-2.5 text-primary" />
                              </div>
                              <span className="text-sm text-muted-foreground">{task.assigneeName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5">{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell className="py-2.5 text-center">
                            <span className="text-sm font-mono font-semibold">{task.estimatedHours}h</span>
                          </TableCell>
                          <TableCell className="py-2.5">{getStatusBadge(task.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
