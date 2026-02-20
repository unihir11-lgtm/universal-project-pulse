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
import { Plus, Target, Calendar, Edit, Trash2, Pencil, Clock, User, ListChecks, CheckSquare, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
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

// Mock projects data
const projectsData = [
  { id: 1, name: "Go Live" },
  { id: 2, name: "Human Resource" },
  { id: 3, name: "Jain Connection Marketing" },
  { id: 4, name: "Jain Marketplace" },
  { id: 5, name: "Product Support" },
  { id: 6, name: "Super App" },
  { id: 7, name: "Universal Software" },
];

interface Sprint {
  id: number;
  name: string;
  project: string;
  startDate: string;
  endDate: string;
  status: string;
  tasks: number;
  editedBy?: string;
  editedAt?: string;
  editedVia?: string;
}

interface QueueTask {
  id: number;
  name: string;
  project: string;
  priority: string;
  assignee: string;
  estimatedHours: number;
  status: string;
}

// Mock sprints data
const sprintsData: Sprint[] = [
  { id: 1, name: "Sprint 1", project: "Universal Software", startDate: "2024-12-01", endDate: "2024-12-15", status: "Completed", tasks: 12, editedBy: "Admin User", editedAt: "Dec 28, 10:30 AM", editedVia: "Web Portal" },
  { id: 2, name: "Sprint 2", project: "Universal Software", startDate: "2024-12-16", endDate: "2024-12-31", status: "Active", tasks: 8, editedBy: "Project Manager", editedAt: "Dec 27, 03:15 PM", editedVia: "Mobile App" },
  { id: 3, name: "Sprint 3", project: "Universal Software", startDate: "2025-01-01", endDate: "2025-01-15", status: "Planned", tasks: 5, editedBy: "System Auto", editedAt: "Dec 26, 09:00 AM", editedVia: "Scheduler" },
  { id: 4, name: "Sprint 1", project: "Super App", startDate: "2024-12-01", endDate: "2024-12-15", status: "Completed", tasks: 10, editedBy: "Team Lead", editedAt: "Dec 25, 11:45 AM", editedVia: "Web Portal" },
  { id: 5, name: "Sprint 2", project: "Super App", startDate: "2024-12-16", endDate: "2024-12-31", status: "Active", tasks: 6, editedBy: "Admin User", editedAt: "Dec 24, 02:00 PM", editedVia: "Manual Entry" },
  { id: 6, name: "Sprint 1", project: "Go Live", startDate: "2024-12-01", endDate: "2024-12-15", status: "Completed", tasks: 15 },
];

// Mock task queue data - tasks available to be picked into sprints
const taskQueueData: QueueTask[] = [
  { id: 1, name: "User Authentication Flow", project: "Universal Software", priority: "High", assignee: "Rahul Sharma", estimatedHours: 16, status: "Ready" },
  { id: 2, name: "Dashboard API Integration", project: "Universal Software", priority: "High", assignee: "Priya Patel", estimatedHours: 12, status: "Ready" },
  { id: 3, name: "Payment Gateway Setup", project: "Super App", priority: "Critical", assignee: "Amit Kumar", estimatedHours: 24, status: "Ready" },
  { id: 4, name: "Push Notification Service", project: "Super App", priority: "Medium", assignee: "Sneha Reddy", estimatedHours: 8, status: "Ready" },
  { id: 5, name: "Report Export Module", project: "Universal Software", priority: "Low", assignee: "Vikram Singh", estimatedHours: 6, status: "Ready" },
  { id: 6, name: "CI/CD Pipeline Setup", project: "Go Live", priority: "High", assignee: "Deepak Nair", estimatedHours: 10, status: "Ready" },
  { id: 7, name: "Mobile Responsive Design", project: "Super App", priority: "Medium", assignee: "Ananya Gupta", estimatedHours: 14, status: "Ready" },
  { id: 8, name: "Database Migration Script", project: "Universal Software", priority: "High", assignee: "Rahul Sharma", estimatedHours: 8, status: "Ready" },
  { id: 9, name: "Unit Test Coverage", project: "Go Live", priority: "Medium", assignee: "Priya Patel", estimatedHours: 12, status: "Ready" },
  { id: 10, name: "Error Logging System", project: "Universal Software", priority: "Low", assignee: "Amit Kumar", estimatedHours: 6, status: "Ready" },
  { id: 11, name: "User Role Management", project: "Human Resource", priority: "High", assignee: "Sneha Reddy", estimatedHours: 18, status: "Ready" },
  { id: 12, name: "Leave Approval Workflow", project: "Human Resource", priority: "Medium", assignee: "Vikram Singh", estimatedHours: 10, status: "Ready" },
];

const Sprints = () => {
  // Form state
  const [sprintName, setSprintName] = useState("");
  const [sprintProject, setSprintProject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sprintStatus, setSprintStatus] = useState("");
  
  // Filter state
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Task queue state
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [queueFilterProject, setQueueFilterProject] = useState("all");
  const [targetSprint, setTargetSprint] = useState("");

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    project: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  const handleEditSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setEditFormData({
      name: sprint.name,
      project: sprint.project,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      status: sprint.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData.name.trim()) {
      toast.error("Please enter sprint name");
      return;
    }
    toast.success(`Sprint "${editFormData.name}" updated successfully!`);
    setEditDialogOpen(false);
    setSelectedSprint(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sprintName.trim()) {
      toast.error("Please enter sprint name");
      return;
    }
    if (!sprintProject) {
      toast.error("Please select a project");
      return;
    }
    if (!startDate) {
      toast.error("Please select start date");
      return;
    }
    if (!endDate) {
      toast.error("Please select end date");
      return;
    }
    if (!sprintStatus) {
      toast.error("Please select sprint status");
      return;
    }

    toast.success(`Sprint "${sprintName}" created successfully!`);
    
    // Reset form
    setSprintName("");
    setSprintProject("");
    setStartDate("");
    setEndDate("");
    setSprintStatus("");
  };

  const filteredSprints = sprintsData.filter((sprint) => {
    const matchesProject = filterProject === "all" || sprint.project === filterProject;
    const matchesStatus = filterStatus === "all" || sprint.status === filterStatus;
    return matchesProject && matchesStatus;
  });

  const filteredQueueTasks = taskQueueData.filter((task) => {
    return queueFilterProject === "all" || task.project === queueFilterProject;
  });

  const handleTaskSelect = (taskId: number, checked: boolean) => {
    setSelectedTaskIds(prev =>
      checked ? [...prev, taskId] : prev.filter(id => id !== taskId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedTaskIds(checked ? filteredQueueTasks.map(t => t.id) : []);
  };

  const handleAddToSprint = () => {
    if (selectedTaskIds.length === 0) {
      toast.error("Please select at least one task");
      return;
    }
    if (!targetSprint) {
      toast.error("Please select a target sprint");
      return;
    }
    toast.success(`${selectedTaskIds.length} task(s) added to ${targetSprint}`);
    setSelectedTaskIds([]);
    setTargetSprint("");
  };

  const totalSelectedHours = taskQueueData
    .filter(t => selectedTaskIds.includes(t.id))
    .reduce((sum, t) => sum + t.estimatedHours, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500/20 text-green-700 text-xs">{status}</Badge>;
      case "Active":
        return <Badge className="bg-accent/20 text-accent text-xs">{status}</Badge>;
      case "Planned":
        return <Badge className="bg-muted text-muted-foreground text-xs">{status}</Badge>;
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <Badge className="bg-destructive/20 text-destructive text-xs">{priority}</Badge>;
      case "High":
        return <Badge className="bg-orange-500/20 text-orange-700 text-xs">{priority}</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-500/20 text-yellow-700 text-xs">{priority}</Badge>;
      case "Low":
        return <Badge className="bg-muted text-muted-foreground text-xs">{priority}</Badge>;
      default:
        return <Badge className="text-xs">{priority}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const activePlannedSprints = sprintsData.filter(s => s.status === "Active" || s.status === "Planned");

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Header */}
        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground">Sprint Management</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Create and manage project sprints
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
                      {projectsData.map((project) => (<SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>))}
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
              <Button type="submit" size="sm" className="gap-1.5 h-8 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Create Sprint
              </Button>
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
                {selectedTaskIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
                      <CheckSquare className="h-3 w-3 mr-1" />
                      {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? "s" : ""} selected
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {totalSelectedHours}h estimated
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Select value={queueFilterProject} onValueChange={setQueueFilterProject}>
                  <SelectTrigger className="h-8 text-xs w-40 bg-background">
                    <SelectValue placeholder="Filter by project" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectsData.map((project) => (
                      <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-2 w-10">
                      <Checkbox
                        checked={filteredQueueTasks.length > 0 && filteredQueueTasks.every(t => selectedTaskIds.includes(t.id))}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      />
                    </TableHead>
                    <TableHead className="text-xs py-2">Task Name</TableHead>
                    <TableHead className="text-xs py-2">Project</TableHead>
                    <TableHead className="text-xs py-2">Assignee</TableHead>
                    <TableHead className="text-xs py-2">Priority</TableHead>
                    <TableHead className="text-xs py-2 text-center">Est. Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueueTasks.map((task) => {
                    const isSelected = selectedTaskIds.includes(task.id);
                    return (
                      <TableRow
                        key={task.id}
                        className={isSelected ? "bg-primary/5" : ""}
                      >
                        <TableCell className="py-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleTaskSelect(task.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="text-sm py-2 font-medium">{task.name}</TableCell>
                        <TableCell className="text-sm py-2 text-muted-foreground">{task.project}</TableCell>
                        <TableCell className="text-sm py-2 text-muted-foreground">{task.assignee}</TableCell>
                        <TableCell className="text-sm py-2">{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell className="text-sm py-2 text-center">{task.estimatedHours}h</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Add to Sprint action bar */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
              <Select value={targetSprint} onValueChange={setTargetSprint}>
                <SelectTrigger className="h-8 text-xs w-52 bg-background">
                  <SelectValue placeholder="Select target sprint" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {activePlannedSprints.map((s) => (
                    <SelectItem key={s.id} value={`${s.name} - ${s.project}`}>
                      {s.name} — {s.project}
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
                    {projectsData.map((project) => (<SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>))}
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
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-2">Sprint Name</TableHead>
                    <TableHead className="text-xs py-2">Project</TableHead>
                    <TableHead className="text-xs py-2">Start Date</TableHead>
                    <TableHead className="text-xs py-2">End Date</TableHead>
                    <TableHead className="text-xs py-2 text-center">Tasks</TableHead>
                    <TableHead className="text-xs py-2">Status</TableHead>
                    <TableHead className="text-xs py-2 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSprints.map((sprint) => (
                    <TableRow key={sprint.id} className={sprint.editedBy ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}>
                      <TableCell className="text-sm py-2 font-medium">
                        <div className="flex flex-col">
                          <span>{sprint.name}</span>
                          {sprint.editedBy && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                    <Pencil className="h-2.5 w-2.5" />
                                    <span>Edited</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-background border">
                                  <div className="text-xs space-y-1">
                                    <div className="flex items-center gap-1.5"><User className="h-3 w-3" /><span>{sprint.editedBy}</span></div>
                                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /><span>{sprint.editedAt}</span></div>
                                    <div className="flex items-center gap-1.5"><span className="text-muted-foreground">Via: {sprint.editedVia}</span></div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm py-2">{sprint.project}</TableCell>
                      <TableCell className="text-sm py-2">{formatDate(sprint.startDate)}</TableCell>
                      <TableCell className="text-sm py-2">{formatDate(sprint.endDate)}</TableCell>
                      <TableCell className="text-sm py-2 text-center">{sprint.tasks}</TableCell>
                      <TableCell className="text-sm py-2">{getStatusBadge(sprint.status)}</TableCell>
                      <TableCell className="text-sm py-2">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditSprint(sprint)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => toast.info(`Delete ${sprint.name}`)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  <Label htmlFor="edit-sprint-name">Sprint Name *</Label>
                  <Input id="edit-sprint-name" value={editFormData.name} onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sprint-project">Project *</Label>
                  <Select value={editFormData.project} onValueChange={(value) => setEditFormData(prev => ({ ...prev, project: value }))}>
                    <SelectTrigger id="edit-sprint-project" className="bg-background"><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent className="bg-background">
                      {projectsData.map((project) => (<SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-date">Start Date *</Label>
                    <Input id="edit-start-date" type="date" value={editFormData.startDate} onChange={(e) => setEditFormData(prev => ({ ...prev, startDate: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-end-date">End Date *</Label>
                    <Input id="edit-end-date" type="date" value={editFormData.endDate} onChange={(e) => setEditFormData(prev => ({ ...prev, endDate: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sprint-status">Status *</Label>
                  <Select value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger id="edit-sprint-status" className="bg-background"><SelectValue placeholder="Select status" /></SelectTrigger>
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
