import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Clock, Filter, AlertCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ACTIVITY_TYPE_LABELS, ActivityType } from "@/types/project";

type Project = Tables<"projects">;
type Task = Tables<"tasks">;
type TimeEntry = Tables<"time_entries">;

const SpentHours = () => {
  // Form state
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [activityType, setActivityType] = useState<ActivityType | "">("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [isBillable, setIsBillable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [filterProject, setFilterProject] = useState("all");
  const [filterTask, setFilterTask] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  const maxHoursPerDay = 9;

  // Fetch projects (only non-archived)
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .neq("status", "Archived")
        .order("name");
      
      if (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      } else {
        setProjects(data || []);
      }
    };
    fetchProjects();
  }, []);

  // Fetch tasks when project changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProject) {
        setTasks([]);
        return;
      }
      
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", selectedProject)
        .order("name");
      
      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        setTasks(data || []);
      }
    };
    fetchTasks();
  }, [selectedProject]);

  // Fetch time entries
  useEffect(() => {
    const fetchTimeEntries = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("time_entries")
        .select("*")
        .eq("is_corrected", false)
        .order("entry_date", { ascending: false })
        .limit(100);
      
      if (error) {
        console.error("Error fetching time entries:", error);
        toast.error("Failed to load time entries");
      } else {
        setTimeEntries(data || []);
      }
      setIsLoading(false);
    };
    fetchTimeEntries();
  }, []);

  // Group tasks by parent for hierarchical display
  const groupedTasks = useMemo(() => {
    const rootTasks = tasks.filter(t => !t.parent_task_id);
    const taskMap = new Map<string, Task[]>();
    
    tasks.forEach(task => {
      if (task.parent_task_id) {
        const children = taskMap.get(task.parent_task_id) || [];
        children.push(task);
        taskMap.set(task.parent_task_id, children);
      }
    });
    
    return { rootTasks, taskMap };
  }, [tasks]);

  // Build hierarchical task options
  const taskOptions = useMemo(() => {
    const options: { id: string; name: string; depth: number }[] = [];
    
    const addTaskAndChildren = (task: Task, depth: number) => {
      options.push({ id: task.id, name: task.name, depth });
      const children = groupedTasks.taskMap.get(task.id) || [];
      children.forEach(child => addTaskAndChildren(child, depth + 1));
    };
    
    groupedTasks.rootTasks.forEach(task => addTaskAndChildren(task, 0));
    return options;
  }, [groupedTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Number(hours) > maxHoursPerDay) {
      toast.error(`Cannot log more than ${maxHoursPerDay} hours per day`);
      return;
    }

    if (!selectedProject || !activityType || !description || !hours || !entryDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if project is archived
    const project = projects.find(p => p.id === selectedProject);
    if (project?.status === "Archived") {
      toast.error("Cannot log time on archived projects");
      return;
    }

    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to log time");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("time_entries").insert({
      user_id: user.id,
      created_by: user.id,
      project_id: selectedProject,
      task_id: selectedTask || null,
      activity_type: activityType,
      entry_date: entryDate,
      logged_hours: parseFloat(hours),
      billable_hours: isBillable ? parseFloat(hours) : 0,
      is_billable: isBillable,
      description: description,
    });

    if (error) {
      console.error("Error creating time entry:", error);
      toast.error("Failed to submit time entry");
    } else {
      toast.success("Time entry submitted successfully");
      // Reset form
      setSelectedTask("");
      setDescription("");
      setHours("");
      setActivityType("");
      // Refresh entries
      const { data } = await supabase
        .from("time_entries")
        .select("*")
        .eq("is_corrected", false)
        .order("entry_date", { ascending: false })
        .limit(100);
      setTimeEntries(data || []);
    }
    setIsSubmitting(false);
  };

  const getActivityBadge = (type: string) => {
    const labels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      dev: { label: "Development", variant: "default" },
      design: { label: "Design", variant: "secondary" },
      admin: { label: "Admin", variant: "outline" },
      meeting: { label: "Meeting", variant: "outline" },
    };
    const config = labels[type] || { label: type, variant: "default" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  // Filter entries
  const filteredEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      const matchesProject = filterProject === "all" || entry.project_id === filterProject;
      const matchesTask = filterTask === "all" || entry.task_id === filterTask;
      const matchesStartDate = !filterStartDate || entry.entry_date >= filterStartDate;
      const matchesEndDate = !filterEndDate || entry.entry_date <= filterEndDate;
      return matchesProject && matchesTask && matchesStartDate && matchesEndDate;
    });
  }, [timeEntries, filterProject, filterTask, filterStartDate, filterEndDate]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(filteredEntries.map(entry => entry.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const handleSelectLog = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLogs([...selectedLogs, id]);
    } else {
      setSelectedLogs(selectedLogs.filter(logId => logId !== id));
    }
  };

  const handleExport = () => {
    if (selectedLogs.length > 0) {
      toast.success(`Exporting ${selectedLogs.length} selected entry(s)...`);
    } else {
      toast.success("Exporting all time entries...");
    }
  };

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || "Unknown";
  };

  // Get task name by ID
  const getTaskName = (taskId: string | null) => {
    if (!taskId) return "-";
    return tasks.find(t => t.id === taskId)?.name || "Unknown";
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Spent Hours</h1>
            <p className="text-sm text-muted-foreground">
              Log and track time spent on projects and tasks
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Log Work Hours Form */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              Log Work Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-5">
                <div className="space-y-1">
                  <Label htmlFor="entryDate" className="text-xs">Date *</Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="h-9"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="project" className="text-xs">Project *</Label>
                  <Select value={selectedProject} onValueChange={(val) => {
                    setSelectedProject(val);
                    setSelectedTask("");
                  }}>
                    <SelectTrigger id="project" className="h-9">
                      <SelectValue placeholder="Choose project" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <span className="flex items-center gap-2">
                            {project.name}
                            {project.status === "On Hold" && (
                              <AlertCircle className="h-3 w-3 text-warning" />
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="task" className="text-xs">Task/Subtask</Label>
                  <Select 
                    value={selectedTask} 
                    onValueChange={setSelectedTask}
                    disabled={!selectedProject}
                  >
                    <SelectTrigger id="task" className="h-9">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="">No specific task</SelectItem>
                      {taskOptions.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          <span style={{ paddingLeft: `${task.depth * 12}px` }}>
                            {task.depth > 0 ? "└ " : ""}{task.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="activityType" className="text-xs">Activity Type *</Label>
                  <Select value={activityType} onValueChange={(val) => setActivityType(val as ActivityType)}>
                    <SelectTrigger id="activityType" className="h-9">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {(Object.keys(ACTIVITY_TYPE_LABELS) as ActivityType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {ACTIVITY_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hours" className="text-xs">Hours * (max {maxHoursPerDay})</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="0.5"
                    max={maxHoursPerDay}
                    step="0.5"
                    placeholder="e.g., 4.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="h-9"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="description" className="text-xs">Description *</Label>
                  <Input
                    id="description"
                    placeholder="What did you work on?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-9"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isBillable"
                    checked={isBillable}
                    onCheckedChange={(checked) => setIsBillable(checked as boolean)}
                  />
                  <Label htmlFor="isBillable" className="text-xs">Billable</Label>
                </div>
                <Button type="submit" size="sm" className="bg-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4 text-primary" />
              Filter Time Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Project</Label>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Task</Label>
                <Select value={filterTask} onValueChange={setFilterTask}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Tasks" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Tasks</SelectItem>
                    {tasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Entry Table */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Time Entry History</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {filteredEntries.length} Records
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No time entries found. Start logging your work above!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedLogs.length === filteredEntries.length && filteredEntries.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-sm">Date</TableHead>
                    <TableHead className="text-sm">Project</TableHead>
                    <TableHead className="text-sm">Task</TableHead>
                    <TableHead className="text-sm">Activity</TableHead>
                    <TableHead className="text-sm">Description</TableHead>
                    <TableHead className="text-sm">Status</TableHead>
                    <TableHead className="text-sm text-right">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="py-2">
                        <Checkbox
                          checked={selectedLogs.includes(entry.id)}
                          onCheckedChange={(checked) => handleSelectLog(entry.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="py-2 text-sm">{formatDate(entry.entry_date)}</TableCell>
                      <TableCell className="py-2 text-sm font-medium">{getProjectName(entry.project_id)}</TableCell>
                      <TableCell className="py-2 text-sm">{getTaskName(entry.task_id)}</TableCell>
                      <TableCell className="py-2">{getActivityBadge(entry.activity_type)}</TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground max-w-[200px] truncate">
                        {entry.description}
                      </TableCell>
                      <TableCell className="py-2">{getStatusBadge(entry.status)}</TableCell>
                      <TableCell className="py-2 text-sm text-right font-medium">
                        {entry.logged_hours}h
                        {entry.is_billable && entry.billable_hours !== entry.logged_hours && (
                          <span className="text-muted-foreground ml-1">
                            ({entry.billable_hours}b)
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SpentHours;