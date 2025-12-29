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
import { Plus, Target, Calendar, Edit, Trash2, Pencil, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

// Mock sprints data
const sprintsData: Sprint[] = [
  { id: 1, name: "Sprint 1", project: "Universal Software", startDate: "2024-12-01", endDate: "2024-12-15", status: "Completed", tasks: 12, editedBy: "Admin User", editedAt: "Dec 28, 10:30 AM", editedVia: "Web Portal" },
  { id: 2, name: "Sprint 2", project: "Universal Software", startDate: "2024-12-16", endDate: "2024-12-31", status: "Active", tasks: 8, editedBy: "Project Manager", editedAt: "Dec 27, 03:15 PM", editedVia: "Mobile App" },
  { id: 3, name: "Sprint 3", project: "Universal Software", startDate: "2025-01-01", endDate: "2025-01-15", status: "Planned", tasks: 5, editedBy: "System Auto", editedAt: "Dec 26, 09:00 AM", editedVia: "Scheduler" },
  { id: 4, name: "Sprint 1", project: "Super App", startDate: "2024-12-01", endDate: "2024-12-15", status: "Completed", tasks: 10, editedBy: "Team Lead", editedAt: "Dec 25, 11:45 AM", editedVia: "Web Portal" },
  { id: 5, name: "Sprint 2", project: "Super App", startDate: "2024-12-16", endDate: "2024-12-31", status: "Active", tasks: 6, editedBy: "Admin User", editedAt: "Dec 24, 02:00 PM", editedVia: "Manual Entry" },
  { id: 6, name: "Sprint 1", project: "Go Live", startDate: "2024-12-01", endDate: "2024-12-15", status: "Completed", tasks: 15 },
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  // Sprint stats
  const totalSprints = sprintsData.length;
  const activeSprints = sprintsData.filter(s => s.status === "Active").length;
  const completedSprints = sprintsData.filter(s => s.status === "Completed").length;
  const plannedSprints = sprintsData.filter(s => s.status === "Planned").length;

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Sprint Management</h1>
          <p className="text-sm text-muted-foreground">
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {/* Sprint Name */}
                <div className="space-y-1">
                  <Label htmlFor="sprint-name" className="text-xs">Sprint Name *</Label>
                  <Input
                    id="sprint-name"
                    placeholder="e.g., Sprint 1"
                    value={sprintName}
                    onChange={(e) => setSprintName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Project Selection */}
                <div className="space-y-1">
                  <Label htmlFor="sprint-project" className="text-xs">Project *</Label>
                  <Select value={sprintProject} onValueChange={setSprintProject}>
                    <SelectTrigger id="sprint-project" className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {projectsData.map((project) => (
                        <SelectItem key={project.id} value={project.name}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <Label htmlFor="start-date" className="text-xs">Start Date *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <Label htmlFor="end-date" className="text-xs">End Date *</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <Label htmlFor="sprint-status" className="text-xs">Status *</Label>
                  <Select value={sprintStatus} onValueChange={setSprintStatus}>
                    <SelectTrigger id="sprint-status" className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
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
                  <SelectTrigger className="h-8 text-xs w-40 bg-background">
                    <SelectValue placeholder="Filter by project" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectsData.map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 text-xs w-32 bg-background">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
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
            <div className="overflow-auto">
              <Table>
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
                                    <div className="flex items-center gap-1.5">
                                      <User className="h-3 w-3" />
                                      <span>{sprint.editedBy}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="h-3 w-3" />
                                      <span>{sprint.editedAt}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-muted-foreground">Via: {sprint.editedVia}</span>
                                    </div>
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
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.info(`Edit ${sprint.name}`)}>
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
      </div>
    </DashboardLayout>
  );
};

export default Sprints;
