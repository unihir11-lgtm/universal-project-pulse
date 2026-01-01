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
  DollarSign,
  FileText,
  Sparkles,
  Save,
  Calendar,
  Pencil,
  Clock,
  User
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock project templates data
const projectTemplates = [
  { id: "1", name: "Implementation Project", category: "starter-pack", billingModel: "fixed", estimatedDuration: "3 months", defaultTasks: 12 },
  { id: "2", name: "Audit & Compliance Review", category: "starter-pack", billingModel: "hourly", estimatedDuration: "2 months", defaultTasks: 8 },
  { id: "3", name: "Case Review Template", category: "starter-pack", billingModel: "hourly", estimatedDuration: "1 month", defaultTasks: 6 },
  { id: "4", name: "Software Development Sprint", category: "org-library", billingModel: "hourly", estimatedDuration: "2 weeks", defaultTasks: 10 },
  { id: "5", name: "Marketing Campaign", category: "org-library", billingModel: "fixed", estimatedDuration: "6 weeks", defaultTasks: 15 },
  { id: "6", name: "Website Redesign", category: "org-library", billingModel: "milestone", estimatedDuration: "2 months", defaultTasks: 18 },
  { id: "7", name: "Product Launch", category: "custom", billingModel: "fixed", estimatedDuration: "3 months", defaultTasks: 20 },
  { id: "8", name: "Data Migration", category: "starter-pack", billingModel: "hourly", estimatedDuration: "1 month", defaultTasks: 8 },
  { id: "9", name: "Training Program", category: "org-library", billingModel: "fixed", estimatedDuration: "4 weeks", defaultTasks: 10 },
  { id: "10", name: "Consulting Engagement", category: "custom", billingModel: "retainer", estimatedDuration: "6 months", defaultTasks: 5 },
];
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
import { 
  Project, 
  ProjectType, 
  Currency,
  BillingModel,
  canConvertProjectType, 
  isBillable,
  canChangeCurrency,
  formatCurrency,
  getProjectCurrency,
  CURRENCY_SYMBOLS,
  ORG_DEFAULT_CURRENCY,
  BILLING_MODEL_LABELS,
  BILLING_MODEL_DESCRIPTIONS,
} from "@/types/project";

