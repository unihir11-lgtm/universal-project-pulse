import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  Search, 
  FilePlus, 
  Filter, 
  MoreVertical, 
  Users, 
  Building2, 
  Briefcase,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { mockProjects } from "@/data/mockProjects";
import { Project, ProjectType, canConvertProjectType, isBillable } from "@/types/project";

const Projects = () => {
  const { user, hasPermission } = useAuth();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [projectToConvert, setProjectToConvert] = useState<Project | null>(null);
  const [filterType, setFilterType] = useState<"all" | ProjectType>("external");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "external" as ProjectType,
    client: "",
    manager: "",
    startDate: "",
    endDate: "",
    estimatedHours: "",
    priority: "",
    description: "",
    status: "Active",
    billableRate: "",
  });
  
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const availableEmployees = [
    { id: "1", name: "John Doe", designation: "Senior Developer" },
    { id: "2", name: "Sarah Smith", designation: "Project Manager" },
    { id: "3", name: "Mike Johnson", designation: "UI/UX Designer" },
    { id: "4", name: "Emily Brown", designation: "QA Engineer" },
    { id: "5", name: "David Lee", designation: "DevOps Engineer" },
    { id: "6", name: "Lisa Wang", designation: "Developer" },
    { id: "7", name: "James Wilson", designation: "Developer" },
    { id: "8", name: "Anna Martinez", designation: "QA Engineer" },
  ];

  // Filter projects based on type and search
  const filteredProjects = projects.filter((project) => {
    const matchesType = filterType === "all" || project.projectType === filterType;
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.client?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesType && matchesSearch;
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectName || !formData.manager) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.projectType === "external" && !formData.client) {
      toast.error("External projects require a client");
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error("Please assign at least one employee");
      return;
    }

    const newProject: Project = {
      id: Math.max(...projects.map(p => p.id)) + 1,
      name: formData.projectName,
      projectType: formData.projectType,
      client: formData.projectType === "external" ? formData.client : null,
      manager: formData.manager,
      status: "Active",
      assignedEmployees: selectedEmployees.length,
      hoursLogged: 0,
      ...(formData.projectType === "external" && {
        billableRate: parseFloat(formData.billableRate) || 0,
        estimatedBudget: 0,
        invoiced: 0,
      }),
    };

    setProjects(prev => [...prev, newProject]);
    toast.success(`${formData.projectType === "external" ? "External" : "Internal"} project created successfully`);
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      projectType: "external",
      client: "",
      manager: "",
      startDate: "",
      endDate: "",
      estimatedHours: "",
      priority: "",
      description: "",
      status: "Active",
      billableRate: "",
    });
    setSelectedEmployees([]);
  };

  const handleConvertProject = (project: Project) => {
    if (!canConvertProjectType(user?.role ?? "user")) {
      toast.error("You don't have permission to convert project types");
      return;
    }
    setProjectToConvert(project);
    setConvertDialogOpen(true);
  };

  const confirmConversion = () => {
    if (!projectToConvert) return;

    setProjects(prev => prev.map(p => {
      if (p.id === projectToConvert.id) {
        const isConvertingToExternal = p.projectType === "internal";
        return {
          ...p,
          projectType: isConvertingToExternal ? "external" : "internal",
          client: isConvertingToExternal ? "To Be Assigned" : null,
          ...(isConvertingToExternal ? {
            billableRate: 0,
            estimatedBudget: 0,
            invoiced: 0,
          } : {
            billableRate: undefined,
            estimatedBudget: undefined,
            invoiced: undefined,
          }),
        } as Project;
      }
      return p;
    }));

    toast.success(`Project converted to ${projectToConvert.projectType === "internal" ? "External" : "Internal"}`);
    setConvertDialogOpen(false);
    setProjectToConvert(null);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "On Hold":
        return "secondary";
      case "Completed":
        return "outline";
      default:
        return "default";
    }
  };

  const getProjectTypeVariant = (type: ProjectType) => {
    return type === "external" ? "default" : "secondary";
  };

  // Stats
  const externalCount = projects.filter(p => p.projectType === "external").length;
  const internalCount = projects.filter(p => p.projectType === "internal").length;
  const totalBillable = projects
    .filter(p => p.projectType === "external")
    .reduce((sum, p) => sum + (p.invoiced ?? 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Project Management</h1>
            <p className="text-muted-foreground mt-1">
              Track billable and operational projects
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FilePlus className="h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the project details and assign team members
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                {/* Project Type Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Project Type</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div
                      onClick={() => handleInputChange("projectType", "external")}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.projectType === "external"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">External (Billable)</p>
                          <p className="text-sm text-muted-foreground">Client work with invoicing</p>
                        </div>
                      </div>
                    </div>
                    <div
                      onClick={() => handleInputChange("projectType", "internal")}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.projectType === "internal"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Internal (Operational)</p>
                          <p className="text-sm text-muted-foreground">Company projects, no billing</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Project Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project Name *</Label>
                      <Input
                        id="projectName"
                        value={formData.projectName}
                        onChange={(e) => handleInputChange("projectName", e.target.value)}
                        placeholder="E-Commerce Platform"
                        required
                      />
                    </div>
                    {formData.projectType === "external" && (
                      <div className="space-y-2">
                        <Label htmlFor="client">Client Name *</Label>
                        <Input
                          id="client"
                          value={formData.client}
                          onChange={(e) => handleInputChange("client", e.target.value)}
                          placeholder="TechCorp Inc"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="manager">Project Manager *</Label>
                      <Select
                        value={formData.manager}
                        onValueChange={(value) => handleInputChange("manager", value)}
                      >
                        <SelectTrigger id="manager">
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sarah Smith">Sarah Smith</SelectItem>
                          <SelectItem value="John Doe">John Doe</SelectItem>
                          <SelectItem value="Emily Brown">Emily Brown</SelectItem>
                          <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority *</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => handleInputChange("priority", value)}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.projectType === "external" && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="billableRate">Billable Rate ($/hr)</Label>
                        <Input
                          id="billableRate"
                          type="number"
                          value={formData.billableRate}
                          onChange={(e) => handleInputChange("billableRate", e.target.value)}
                          placeholder="150"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Brief description of the project goals and deliverables..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Timeline</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedHours">Estimated Hours *</Label>
                      <Input
                        id="estimatedHours"
                        type="number"
                        value={formData.estimatedHours}
                        onChange={(e) => handleInputChange("estimatedHours", e.target.value)}
                        placeholder="320"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Assign Employees */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Assign Team Members *</h3>
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                    {availableEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center space-x-3 p-3 hover:bg-secondary/50 rounded-lg transition-colors"
                      >
                        <Checkbox
                          id={`employee-${employee.id}`}
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={() => handleEmployeeToggle(employee.id)}
                        />
                        <label
                          htmlFor={`employee-${employee.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.designation}</p>
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployees.length} employee(s) selected
                  </p>
                </div>

                <DialogFooter className="pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Project
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">External Projects</p>
                  <p className="text-2xl font-bold">{externalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Internal Projects</p>
                  <p className="text-2xl font-bold">{internalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoiced</p>
                  <p className="text-2xl font-bold">${totalBillable.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <CardTitle>Projects</CardTitle>
                <Tabs value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                  <TabsList>
                    <TabsTrigger value="external">External</TabsTrigger>
                    <TabsTrigger value="internal">Internal</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search projects..." 
                    className="pl-9 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Hours</TableHead>
                  {filterType !== "internal" && <TableHead>Invoiced</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <Badge variant={getProjectTypeVariant(project.projectType)}>
                        {project.projectType === "external" ? "External" : "Internal"}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.client ?? "—"}</TableCell>
                    <TableCell>{project.manager}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{project.assignedEmployees}</span>
                      </div>
                    </TableCell>
                    <TableCell>{project.hoursLogged}h</TableCell>
                    {filterType !== "internal" && (
                      <TableCell>
                        {isBillable(project) ? `$${(project.invoiced ?? 0).toLocaleString()}` : "—"}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Assign Employees</DropdownMenuItem>
                          {hasPermission(["admin", "finance"]) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleConvertProject(project)}>
                                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                                Convert to {project.projectType === "internal" ? "External" : "Internal"}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Convert Project Dialog */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Convert Project Type
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to convert <strong>{projectToConvert?.name}</strong> from{" "}
                <strong>{projectToConvert?.projectType}</strong> to{" "}
                <strong>{projectToConvert?.projectType === "internal" ? "external" : "internal"}</strong>.
              </p>
              {projectToConvert?.projectType === "internal" ? (
                <p className="text-amber-600">
                  This will enable billing features. You will need to assign a client and set billing rates.
                </p>
              ) : (
                <p className="text-amber-600">
                  This will remove all billing data including invoiced amounts and rates. This action cannot be undone.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConversion}>
              Convert Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Projects;