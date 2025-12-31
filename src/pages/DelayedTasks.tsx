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
import { Download, AlertTriangle, Clock, User, FolderKanban, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { TASK_STATUS_LABELS } from "@/types/project";

type Project = Tables<"projects">;
type Task = Tables<"tasks">;

interface DelayedTask {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  assigneeId: string;
  assigneeName: string;
  status: string;
  priority: string;
  dueDate: string;
  daysDelayed: number;
  estimatedHours: number | null;
}

const DelayedTasks = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterProject, setFilterProject] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Mock delayed tasks data
  const mockDelayedTasks: DelayedTask[] = useMemo(() => {
    const today = new Date();
    return [
      {
        id: "1",
        name: "API Integration Testing",
        projectId: "11111111-1111-1111-1111-111111111111",
        projectName: "E-Commerce Platform",
        assigneeId: "user1",
        assigneeName: "John Doe",
        status: "in-progress",
        priority: "high",
        dueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        daysDelayed: 5,
        estimatedHours: 16,
      },
      {
        id: "2",
        name: "Database Migration Scripts",
        projectId: "22222222-2222-2222-2222-222222222222",
        projectName: "Mobile Banking App",
        assigneeId: "user2",
        assigneeName: "Sarah Smith",
        status: "blocked",
        priority: "urgent",
        dueDate: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        daysDelayed: 8,
        estimatedHours: 24,
      },
      {
        id: "3",
        name: "User Authentication Flow",
        projectId: "11111111-1111-1111-1111-111111111111",
        projectName: "E-Commerce Platform",
        assigneeId: "user3",
        assigneeName: "Mike Johnson",
        status: "in-progress",
        priority: "high",
        dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        daysDelayed: 3,
        estimatedHours: 20,
      },
      {
        id: "4",
        name: "Payment Gateway Integration",
        projectId: "33333333-3333-3333-3333-333333333333",
        projectName: "CRM System",
        assigneeId: "user1",
        assigneeName: "John Doe",
        status: "in-progress",
        priority: "medium",
        dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        daysDelayed: 2,
        estimatedHours: 12,
      },
      {
        id: "5",
        name: "Performance Optimization",
        projectId: "22222222-2222-2222-2222-222222222222",
        projectName: "Mobile Banking App",
        assigneeId: "user4",
        assigneeName: "Emily Brown",
        status: "new",
        priority: "high",
        dueDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        daysDelayed: 10,
        estimatedHours: 32,
      },
      {
        id: "6",
        name: "Unit Test Coverage",
        projectId: "11111111-1111-1111-1111-111111111111",
        projectName: "E-Commerce Platform",
        assigneeId: "user5",
        assigneeName: "David Lee",
        status: "in-progress",
        priority: "medium",
        dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        daysDelayed: 1,
        estimatedHours: 8,
      },
      {
        id: "7",
        name: "Security Audit Fixes",
        projectId: "44444444-4444-4444-4444-444444444444",
        projectName: "Analytics Dashboard",
        assigneeId: "user2",
        assigneeName: "Sarah Smith",
        status: "blocked",
        priority: "urgent",
        dueDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        daysDelayed: 7,
        estimatedHours: 40,
      },
      {
        id: "8",
        name: "Documentation Update",
        projectId: "55555555-5555-5555-5555-555555555555",
        projectName: "Internal Tools",
        assigneeId: "user3",
        assigneeName: "Mike Johnson",
        status: "new",
        priority: "low",
        dueDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        daysDelayed: 4,
        estimatedHours: 6,
      },
      {
        id: "9",
        name: "Mobile Responsiveness",
        projectId: "33333333-3333-3333-3333-333333333333",
        projectName: "CRM System",
        assigneeId: "user4",
        assigneeName: "Emily Brown",
        status: "in-progress",
        priority: "high",
        dueDate: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        daysDelayed: 6,
        estimatedHours: 18,
      },
      {
        id: "10",
        name: "Email Notification System",
        projectId: "22222222-2222-2222-2222-222222222222",
        projectName: "Mobile Banking App",
        assigneeId: "user5",
        assigneeName: "David Lee",
        status: "in-progress",
        priority: "medium",
        dueDate: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        daysDelayed: 9,
        estimatedHours: 14,
      },
    ];
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const [projectsRes] = await Promise.all([
        supabase.from("projects").select("*").order("name"),
      ]);

      if (projectsRes.data) setProjects(projectsRes.data);
    };
    fetchData();
  }, []);

  // Filter delayed tasks
  const filteredTasks = useMemo(() => {
    return mockDelayedTasks.filter(task => {
      const matchesProject = filterProject === "all" || task.projectId === filterProject;
      const matchesAssignee = filterAssignee === "all" || task.assigneeId === filterAssignee;
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      return matchesProject && matchesAssignee && matchesPriority;
    }).sort((a, b) => b.daysDelayed - a.daysDelayed);
  }, [mockDelayedTasks, filterProject, filterAssignee, filterPriority]);

  // Summary stats
  const stats = useMemo(() => {
    const urgentCount = filteredTasks.filter(t => t.priority === "urgent").length;
    const highCount = filteredTasks.filter(t => t.priority === "high").length;
    const blockedCount = filteredTasks.filter(t => t.status === "blocked").length;
    const totalDelayedHours = filteredTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const avgDaysDelayed = filteredTasks.length > 0
      ? filteredTasks.reduce((sum, t) => sum + t.daysDelayed, 0) / filteredTasks.length
      : 0;

    return {
      totalDelayed: filteredTasks.length,
      urgentCount,
      highCount,
      blockedCount,
      totalDelayedHours,
      avgDaysDelayed,
    };
  }, [filteredTasks]);

  // Breakdown by assignee
  const assigneeBreakdown = useMemo(() => {
    const breakdown = new Map<string, { name: string; count: number; totalDays: number }>();
    
    filteredTasks.forEach(task => {
      const existing = breakdown.get(task.assigneeId) || { 
        name: task.assigneeName, 
        count: 0, 
        totalDays: 0 
      };
      breakdown.set(task.assigneeId, {
        name: task.assigneeName,
        count: existing.count + 1,
        totalDays: existing.totalDays + task.daysDelayed,
      });
    });
    
    return Array.from(breakdown.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTasks]);

  // Breakdown by project
  const projectBreakdown = useMemo(() => {
    const breakdown = new Map<string, { name: string; count: number; totalDays: number }>();
    
    filteredTasks.forEach(task => {
      const existing = breakdown.get(task.projectId) || { 
        name: task.projectName, 
        count: 0, 
        totalDays: 0 
      };
      breakdown.set(task.projectId, {
        name: task.projectName,
        count: existing.count + 1,
        totalDays: existing.totalDays + task.daysDelayed,
      });
    });
    
    return Array.from(breakdown.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTasks]);

  // Get unique assignees
  const uniqueAssignees = useMemo(() => {
    const assignees = new Map<string, string>();
    mockDelayedTasks.forEach(t => assignees.set(t.assigneeId, t.assigneeName));
    return Array.from(assignees.entries()).map(([id, name]) => ({ id, name }));
  }, [mockDelayedTasks]);

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      urgent: "destructive",
      high: "default",
      medium: "secondary",
      low: "outline",
    };
    return <Badge variant={variants[priority] || "outline"}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      blocked: "destructive",
      "in-progress": "default",
      new: "outline",
    };
    const labels: Record<string, string> = {
      blocked: "Blocked",
      "in-progress": "In Progress",
      new: "New",
    };
    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  const getDelayBadge = (days: number) => {
    if (days >= 7) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{days} days</Badge>;
    } else if (days >= 3) {
      return <Badge className="bg-amber-500 text-white gap-1"><Clock className="h-3 w-3" />{days} days</Badge>;
    }
    return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{days} day{days > 1 ? "s" : ""}</Badge>;
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Task", "Project", "Assignee", "Status", "Priority", "Due Date", "Days Delayed", "Est. Hours"];
    const rows = filteredTasks.map(task => [
      task.name,
      task.projectName,
      task.assigneeName,
      task.status,
      task.priority,
      task.dueDate,
      task.daysDelayed.toString(),
      (task.estimatedHours || 0).toString(),
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delayed-tasks-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Delayed tasks exported to CSV");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Delayed Tasks</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tasks past due date requiring attention
            </p>
          </div>
          <Button onClick={handleExportCSV} className="gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>


        {/* Breakdown Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* By Assignee */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Breakdown by Assignee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assigneeBreakdown.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Avg: {(item.totalDays / item.count).toFixed(1)} days delayed
                      </p>
                    </div>
                    <Badge variant="destructive">{item.count} tasks</Badge>
                  </div>
                ))}
                {assigneeBreakdown.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No delayed tasks</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* By Project */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Breakdown by Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectBreakdown.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Avg: {(item.totalDays / item.count).toFixed(1)} days delayed
                      </p>
                    </div>
                    <Badge variant="destructive">{item.count} tasks</Badge>
                  </div>
                ))}
                {projectBreakdown.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No delayed tasks</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="py-3 md:py-6">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.length > 0 ? (
                      projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="11111111-1111-1111-1111-111111111111">E-Commerce Platform</SelectItem>
                        <SelectItem value="22222222-2222-2222-2222-222222222222">Mobile Banking App</SelectItem>
                        <SelectItem value="33333333-3333-3333-3333-333333333333">CRM System</SelectItem>
                        <SelectItem value="44444444-4444-4444-4444-444444444444">Analytics Dashboard</SelectItem>
                        <SelectItem value="55555555-5555-5555-5555-555555555555">Internal Tools</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Assignees" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Assignees</SelectItem>
                    {uniqueAssignees.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delayed Tasks Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top 10 Delayed Tasks</CardTitle>
              <Badge variant="destructive">{filteredTasks.length} Delayed</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Days Delayed</TableHead>
                  <TableHead className="text-right">Est. Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.slice(0, 10).map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell className="text-muted-foreground">{task.projectName}</TableCell>
                    <TableCell>{task.assigneeName}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell className="text-muted-foreground">{task.dueDate}</TableCell>
                    <TableCell>{getDelayBadge(task.daysDelayed)}</TableCell>
                    <TableCell className="text-right">{task.estimatedHours || "-"}h</TableCell>
                  </TableRow>
                ))}
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No delayed tasks found. Great job!
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

export default DelayedTasks;
