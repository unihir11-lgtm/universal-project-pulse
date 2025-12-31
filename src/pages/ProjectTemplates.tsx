import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Search, 
  FileText, 
  Copy, 
  Pencil, 
  Trash2, 
  Rocket, 
  ClipboardCheck, 
  FileSearch,
  Settings,
  Code,
  Palette,
  ShieldCheck,
  Users,
  BarChart3,
  Briefcase,
  Target,
  Clock,
  CheckCircle,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { BillingModel, BILLING_MODEL_LABELS } from "@/types/project";

interface TemplateTask {
  name: string;
  estimatedHours: number;
  priority: "low" | "medium" | "high" | "urgent";
  isBillable: boolean;
}

interface TemplateMilestone {
  name: string;
  description: string;
  billingTrigger: boolean;
  billingPercent?: number;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: "starter-pack" | "custom" | "org-library";
  icon: keyof typeof iconMap;
  billingModel: BillingModel;
  defaultCurrency: string;
  estimatedDuration: string;
  defaultTasks: TemplateTask[];
  defaultMilestones: TemplateMilestone[];
  workflow: string[];
  usageCount: number;
  createdBy: string;
  isActive: boolean;
}

const iconMap = {
  Rocket,
  ClipboardCheck,
  FileSearch,
  Settings,
  Code,
  Palette,
  ShieldCheck,
  Users,
  BarChart3,
  Briefcase,
};

