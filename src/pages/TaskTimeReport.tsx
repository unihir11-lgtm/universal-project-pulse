import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Download, Clock, Target, TrendingUp, TrendingDown, ChevronRight, ChevronDown, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;
type Task = Tables<"tasks">;
type TimeEntry = Tables<"time_entries">;

interface TaskWithTime extends Task {
  actual_hours: number;
  variance: number;
  variance_percent: number;
  children: TaskWithTime[];
  isExpanded?: boolean;
}

const TaskTimeReport = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Mock time entries for demo (task_id -> hours)
  const mockTaskHours: Record<string, number> = {
    'aaaa1111-1111-1111-1111-111111111111': 28, // Payment Integration - over budget
    'aaaa1112-1111-1111-1111-111111111111': 18, // Stripe Setup - over budget  
    'aaaa1113-1111-1111-1111-111111111111': 16, // Shopping Cart - under budget
    'aaaa1114-1111-1111-1111-111111111111': 30, // Product Catalog - under budget
    'bbbb2222-2222-2222-2222-222222222222': 45, // User Authentication - over budget
    'bbbb2223-2222-2222-2222-222222222222': 10, // Biometric Login - under budget
    'bbbb2224-2222-2222-2222-222222222222': 22, // Transaction History - under budget
    'cccc3333-3333-3333-3333-333333333333': 42, // Contact Management - over budget
    'cccc3334-3333-3333-3333-333333333333': 12, // Lead Scoring - under budget
    'dddd5555-5555-5555-5555-555555555555': 18, // Build Pipeline - over budget
    'dddd5556-5555-5555-5555-555555555555': 8,  // Documentation - under budget
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const [projectsRes, tasksRes, timeEntriesRes] = await Promise.all([
        supabase.from("projects").select("*").order("name"),
        supabase.from("tasks").select("*").order("name"),
        supabase.from("time_entries").select("*"),
      ]);

      if (projectsRes.data) setProjects(projectsRes.data);
      if (tasksRes.data) {
        // Add estimated hours to tasks if not present
        const tasksWithEstimates = tasksRes.data.map(task => ({
          ...task,
          estimated_hours: task.estimated_hours || getDefaultEstimate(task.id),
        }));
        setTasks(tasksWithEstimates);
      }
      if (timeEntriesRes.data) setTimeEntries(timeEntriesRes.data);
    };
    fetchData();
  }, []);

  // Default estimates for demo
  const getDefaultEstimate = (taskId: string): number => {
    const estimates: Record<string, number> = {
      'aaaa1111-1111-1111-1111-111111111111': 24,
      'aaaa1112-1111-1111-1111-111111111111': 16,
      'aaaa1113-1111-1111-1111-111111111111': 20,
      'aaaa1114-1111-1111-1111-111111111111': 32,
      'bbbb2222-2222-2222-2222-222222222222': 40,
      'bbbb2223-2222-2222-2222-222222222222': 12,
      'bbbb2224-2222-2222-2222-222222222222': 28,
      'cccc3333-3333-3333-3333-333333333333': 36,
      'cccc3334-3333-3333-3333-333333333333': 18,
      'dddd5555-5555-5555-5555-555555555555': 16,
      'dddd5556-5555-5555-5555-555555555555': 10,
    };
    return estimates[taskId] || 0;
  };

  // Calculate actual hours per task from time entries or use mock data
  const taskActualHours = useMemo(() => {
    const hoursMap = new Map<string, number>();
    
    // First try real time entries
    timeEntries.forEach(entry => {
      if (entry.task_id) {
        const current = hoursMap.get(entry.task_id) || 0;
        hoursMap.set(entry.task_id, current + Number(entry.logged_hours));
      }
    });
    
    // If no real data, use mock data
    if (hoursMap.size === 0) {
      Object.entries(mockTaskHours).forEach(([taskId, hours]) => {
        hoursMap.set(taskId, hours);
      });
    }
    
    return hoursMap;
  }, [timeEntries]);

  // Build hierarchical task structure with rollup calculations
  const buildTaskHierarchy = (
    taskList: Task[],
    parentId: string | null = null
  ): TaskWithTime[] => {
    return taskList
      .filter(task => task.parent_task_id === parentId)
      .map(task => {
        const children = buildTaskHierarchy(taskList, task.id);
        
        // Calculate own hours
        const ownHours = taskActualHours.get(task.id) || 0;
        
        // Rollup: sum of own hours + all children's actual hours
        const childrenHours = children.reduce((sum, child) => sum + child.actual_hours, 0);
        const actual_hours = ownHours + childrenHours;
        
        // Rollup estimated hours for parent tasks
        const ownEstimated = task.estimated_hours || 0;
        const childrenEstimated = children.reduce(
          (sum, child) => sum + (child.estimated_hours || 0),
          0
        );
        const totalEstimated = ownEstimated + childrenEstimated;
        
        // Calculate variance (negative = over budget, positive = under budget)
        const variance = totalEstimated - actual_hours;
        const variance_percent = totalEstimated > 0 
          ? ((variance / totalEstimated) * 100) 
          : 0;

        return {
          ...task,
          estimated_hours: totalEstimated,
          actual_hours,
          variance,
          variance_percent,
          children,
        };
      });
  };

  // Filter and build task hierarchy
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (filterProject !== "all") {
      filtered = filtered.filter(t => t.project_id === filterProject);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    return buildTaskHierarchy(filtered);
  }, [tasks, filterProject, filterStatus, taskActualHours]);

  // Calculate summary totals
  const summaryTotals = useMemo(() => {
    const flattenTasks = (tasks: TaskWithTime[]): TaskWithTime[] => {
      return tasks.reduce((acc, task) => {
        // Only count leaf tasks to avoid double-counting
        if (task.children.length === 0) {
          acc.push(task);
        }
        acc.push(...flattenTasks(task.children));
        return acc;
      }, [] as TaskWithTime[]);
    };

    const allLeafTasks = flattenTasks(filteredTasks).filter(t => t.children.length === 0);
    
    const totalEstimated = allLeafTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
    const totalActual = allLeafTasks.reduce((sum, t) => sum + t.actual_hours, 0);
    const totalVariance = totalEstimated - totalActual;
    const variancePercent = totalEstimated > 0 ? ((totalVariance / totalEstimated) * 100) : 0;
    
    const overBudgetTasks = allLeafTasks.filter(t => t.variance < 0).length;
    const underBudgetTasks = allLeafTasks.filter(t => t.variance > 0 && t.actual_hours > 0).length;
    const onTrackTasks = allLeafTasks.filter(t => t.variance === 0 && t.actual_hours > 0).length;
    const noTimeTasks = allLeafTasks.filter(t => t.actual_hours === 0).length;

    return {
      totalEstimated,
      totalActual,
      totalVariance,
      variancePercent,
      overBudgetTasks,
      underBudgetTasks,
      onTrackTasks,
      noTimeTasks,
      totalTasks: allLeafTasks.length,
    };
  }, [filteredTasks]);

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allParentIds = tasks
      .filter(t => tasks.some(child => child.parent_task_id === t.id))
      .map(t => t.id);
    setExpandedTasks(new Set(allParentIds));
  };

  const collapseAll = () => {
    setExpandedTasks(new Set());
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || "Unknown Project";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      new: "outline",
      "in-progress": "default",
      completed: "secondary",
      blocked: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getVarianceBadge = (variance: number, variancePercent: number, actualHours: number) => {
    if (actualHours === 0) {
      return <Badge variant="outline" className="text-muted-foreground">No time logged</Badge>;
    }
    if (variance < 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <TrendingDown className="h-3 w-3" />
          {Math.abs(variancePercent).toFixed(0)}% over
        </Badge>
      );
    }
    if (variance > 0) {
      return (
        <Badge className="bg-success text-success-foreground gap-1">
          <TrendingUp className="h-3 w-3" />
          {variancePercent.toFixed(0)}% under
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        On track
      </Badge>
    );
  };

  // Export to CSV
  const handleExportCSV = () => {
    const flattenForExport = (tasks: TaskWithTime[], level = 0): string[][] => {
      return tasks.flatMap(task => {
        const indent = "  ".repeat(level);
        const row = [
          indent + task.name,
          getProjectName(task.project_id),
          task.status,
          (task.estimated_hours || 0).toString(),
          task.actual_hours.toFixed(1),
          task.variance.toFixed(1),
          task.variance_percent.toFixed(1) + "%",
        ];
        return [row, ...flattenForExport(task.children, level + 1)];
      });
    };

    const headers = ["Task", "Project", "Status", "Estimated Hours", "Actual Hours", "Variance", "Variance %"];
    const rows = flattenForExport(filteredTasks);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `task-time-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Task time report exported to CSV");
  };

  // Render task row with hierarchy
  const renderTaskRow = (task: TaskWithTime, level = 0) => {
    const hasChildren = task.children.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const indent = level * 24;

    return (
      <>
        <TableRow key={task.id} className={level > 0 ? "bg-muted/30" : ""}>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleExpand(task.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6" />
              )}
              <div>
                <p className="font-medium">{task.name}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground">
            {getProjectName(task.project_id)}
          </TableCell>
          <TableCell>{getStatusBadge(task.status)}</TableCell>
          <TableCell className="text-right">
            {task.estimated_hours ? `${task.estimated_hours}h` : "-"}
          </TableCell>
          <TableCell className="text-right font-medium">
            {task.actual_hours > 0 ? `${task.actual_hours.toFixed(1)}h` : "-"}
          </TableCell>
          <TableCell className="text-right">
            {task.actual_hours > 0 ? (
              <span className={task.variance < 0 ? "text-destructive" : task.variance > 0 ? "text-success" : ""}>
                {task.variance >= 0 ? "+" : ""}{task.variance.toFixed(1)}h
              </span>
            ) : "-"}
          </TableCell>
          <TableCell>
            {getVarianceBadge(task.variance, task.variance_percent, task.actual_hours)}
          </TableCell>
        </TableRow>
        {isExpanded && task.children.map(child => renderTaskRow(child, level + 1))}
      </>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Task Time Report</h1>
            <p className="text-muted-foreground mt-1">
              Actual time spent per task with variance analysis
            </p>
          </div>
          <Button onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Estimated Hours</p>
              </div>
              <p className="text-3xl font-bold text-foreground mt-2">
                {summaryTotals.totalEstimated.toFixed(0)}h
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Actual Hours</p>
              </div>
              <p className="text-3xl font-bold text-foreground mt-2">
                {summaryTotals.totalActual.toFixed(1)}h
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {summaryTotals.totalVariance < 0 ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-success" />
                )}
                <p className="text-sm text-muted-foreground">Variance</p>
              </div>
              <p className={`text-3xl font-bold mt-2 ${summaryTotals.totalVariance < 0 ? "text-destructive" : "text-success"}`}>
                {summaryTotals.totalVariance >= 0 ? "+" : ""}{summaryTotals.totalVariance.toFixed(1)}h
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.abs(summaryTotals.variancePercent).toFixed(1)}% {summaryTotals.totalVariance < 0 ? "over budget" : "under budget"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-muted-foreground">Over Budget</p>
              </div>
              <p className="text-3xl font-bold text-destructive mt-2">
                {summaryTotals.overBudgetTasks}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                tasks exceeding estimate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No Time Logged</p>
              </div>
              <p className="text-3xl font-bold text-muted-foreground mt-2">
                {summaryTotals.noTimeTasks}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                tasks pending work
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={expandAll} className="flex-1">
                  Expand All
                </Button>
                <Button variant="outline" onClick={collapseAll} className="flex-1">
                  Collapse
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Task Time Breakdown</CardTitle>
              <Badge variant="secondary">{summaryTotals.totalTasks} Tasks</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[300px]">Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Estimated</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => renderTaskRow(task))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No tasks found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TaskTimeReport;