const Projects = () => {
  const { user, hasPermission } = useAuth();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [projectToConvert, setProjectToConvert] = useState<Project | null>(null);
  const [filterType, setFilterType] = useState<"all" | ProjectType>("external");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [billingPeriod, setBillingPeriod] = useState<"today" | "week" | "month" | "quarter" | "year" | "all">("month");
  
  // New states for Details, Edit, and Assign dialogs
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
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
    billingModel: "hourly" as BillingModel,
    billableRate: "",
    currency: ORG_DEFAULT_CURRENCY as Currency,
    templateId: "" as string,
  });

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "none") {
      handleInputChange("templateId", "");
      return;
    }
    
    const template = projectTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        projectName: prev.projectName || template.name,
        billingModel: template.billingModel as BillingModel,
      }));
      toast.success(`Template "${template.name}" applied with ${template.defaultTasks} default tasks`);
    }
  };
  
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
        billingModel: formData.billingModel,
        billableRate: parseFloat(formData.billableRate) || 0,
        estimatedBudget: 0,
        invoiced: 0,
        billableAmount: 0,
        unbilledAmount: 0,
        currency: formData.currency,
        currencyLocked: false,
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
      billingModel: "hourly",
      billableRate: "",
      currency: ORG_DEFAULT_CURRENCY,
      templateId: "",
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

  // Handlers for View Details, Edit, and Assign Employees
  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setDetailsDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleAssignEmployees = (project: Project) => {
    setSelectedProject(project);
    setAssignDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedProject) return;
    toast.success(`Project "${selectedProject.name}" updated successfully`);
    setEditDialogOpen(false);
    setSelectedProject(null);
  };

  const handleSaveAssignments = () => {
    if (!selectedProject) return;
    toast.success(`Employees assigned to "${selectedProject.name}"`);
    setAssignDialogOpen(false);
    setSelectedProject(null);
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
  const totalBilled = projects
    .filter(p => p.projectType === "external")
    .reduce((sum, p) => sum + (p.invoiced ?? 0), 0);
  const totalBillable = projects
    .filter(p => p.projectType === "external")
    .reduce((sum, p) => sum + (p.billableAmount ?? 0), 0);
  const totalUnbilled = projects
    .filter(p => p.projectType === "external")
    .reduce((sum, p) => sum + (p.unbilledAmount ?? 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Project Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track billable and operational projects
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <FilePlus className="h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto mx-2 md:mx-auto">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the project details and assign team members
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                {/* Project Template Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Start from Template
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="template">Project Template (Optional)</Label>
                    <Select
                      value={formData.templateId || "none"}
                      onValueChange={handleTemplateSelect}
                    >
                      <SelectTrigger id="template" className="w-full">
                        <SelectValue placeholder="Select a template to get started quickly" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>Start from scratch</span>
                          </div>
                        </SelectItem>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                          Starter Packs
                        </div>
                        {projectTemplates.filter(t => t.category === "starter-pack").map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span>{template.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {template.defaultTasks} tasks
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                          Organization Library
                        </div>
                        {projectTemplates.filter(t => t.category === "org-library").map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span>{template.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {template.defaultTasks} tasks
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                          Custom Templates
                        </div>
                        {projectTemplates.filter(t => t.category === "custom").map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-amber-500" />
                              <span>{template.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {template.defaultTasks} tasks
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.templateId && (
                      <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm text-primary">
                          Template selected: {projectTemplates.find(t => t.id === formData.templateId)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

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
                    <>
                      {/* Billing Model Selection */}
                      <div className="space-y-3">
                        <Label>Billing Model *</Label>
                        <div className="grid gap-3 md:grid-cols-2">
                          {(Object.keys(BILLING_MODEL_LABELS) as BillingModel[]).map((model) => (
                            <div
                              key={model}
                              onClick={() => handleInputChange("billingModel", model)}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                formData.billingModel === model
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-muted-foreground"
                              }`}
                            >
                              <p className="font-medium text-sm">{BILLING_MODEL_LABELS[model]}</p>
                              <p className="text-xs text-muted-foreground">{BILLING_MODEL_DESCRIPTIONS[model]}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency *</Label>
                          <Select
                            value={formData.currency}
                            onValueChange={(value) => handleInputChange("currency", value)}
                          >
                            <SelectTrigger id="currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(CURRENCY_SYMBOLS) as Currency[]).map((curr) => (
                                <SelectItem key={curr} value={curr}>
                                  {CURRENCY_SYMBOLS[curr]} {curr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Currency will be locked after first invoice
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billableRate">
                            Billable Rate ({CURRENCY_SYMBOLS[formData.currency]}/hr)
                            {formData.billingModel !== "fixed" && " *"}
                          </Label>
                          <Input
                            id="billableRate"
                            type="number"
                            value={formData.billableRate}
                            onChange={(e) => handleInputChange("billableRate", e.target.value)}
                            placeholder="150"
                            disabled={formData.billingModel === "fixed"}
                          />
                          {formData.billingModel === "fixed" && (
                            <p className="text-xs text-muted-foreground">
                              Not applicable for fixed price projects
                            </p>
                          )}
                        </div>
                      </div>
                    </>
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

        {/* Billing Summary with Date Filter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Billing Summary</h2>
            <Select value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as typeof billingPeriod)}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        </div>

        <Card>
          <CardHeader className="py-3 md:py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <CardTitle className="text-base md:text-lg">Projects</CardTitle>
                <Tabs value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="external" className="text-xs md:text-sm px-2 md:px-3">External</TabsTrigger>
                    <TabsTrigger value="internal" className="text-xs md:text-sm px-2 md:px-3">Internal</TabsTrigger>
                    <TabsTrigger value="all" className="text-xs md:text-sm px-2 md:px-3">All</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search projects..." 
                    className="pl-9 w-full md:w-64 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  {filterType !== "internal" && <TableHead>Billing</TableHead>}
                  <TableHead>Hours</TableHead>
                  {filterType !== "internal" && <TableHead>Billed</TableHead>}
                  {filterType !== "internal" && <TableHead>Billable</TableHead>}
                  {filterType !== "internal" && <TableHead>Unbilled</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className={project.editedBy ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{project.name}</span>
                        {project.editedBy && (
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
                                    <span>{project.editedBy}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    <span>{project.editedAt}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground">Via: {project.editedVia}</span>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
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
                    {filterType !== "internal" && (
                      <TableCell>
                        {isBillable(project) && project.billingModel ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {BILLING_MODEL_LABELS[project.billingModel]}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {getProjectCurrency(project)}
                              {project.currencyLocked && " (locked)"}
                            </span>
                          </div>
                        ) : "—"}
                      </TableCell>
                    )}
                    <TableCell>{project.hoursLogged}h</TableCell>
                    {filterType !== "internal" && (
                      <TableCell>
                        {isBillable(project) ? (
                          <span className="text-green-600 font-medium">
                            {formatCurrency(project.invoiced ?? 0, getProjectCurrency(project))}
                          </span>
                        ) : "—"}
                      </TableCell>
                    )}
                    {filterType !== "internal" && (
                      <TableCell>
                        {isBillable(project) ? (
                          <span className="text-amber-600 font-medium">
                            {formatCurrency(project.billableAmount ?? 0, getProjectCurrency(project))}
                          </span>
                        ) : "—"}
                      </TableCell>
                    )}
                    {filterType !== "internal" && (
                      <TableCell>
                        {isBillable(project) ? (
                          <span className="text-muted-foreground">
                            {formatCurrency(project.unbilledAmount ?? 0, getProjectCurrency(project))}
                          </span>
                        ) : "—"}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => handleViewDetails(project)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProject(project)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignEmployees(project)}>Assign Employees</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              toast.success(`Template created from "${project.name}"`);
                            }}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save as Template
                          </DropdownMenuItem>
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
            </div>
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

      {/* View Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl mx-2 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Project Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this project
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Project Name</Label>
                  <p className="font-medium">{selectedProject.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge variant={getProjectTypeVariant(selectedProject.projectType)}>
                    {selectedProject.projectType === "external" ? "External" : "Internal"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Client</Label>
                  <p className="font-medium">{selectedProject.client ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Manager</Label>
                  <p className="font-medium">{selectedProject.manager}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant={getStatusVariant(selectedProject.status)}>{selectedProject.status}</Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Hours Logged</Label>
                  <p className="font-medium">{selectedProject.hoursLogged}h</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Assigned Employees</Label>
                  <p className="font-medium">{selectedProject.assignedEmployees}</p>
                </div>
                {isBillable(selectedProject) && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Billing Model</Label>
                      <p className="font-medium">{selectedProject.billingModel ? BILLING_MODEL_LABELS[selectedProject.billingModel] : "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Invoiced</Label>
                      <p className="font-medium text-green-600">{formatCurrency(selectedProject.invoiced ?? 0, getProjectCurrency(selectedProject))}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Billable Amount</Label>
                      <p className="font-medium text-amber-600">{formatCurrency(selectedProject.billableAmount ?? 0, getProjectCurrency(selectedProject))}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl mx-2 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Project
            </DialogTitle>
            <DialogDescription>
              Update project information
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Project Name</Label>
                  <Input id="edit-name" defaultValue={selectedProject.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-client">Client</Label>
                  <Input id="edit-client" defaultValue={selectedProject.client ?? ""} disabled={selectedProject.projectType === "internal"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-manager">Manager</Label>
                  <Select defaultValue={selectedProject.manager}>
                    <SelectTrigger id="edit-manager">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="John Smith">John Smith</SelectItem>
                      <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                      <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select defaultValue={selectedProject.status}>
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isBillable(selectedProject) && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="edit-billing">Billing Model</Label>
                      <Select defaultValue={selectedProject.billingModel}>
                        <SelectTrigger id="edit-billing">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="fixed">Fixed Price</SelectItem>
                          <SelectItem value="milestone">Milestone-based</SelectItem>
                          <SelectItem value="retainer">Retainer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-rate">Billable Rate</Label>
                      <Input id="edit-rate" type="number" defaultValue={selectedProject.billableRate ?? ""} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Employees Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-lg mx-2 md:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Assign Employees
            </DialogTitle>
            <DialogDescription>
              {selectedProject ? `Select employees to assign to "${selectedProject.name}"` : "Select employees"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
            {availableEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={`assign-${employee.id}`}
                  checked={selectedEmployees.includes(employee.id)}
                  onCheckedChange={() => handleEmployeeToggle(employee.id)}
                />
                <label htmlFor={`assign-${employee.id}`} className="flex-1 cursor-pointer">
                  <p className="font-medium text-sm">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">{employee.designation}</p>
                </label>
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAssignments} disabled={selectedEmployees.length === 0}>
              Assign ({selectedEmployees.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Projects;