const ProjectTemplates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBillingModel, setFilterBillingModel] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Form state for new template
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "custom" as "starter-pack" | "custom" | "org-library",
    billingModel: "hourly" as BillingModel,
    estimatedDuration: "",
  });

  // Mock templates data (10 templates)
  const templates: ProjectTemplate[] = useMemo(() => [
    {
      id: "1",
      name: "Software Implementation",
      description: "Full software implementation project with discovery, development, testing, and deployment phases.",
      category: "starter-pack",
      icon: "Rocket",
      billingModel: "milestone",
      defaultCurrency: "USD",
      estimatedDuration: "12-16 weeks",
      defaultTasks: [
        { name: "Requirements Gathering", estimatedHours: 40, priority: "high", isBillable: true },
        { name: "System Design", estimatedHours: 60, priority: "high", isBillable: true },
        { name: "Core Development", estimatedHours: 200, priority: "high", isBillable: true },
        { name: "Integration Testing", estimatedHours: 40, priority: "medium", isBillable: true },
        { name: "User Acceptance Testing", estimatedHours: 24, priority: "high", isBillable: true },
        { name: "Deployment & Go-Live", estimatedHours: 16, priority: "urgent", isBillable: true },
      ],
      defaultMilestones: [
        { name: "Discovery Complete", description: "Requirements signed off", billingTrigger: true, billingPercent: 20 },
        { name: "Design Approved", description: "Architecture and UI approved", billingTrigger: true, billingPercent: 20 },
        { name: "Development Complete", description: "All features implemented", billingTrigger: true, billingPercent: 30 },
        { name: "Go-Live", description: "System deployed to production", billingTrigger: true, billingPercent: 30 },
      ],
      workflow: ["new", "in-progress", "in-review", "completed"],
      usageCount: 24,
      createdBy: "System",
      isActive: true,
    },
    {
      id: "2",
      name: "Financial Audit",
      description: "Comprehensive financial audit template with planning, fieldwork, and reporting phases.",
      category: "starter-pack",
      icon: "ClipboardCheck",
      billingModel: "fixed",
      defaultCurrency: "USD",
      estimatedDuration: "4-6 weeks",
      defaultTasks: [
        { name: "Audit Planning", estimatedHours: 16, priority: "high", isBillable: true },
        { name: "Risk Assessment", estimatedHours: 24, priority: "high", isBillable: true },
        { name: "Fieldwork", estimatedHours: 80, priority: "high", isBillable: true },
        { name: "Documentation Review", estimatedHours: 40, priority: "medium", isBillable: true },
        { name: "Draft Report", estimatedHours: 24, priority: "high", isBillable: true },
        { name: "Final Report", estimatedHours: 16, priority: "urgent", isBillable: true },
      ],
      defaultMilestones: [
        { name: "Planning Complete", description: "Audit plan approved", billingTrigger: false },
        { name: "Fieldwork Complete", description: "All testing completed", billingTrigger: true, billingPercent: 50 },
        { name: "Report Delivered", description: "Final audit report submitted", billingTrigger: true, billingPercent: 50 },
      ],
      workflow: ["new", "in-progress", "in-review", "completed"],
      usageCount: 18,
      createdBy: "System",
      isActive: true,
    },
    {
      id: "3",
      name: "Case Review",
      description: "Legal case review and analysis template with document review and report phases.",
      category: "starter-pack",
      icon: "FileSearch",
      billingModel: "hourly",
      defaultCurrency: "USD",
      estimatedDuration: "2-4 weeks",
      defaultTasks: [
        { name: "Initial Case Assessment", estimatedHours: 8, priority: "high", isBillable: true },
        { name: "Document Collection", estimatedHours: 16, priority: "medium", isBillable: true },
        { name: "Document Review", estimatedHours: 40, priority: "high", isBillable: true },
        { name: "Legal Research", estimatedHours: 24, priority: "high", isBillable: true },
        { name: "Analysis & Findings", estimatedHours: 16, priority: "high", isBillable: true },
        { name: "Client Report", estimatedHours: 8, priority: "urgent", isBillable: true },
      ],
      defaultMilestones: [
        { name: "Assessment Complete", description: "Initial case strategy defined", billingTrigger: false },
        { name: "Review Complete", description: "All documents reviewed", billingTrigger: false },
        { name: "Report Delivered", description: "Final findings delivered", billingTrigger: false },
      ],
      workflow: ["new", "in-progress", "in-review", "completed"],
      usageCount: 32,
      createdBy: "System",
      isActive: true,
    },
    {
      id: "4",
      name: "System Integration",
      description: "API and system integration project template with analysis, development, and testing.",
      category: "starter-pack",
      icon: "Settings",
      billingModel: "hybrid",
      defaultCurrency: "USD",
      estimatedDuration: "6-8 weeks",
      defaultTasks: [
        { name: "API Analysis", estimatedHours: 16, priority: "high", isBillable: true },
        { name: "Integration Design", estimatedHours: 24, priority: "high", isBillable: true },
        { name: "Development", estimatedHours: 80, priority: "high", isBillable: true },
        { name: "Unit Testing", estimatedHours: 24, priority: "medium", isBillable: true },
        { name: "Integration Testing", estimatedHours: 32, priority: "high", isBillable: true },
        { name: "Documentation", estimatedHours: 16, priority: "medium", isBillable: true },
      ],
      defaultMilestones: [
        { name: "Design Approved", description: "Integration architecture finalized", billingTrigger: true, billingPercent: 25 },
        { name: "Development Complete", description: "Integration built", billingTrigger: true, billingPercent: 50 },
        { name: "Go-Live", description: "Integration deployed", billingTrigger: true, billingPercent: 25 },
      ],
      workflow: ["new", "assigned", "in-progress", "in-review", "completed"],
      usageCount: 15,
      createdBy: "System",
      isActive: true,
    },
    {
      id: "5",
      name: "Web Application",
      description: "Modern web application development with responsive design and cloud deployment.",
      category: "org-library",
      icon: "Code",
      billingModel: "milestone",
      defaultCurrency: "USD",
      estimatedDuration: "8-12 weeks",
      defaultTasks: [
        { name: "UI/UX Design", estimatedHours: 40, priority: "high", isBillable: true },
        { name: "Frontend Development", estimatedHours: 120, priority: "high", isBillable: true },
        { name: "Backend Development", estimatedHours: 100, priority: "high", isBillable: true },
        { name: "Database Design", estimatedHours: 24, priority: "high", isBillable: true },
        { name: "Testing & QA", estimatedHours: 40, priority: "medium", isBillable: true },
        { name: "Deployment", estimatedHours: 16, priority: "high", isBillable: true },
      ],
      defaultMilestones: [
        { name: "Design Complete", description: "All mockups approved", billingTrigger: true, billingPercent: 20 },
        { name: "MVP Ready", description: "Core features complete", billingTrigger: true, billingPercent: 40 },
        { name: "Launch", description: "Application deployed", billingTrigger: true, billingPercent: 40 },
      ],
      workflow: ["new", "assigned", "in-progress", "in-review", "blocked", "completed"],
      usageCount: 28,
      createdBy: "Engineering Team",
      isActive: true,
    },
    {
      id: "6",
      name: "Brand Redesign",
      description: "Complete brand identity redesign including logo, guidelines, and collateral.",
      category: "org-library",
      icon: "Palette",
      billingModel: "fixed",
      defaultCurrency: "USD",
      estimatedDuration: "4-6 weeks",
      defaultTasks: [
        { name: "Discovery & Research", estimatedHours: 20, priority: "high", isBillable: true },
        { name: "Concept Development", estimatedHours: 40, priority: "high", isBillable: true },
        { name: "Logo Design", estimatedHours: 32, priority: "high", isBillable: true },
        { name: "Brand Guidelines", estimatedHours: 24, priority: "medium", isBillable: true },
        { name: "Collateral Design", estimatedHours: 40, priority: "medium", isBillable: true },
        { name: "Asset Delivery", estimatedHours: 8, priority: "high", isBillable: true },
      ],
      defaultMilestones: [
        { name: "Concepts Approved", description: "Initial concepts selected", billingTrigger: true, billingPercent: 30 },
        { name: "Logo Finalized", description: "Logo design approved", billingTrigger: true, billingPercent: 40 },
        { name: "Delivery", description: "All assets delivered", billingTrigger: true, billingPercent: 30 },
      ],
      workflow: ["new", "in-progress", "in-review", "completed"],
      usageCount: 12,
      createdBy: "Design Team",
      isActive: true,
    },
    {
      id: "7",
      name: "Security Assessment",
      description: "Comprehensive security audit including vulnerability assessment and penetration testing.",
      category: "starter-pack",
      icon: "ShieldCheck",
      billingModel: "fixed",
      defaultCurrency: "USD",
      estimatedDuration: "2-3 weeks",
      defaultTasks: [
        { name: "Scope Definition", estimatedHours: 8, priority: "high", isBillable: true },
        { name: "Vulnerability Scanning", estimatedHours: 16, priority: "high", isBillable: true },
        { name: "Penetration Testing", estimatedHours: 40, priority: "high", isBillable: true },
        { name: "Risk Analysis", estimatedHours: 16, priority: "high", isBillable: true },
        { name: "Remediation Planning", estimatedHours: 12, priority: "medium", isBillable: true },
        { name: "Final Report", estimatedHours: 16, priority: "urgent", isBillable: true },
      ],
      defaultMilestones: [
        { name: "Assessment Complete", description: "All testing completed", billingTrigger: true, billingPercent: 60 },
        { name: "Report Delivered", description: "Final report with recommendations", billingTrigger: true, billingPercent: 40 },
      ],
      workflow: ["new", "in-progress", "in-review", "completed"],
      usageCount: 9,
      createdBy: "System",
      isActive: true,
    },
    {
      id: "8",
      name: "Team Onboarding",
      description: "Internal project for onboarding new team members with training and setup tasks.",
      category: "org-library",
      icon: "Users",
      billingModel: "hourly",
      defaultCurrency: "USD",
      estimatedDuration: "1-2 weeks",
      defaultTasks: [
        { name: "Equipment Setup", estimatedHours: 4, priority: "high", isBillable: false },
        { name: "Account Creation", estimatedHours: 2, priority: "high", isBillable: false },
        { name: "Tool Training", estimatedHours: 8, priority: "medium", isBillable: false },
        { name: "Process Overview", estimatedHours: 4, priority: "medium", isBillable: false },
        { name: "Team Introductions", estimatedHours: 2, priority: "low", isBillable: false },
        { name: "First Assignment", estimatedHours: 8, priority: "medium", isBillable: false },
      ],
      defaultMilestones: [
        { name: "Setup Complete", description: "All accounts and tools ready", billingTrigger: false },
        { name: "Training Complete", description: "Onboarding training finished", billingTrigger: false },
      ],
      workflow: ["new", "in-progress", "completed"],
      usageCount: 45,
      createdBy: "HR Team",
      isActive: true,
    },
    {
      id: "9",
      name: "Data Analytics Project",
      description: "Data analysis and visualization project with reporting and insights delivery.",
      category: "custom",
      icon: "BarChart3",
      billingModel: "hourly",
      defaultCurrency: "USD",
      estimatedDuration: "3-5 weeks",
      defaultTasks: [
        { name: "Data Collection", estimatedHours: 16, priority: "high", isBillable: true },
        { name: "Data Cleaning", estimatedHours: 24, priority: "medium", isBillable: true },
        { name: "Analysis", estimatedHours: 40, priority: "high", isBillable: true },
        { name: "Visualization", estimatedHours: 24, priority: "medium", isBillable: true },
        { name: "Report Creation", estimatedHours: 16, priority: "high", isBillable: true },
        { name: "Presentation", estimatedHours: 8, priority: "high", isBillable: true },
      ],
      defaultMilestones: [
        { name: "Data Ready", description: "Data collected and cleaned", billingTrigger: false },
        { name: "Analysis Complete", description: "Insights generated", billingTrigger: false },
        { name: "Delivered", description: "Report and presentation complete", billingTrigger: false },
      ],
      workflow: ["new", "in-progress", "in-review", "completed"],
      usageCount: 21,
      createdBy: "Analytics Team",
      isActive: true,
    },
    {
      id: "10",
      name: "Consulting Engagement",
      description: "General consulting project template with discovery, analysis, and recommendations.",
      category: "custom",
      icon: "Briefcase",
      billingModel: "hourly",
      defaultCurrency: "USD",
      estimatedDuration: "Variable",
      defaultTasks: [
        { name: "Stakeholder Interviews", estimatedHours: 16, priority: "high", isBillable: true },
        { name: "Current State Analysis", estimatedHours: 24, priority: "high", isBillable: true },
        { name: "Gap Analysis", estimatedHours: 16, priority: "high", isBillable: true },
        { name: "Recommendations", estimatedHours: 24, priority: "high", isBillable: true },
        { name: "Implementation Plan", estimatedHours: 16, priority: "medium", isBillable: true },
        { name: "Executive Presentation", estimatedHours: 8, priority: "urgent", isBillable: true },
      ],
      defaultMilestones: [
        { name: "Discovery Complete", description: "Current state documented", billingTrigger: false },
        { name: "Recommendations Delivered", description: "Final recommendations presented", billingTrigger: false },
      ],
      workflow: ["new", "in-progress", "in-review", "completed"],
      usageCount: 38,
      createdBy: "Consulting Team",
      isActive: true,
    },
  ], []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || template.category === filterCategory;
      const matchesBilling = filterBillingModel === "all" || template.billingModel === filterBillingModel;
      return matchesSearch && matchesCategory && matchesBilling;
    });
  }, [templates, searchQuery, filterCategory, filterBillingModel]);

  // Stats
  const stats = useMemo(() => ({
    total: templates.length,
    starterPacks: templates.filter(t => t.category === "starter-pack").length,
    orgLibrary: templates.filter(t => t.category === "org-library").length,
    custom: templates.filter(t => t.category === "custom").length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
  }), [templates]);

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      "starter-pack": "default",
      "org-library": "secondary",
      "custom": "outline",
    };
    const labels: Record<string, string> = {
      "starter-pack": "Starter Pack",
      "org-library": "Org Library",
      "custom": "Custom",
    };
    return <Badge variant={variants[category]}>{labels[category]}</Badge>;
  };

  const handleViewTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setIsDetailDialogOpen(true);
  };

  const handleUseTemplate = (template: ProjectTemplate) => {
    toast.success(`Creating project from "${template.name}" template`);
  };

  const handleDuplicateTemplate = (template: ProjectTemplate) => {
    toast.success(`Template "${template.name}" duplicated`);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Template "${formData.name}" created`);
    setIsCreateDialogOpen(false);
    setFormData({
      name: "",
      description: "",
      category: "custom",
      billingModel: "hourly",
      estimatedDuration: "",
    });
  };

  const IconComponent = ({ iconName }: { iconName: keyof typeof iconMap }) => {
    const Icon = iconMap[iconName];
    return <Icon className="h-8 w-8" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Project Templates</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage reusable project templates
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle>Create Project Template</DialogTitle>
                <DialogDescription>
                  Create a new template with default tasks, milestones, and workflow.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Name *</Label>
                  <Input
                    placeholder="e.g., Mobile App Development"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe what this template is for..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: "starter-pack" | "custom" | "org-library") => 
                        setFormData(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="org-library">Org Library</SelectItem>
                        <SelectItem value="starter-pack">Starter Pack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Model</Label>
                    <Select
                      value={formData.billingModel}
                      onValueChange={(value: BillingModel) => 
                        setFormData(prev => ({ ...prev, billingModel: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Estimated Duration</Label>
                  <Input
                    placeholder="e.g., 4-6 weeks"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Template</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>


        {/* Filters */}
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="starter-pack">Starter Packs</SelectItem>
                    <SelectItem value="org-library">Org Library</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Billing Model</Label>
                <Select value={filterBillingModel} onValueChange={setFilterBillingModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Models" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Models</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Badge variant="secondary" className="h-10 px-4 flex items-center">
                  {filteredTemplates.length} templates
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Grid */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <IconComponent iconName={template.icon} />
                  </div>
                  {getCategoryBadge(template.category)}
                </div>
                <CardTitle className="mt-4">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{template.estimatedDuration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tasks:</span>
                    <span className="font-medium">{template.defaultTasks.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Milestones:</span>
                    <span className="font-medium">{template.defaultMilestones.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Billing:</span>
                    <Badge variant="outline" className="text-xs">
                      {BILLING_MODEL_LABELS[template.billingModel]}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="pt-4">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-muted-foreground">
                    Used {template.usageCount} times
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleViewTemplate(template)}>
                      <FileSearch className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDuplicateTemplate(template)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => handleUseTemplate(template)}>
                      Use
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No templates found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your filters or create a new template.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Template Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-background max-w-3xl max-h-[80vh] overflow-auto">
            {selectedTemplate && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      <IconComponent iconName={selectedTemplate.icon} />
                    </div>
                    <div>
                      <DialogTitle>{selectedTemplate.name}</DialogTitle>
                      <DialogDescription>{selectedTemplate.description}</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Overview */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">{selectedTemplate.estimatedDuration}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Billing Model</p>
                      <p className="font-medium">{BILLING_MODEL_LABELS[selectedTemplate.billingModel]}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Created By</p>
                      <p className="font-medium">{selectedTemplate.createdBy}</p>
                    </div>
                  </div>

                  {/* Default Tasks */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      Default Tasks ({selectedTemplate.defaultTasks.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedTemplate.defaultTasks.map((task, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs capitalize">{task.priority}</Badge>
                            <span className="font-medium">{task.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{task.estimatedHours}h</span>
                            {task.isBillable && <Badge variant="secondary" className="text-xs">Billable</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Default Milestones */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Default Milestones ({selectedTemplate.defaultMilestones.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedTemplate.defaultMilestones.map((milestone, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{milestone.name}</p>
                            <p className="text-xs text-muted-foreground">{milestone.description}</p>
                          </div>
                          {milestone.billingTrigger && (
                            <Badge className="bg-success text-success-foreground">
                              {milestone.billingPercent}% billing
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workflow */}
                  <div>
                    <h4 className="font-semibold mb-3">Workflow Stages</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.workflow.map((stage, idx) => (
                        <Badge key={idx} variant="outline" className="capitalize">
                          {stage.replace("-", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setIsDetailDialogOpen(false);
                  }}>
                    Use Template
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ProjectTemplates;
