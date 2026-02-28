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
  Plus, Calendar, Edit, Trash2, Pencil, Clock, User, ListChecks,
  CheckSquare, ArrowRight, AlertTriangle, Users, Target, BarChart3,
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

  // Data state
  const [sprints, setSprints] = useState<Sprint[]>(initialSprintsData);
  const [taskQueue, setTaskQueue] = useState<QueueTask[]>(initialTaskQueue);

  // Filter state
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Task queue state
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [queueFilterProject, setQueueFilterProject] = useState("all");
  const [targetSprint, setTargetSprint] = useState("");

  // Sprint detail view
  const [viewingSprint, setViewingSprint] = useState<Sprint | null>(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", project: "", startDate: "", endDate: "", status: "" });

  // --- Computed ---

  // Get employee allocation for a specific sprint
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

  // Get total allocation for an employee across ALL active sprints in the same week
  const getEmployeeWeeklyAllocation = (employeeId: string, sprintStartDate: string) => {
    let totalHours = 0;
    sprints.forEach((s) => {
      if (s.startDate === sprintStartDate || (s.status === "Active" && s.startDate <= sprintStartDate && s.endDate >= sprintStartDate)) {
        s.tasks.filter((t) => t.assigneeId === employeeId).forEach((t) => {
          totalHours += t.estimatedHours;
        });
      }
    });
    return totalHours;
  };

  // Allocation warnings when selecting tasks
  const allocationWarnings = useMemo(() => {
    if (selectedTaskIds.length === 0 || !targetSprint) return [];

    const target = sprints.find((s) => `${s.name} - ${s.project}` === targetSprint);
    if (!target) return [];

    const warnings: { employeeName: string; capacity: number; alreadyAllocated: number; newHours: number; }[] = [];
    const selectedTasks = taskQueue.filter((t) => selectedTaskIds.includes(t.id));

    // Group selected tasks by assignee
    const byAssignee = new Map<string, { name: string; hours: number }>();
    selectedTasks.forEach((t) => {
      const ex = byAssignee.get(t.assigneeId) || { name: t.assigneeName, hours: 0 };
      ex.hours += t.estimatedHours;
      byAssignee.set(t.assigneeId, ex);
    });

    byAssignee.forEach((data, empId) => {
      const alreadyAllocated = getEmployeeWeeklyAllocation(empId, target.startDate);
      if (alreadyAllocated + data.hours > WEEKLY_CAPACITY) {
        warnings.push({
          employeeName: data.name,
          capacity: WEEKLY_CAPACITY,
          alreadyAllocated,
          newHours: data.hours,
        });
      }
    });

    return warnings;
  }, [selectedTaskIds, targetSprint, sprints, taskQueue]);

  const filteredSprints = sprints.filter((sprint) => {
    const matchesProject = filterProject === "all" || sprint.project === filterProject;
    const matchesStatus = filterStatus === "all" || sprint.status === filterStatus;
    return matchesProject && matchesStatus;
  });

  const filteredQueueTasks = taskQueue.filter((task) => {
    return queueFilterProject === "all" || task.project === queueFilterProject;
  });

  const totalSelectedHours = taskQueue
    .filter((t) => selectedTaskIds.includes(t.id))
    .reduce((sum, t) => sum + t.estimatedHours, 0);

  const activePlannedSprints = sprints.filter((s) => s.status === "Active" || s.status === "Planned");

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
  };

  const handleTaskSelect = (taskId: number, checked: boolean) => {
    setSelectedTaskIds((prev) => (checked ? [...prev, taskId] : prev.filter((id) => id !== taskId)));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedTaskIds(checked ? filteredQueueTasks.map((t) => t.id) : []);
  };

  const handleAddToSprint = () => {
    if (selectedTaskIds.length === 0) { toast.error("Please select at least one task"); return; }
    if (!targetSprint) { toast.error("Please select a target sprint"); return; }

    // Warn but allow
    if (allocationWarnings.length > 0) {
      const warnNames = allocationWarnings.map((w) => w.employeeName).join(", ");
      toast.warning(`Over-allocation warning for: ${warnNames}. Tasks added anyway.`);
    }

    const target = sprints.find((s) => `${s.name} - ${s.project}` === targetSprint);
    if (!target) return;

    const selectedTasks = taskQueue.filter((t) => selectedTaskIds.includes(t.id));
    const newSprintTasks: SprintTask[] = selectedTasks.map((t) => ({
      id: t.id,
      name: t.name,
      project: t.project,
      assigneeId: t.assigneeId,
      assigneeName: t.assigneeName,
      estimatedHours: t.estimatedHours,
      status: "Open",
      priority: t.priority,
    }));

    setSprints((prev) =>
      prev.map((s) =>
        s.id === target.id ? { ...s, tasks: [...s.tasks, ...newSprintTasks] } : s
      )
    );
    setTaskQueue((prev) => prev.filter((t) => !selectedTaskIds.includes(t.id)));
    toast.success(`${selectedTaskIds.length} task(s) added to ${target.name}`);
    setSelectedTaskIds([]);
    setTargetSprint("");
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
    // Move tasks back to queue
    const tasksToReturn: QueueTask[] = sprint.tasks.map((t) => ({
      id: t.id,
      name: t.name,
      project: t.project,
      priority: t.priority,
      assigneeId: t.assigneeId,
      assigneeName: t.assigneeName,
      estimatedHours: t.estimatedHours,
      description: "",
      status: "Ready",
    }));
    setTaskQueue((prev) => [...prev, ...tasksToReturn]);
    setSprints((prev) => prev.filter((s) => s.id !== sprint.id));
    toast.success(`Sprint "${sprint.name}" deleted. Tasks returned to queue.`);
  };

  // --- Badge helpers ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return <Badge className="bg-green-500/20 text-green-700 text-xs">{status}</Badge>;
      case "Active": return <Badge className="bg-accent/20 text-accent text-xs">{status}</Badge>;
      case "Planned": return <Badge className="bg-muted text-muted-foreground text-xs">{status}</Badge>;
      default: return <Badge className="text-xs">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical": return <Badge className="bg-destructive/20 text-destructive text-xs">{priority}</Badge>;
      case "High": return <Badge className="bg-orange-500/20 text-orange-700 text-xs">{priority}</Badge>;
      case "Medium": return <Badge className="bg-yellow-500/20 text-yellow-700 text-xs">{priority}</Badge>;
      case "Low": return <Badge className="bg-muted text-muted-foreground text-xs">{priority}</Badge>;
      default: return <Badge className="text-xs">{priority}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getUtilColor = (pct: number) => {
    if (pct > 100) return "text-destructive";
    if (pct >= 80) return "text-orange-600";
    if (pct >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = (pct: number) => {
    if (pct > 100) return "[&>div]:bg-destructive";
    if (pct >= 80) return "[&>div]:bg-orange-500";
    return "[&>div]:bg-primary";
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Sprint Management</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Plan weekly sprints, assign tasks, and monitor employee capacity ({WEEKLY_CAPACITY}h/week)
          </p>
        </div>

        {/* Create Sprint Form */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Plus className="h-4 w-4" />
              Create New Sprint
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="sprint-name" className="text-xs">Sprint Name *</Label>
                  <Input id="sprint-name" placeholder="e.g., Sprint 1" value={sprintName} onChange={(e) => setSprintName(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sprint-project" className="text-xs">Project *</Label>
                  <Select value={sprintProject} onValueChange={setSprintProject}>
                    <SelectTrigger id="sprint-project" className="h-8 text-xs bg-background"><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent className="bg-background">
                      {projectsData.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="start-date" className="text-xs">Start Date *</Label>
                  <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="end-date" className="text-xs">End Date *</Label>
                  <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sprint-status" className="text-xs">Status *</Label>
                  <Select value={sprintStatus} onValueChange={setSprintStatus}>
                    <SelectTrigger id="sprint-status" className="h-8 text-xs bg-background"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" size="sm" className="gap-1.5 h-8 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Create Sprint
                </Button>
                <span className="text-[10px] text-muted-foreground">Default duration: 1 week</span>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Task Queue */}
        <Card className="border-2 border-dashed border-primary/30">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <ListChecks className="h-4 w-4 text-primary" />
                  Task Queue
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {taskQueue.length} task{taskQueue.length !== 1 ? "s" : ""} available
                </Badge>
                {selectedTaskIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
                      <CheckSquare className="h-3 w-3 mr-1" />
                      {selectedTaskIds.length} selected
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {totalSelectedHours}h total
                    </Badge>
                  </div>
                )}
              </div>
              <Select value={queueFilterProject} onValueChange={setQueueFilterProject}>
                <SelectTrigger className="h-8 text-xs w-40 bg-background">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Projects</SelectItem>
                  {projectsData.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="overflow-x-auto">
              <Table className="min-w-[750px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-2 w-10">
                      <Checkbox
                        checked={filteredQueueTasks.length > 0 && filteredQueueTasks.every((t) => selectedTaskIds.includes(t.id))}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      />
                    </TableHead>
                    <TableHead className="text-xs py-2">Task Name</TableHead>
                    <TableHead className="text-xs py-2">Project</TableHead>
                    <TableHead className="text-xs py-2">Assigned To</TableHead>
                    <TableHead className="text-xs py-2">Priority</TableHead>
                    <TableHead className="text-xs py-2 text-center">Est. Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueueTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                        No tasks in queue. All tasks have been assigned to sprints.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQueueTasks.map((task) => {
                      const isSelected = selectedTaskIds.includes(task.id);
                      return (
                        <TableRow key={task.id} className={isSelected ? "bg-primary/5" : ""}>
                          <TableCell className="py-2">
                            <Checkbox checked={isSelected} onCheckedChange={(checked) => handleTaskSelect(task.id, !!checked)} />
                          </TableCell>
                          <TableCell className="text-sm py-2 font-medium">
                            <div>
                              <span>{task.name}</span>
                              <p className="text-[10px] text-muted-foreground">{task.description}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm py-2 text-muted-foreground">{task.project}</TableCell>
                          <TableCell className="text-sm py-2">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {task.assigneeName}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm py-2">{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell className="text-sm py-2 text-center font-mono">{task.estimatedHours}h</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Allocation Warnings */}
            {allocationWarnings.length > 0 && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm font-semibold">Over-Allocation Warning</AlertTitle>
                <AlertDescription className="text-xs space-y-1 mt-1">
                  {allocationWarnings.map((w, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                      <span className="font-medium">{w.employeeName}</span>
                      <span>
                        Capacity: {w.capacity}h · Already Allocated: {w.alreadyAllocated}h · New: {w.newHours}h ·{" "}
                        <span className="text-destructive font-semibold">
                          Exceeds by {w.alreadyAllocated + w.newHours - w.capacity}h
                        </span>
                      </span>
                    </div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* Add to Sprint action bar */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
              <Select value={targetSprint} onValueChange={setTargetSprint}>
                <SelectTrigger className="h-8 text-xs w-52 bg-background">
                  <SelectValue placeholder="Select target sprint" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {activePlannedSprints.map((s) => (
                    <SelectItem key={s.id} value={`${s.name} - ${s.project}`}>
                      {s.name} — {s.project} ({s.tasks.length} tasks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleAddToSprint} disabled={selectedTaskIds.length === 0}>
                <ArrowRight className="h-3.5 w-3.5" />
                Add {selectedTaskIds.length > 0 ? `${selectedTaskIds.length} Task${selectedTaskIds.length !== 1 ? "s" : ""}` : "Tasks"} to Sprint
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sprint List */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-4 w-4" />
                Sprint List
              </CardTitle>
              <div className="flex gap-2">
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger className="h-8 text-xs w-40 bg-background"><SelectValue placeholder="Filter by project" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectsData.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 text-xs w-32 bg-background"><SelectValue placeholder="Filter by status" /></SelectTrigger>
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
              <Table className="min-w-[850px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-2">Sprint Name</TableHead>
                    <TableHead className="text-xs py-2">Project</TableHead>
                    <TableHead className="text-xs py-2">Start Date</TableHead>
                    <TableHead className="text-xs py-2">End Date</TableHead>
                    <TableHead className="text-xs py-2 text-center">Tasks</TableHead>
                    <TableHead className="text-xs py-2 text-center">Total Hours</TableHead>
                    <TableHead className="text-xs py-2">Status</TableHead>
                    <TableHead className="text-xs py-2 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSprints.map((sprint) => {
                    const totalHours = sprint.tasks.reduce((s, t) => s + t.estimatedHours, 0);
                    return (
                      <TableRow key={sprint.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setViewingSprint(sprint)}>
                        <TableCell className="text-sm py-2 font-medium">{sprint.name}</TableCell>
                        <TableCell className="text-sm py-2">{sprint.project}</TableCell>
                        <TableCell className="text-sm py-2">{formatDate(sprint.startDate)}</TableCell>
                        <TableCell className="text-sm py-2">{formatDate(sprint.endDate)}</TableCell>
                        <TableCell className="text-sm py-2 text-center">
                          <Badge variant="outline" className="text-xs">{sprint.tasks.length}</Badge>
                        </TableCell>
                        <TableCell className="text-sm py-2 text-center font-mono">{totalHours}h</TableCell>
                        <TableCell className="text-sm py-2">{getStatusBadge(sprint.status)}</TableCell>
                        <TableCell className="text-sm py-2">
                          <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditSprint(sprint)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteSprint(sprint)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Sprint Dashboard — Employee Capacity View */}
        {viewingSprint && (
          <Card className="border-primary/20">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Sprint Dashboard — {viewingSprint.name} ({viewingSprint.project})
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setViewingSprint(null)}>
                  Close
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(viewingSprint.startDate)} – {formatDate(viewingSprint.endDate)} · {viewingSprint.tasks.length} tasks · {viewingSprint.duration}
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Employee Capacity Summary Table */}
              <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs py-2">Employee</TableHead>
                      <TableHead className="text-xs py-2 text-center">Capacity (h)</TableHead>
                      <TableHead className="text-xs py-2 text-center">Assigned (h)</TableHead>
                      <TableHead className="text-xs py-2 text-center">Remaining (h)</TableHead>
                      <TableHead className="text-xs py-2 w-48">Utilization</TableHead>
                      <TableHead className="text-xs py-2">Assigned Tasks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const allocations = getEmployeeAllocationForSprint(viewingSprint);
                      if (allocations.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                              No tasks assigned to this sprint yet.
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return allocations.map((emp) => {
                        const pct = Math.round((emp.assigned / emp.capacity) * 100);
                        return (
                          <TableRow key={emp.id} className={emp.isOverAllocated ? "bg-destructive/5" : ""}>
                            <TableCell className="text-sm py-2 font-medium">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                {emp.name}
                                {emp.isOverAllocated && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-background border text-xs">
                                        Over-allocated by {emp.assigned - emp.capacity}h
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm py-2 text-center font-mono">{emp.capacity}</TableCell>
                            <TableCell className={`text-sm py-2 text-center font-mono font-semibold ${emp.isOverAllocated ? "text-destructive" : ""}`}>
                              {emp.assigned}
                            </TableCell>
                            <TableCell className={`text-sm py-2 text-center font-mono ${emp.remaining < 0 ? "text-destructive font-semibold" : ""}`}>
                              {emp.remaining}
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <Progress value={Math.min(pct, 100)} className={`h-2 flex-1 ${getProgressColor(pct)}`} />
                                <span className={`text-xs font-mono font-semibold min-w-[36px] text-right ${getUtilColor(pct)}`}>
                                  {pct}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex flex-wrap gap-1">
                                {emp.tasks.map((t, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[10px]">{t}</Badge>
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

              {/* Tasks in this sprint */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Tasks in this Sprint</h3>
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs py-2">Task</TableHead>
                        <TableHead className="text-xs py-2">Assigned To</TableHead>
                        <TableHead className="text-xs py-2">Priority</TableHead>
                        <TableHead className="text-xs py-2 text-center">Hours</TableHead>
                        <TableHead className="text-xs py-2">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingSprint.tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="text-sm py-2 font-medium">{task.name}</TableCell>
                          <TableCell className="text-sm py-2 text-muted-foreground">{task.assigneeName}</TableCell>
                          <TableCell className="text-sm py-2">{getPriorityBadge(task.priority)}</TableCell>
                          <TableCell className="text-sm py-2 text-center font-mono">{task.estimatedHours}h</TableCell>
                          <TableCell className="text-sm py-2">{getStatusBadge(task.status)}</TableCell>
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
                  <Label htmlFor="edit-sprint-name">Sprint Name *</Label>
                  <Input id="edit-sprint-name" value={editFormData.name} onChange={(e) => setEditFormData((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sprint-project">Project *</Label>
                  <Select value={editFormData.project} onValueChange={(v) => setEditFormData((p) => ({ ...p, project: v }))}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent className="bg-background">
                      {projectsData.map((p) => (<SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-date">Start Date *</Label>
                    <Input id="edit-start-date" type="date" value={editFormData.startDate} onChange={(e) => setEditFormData((p) => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-end-date">End Date *</Label>
                    <Input id="edit-end-date" type="date" value={editFormData.endDate} onChange={(e) => setEditFormData((p) => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sprint-status">Status *</Label>
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
