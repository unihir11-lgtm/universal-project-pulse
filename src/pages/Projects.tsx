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
import { Search, FilePlus, Filter, MoreVertical, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const projects = [
  {
    id: 1,
    name: "E-Commerce Platform",
    client: "TechCorp Inc",
    manager: "Sarah Smith",
    status: "Active",
    assignedEmployees: 8,
    hoursLogged: 342,
  },
  {
    id: 2,
    name: "Mobile Banking App",
    client: "FinanceHub",
    manager: "John Doe",
    status: "Active",
    assignedEmployees: 6,
    hoursLogged: 256,
  },
  {
    id: 3,
    name: "CRM System",
    client: "SalesForce Ltd",
    manager: "Emily Brown",
    status: "On Hold",
    assignedEmployees: 5,
    hoursLogged: 189,
  },
  {
    id: 4,
    name: "Analytics Dashboard",
    client: "DataViz Pro",
    manager: "Mike Johnson",
    status: "Active",
    assignedEmployees: 4,
    hoursLogged: 298,
  },
  {
    id: 5,
    name: "Inventory Management",
    client: "RetailChain",
    manager: "David Lee",
    status: "Completed",
    assignedEmployees: 7,
    hoursLogged: 445,
  },
];

const Projects = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    client: "",
    manager: "",
    startDate: "",
    endDate: "",
    estimatedHours: "",
    priority: "",
    description: "",
    status: "Active",
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
    
    if (!formData.projectName || !formData.client || !formData.manager) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error("Please assign at least one employee");
      return;
    }

    toast.success(`Project created with ${selectedEmployees.length} employees assigned`);
    setDialogOpen(false);
    // Reset form
    setFormData({
      projectName: "",
      client: "",
      manager: "",
      startDate: "",
      endDate: "",
      estimatedHours: "",
      priority: "",
      description: "",
      status: "Active",
    });
    setSelectedEmployees([]);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Project Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all your projects
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
                          <SelectItem value="sarah-smith">Sarah Smith</SelectItem>
                          <SelectItem value="john-doe">John Doe</SelectItem>
                          <SelectItem value="emily-brown">Emily Brown</SelectItem>
                          <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
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

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Project
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Projects</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search projects..." className="pl-9 w-64" />
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
                  <TableHead>Client</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Hours Logged</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.client}</TableCell>
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
    </DashboardLayout>
  );
};

export default Projects;
