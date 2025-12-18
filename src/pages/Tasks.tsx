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
import { Plus, ListTodo, Calendar, Target } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Mock data for projects
const projectsData = [
  { id: 1, project: "Go Live" },
  { id: 2, project: "Human Resource" },
  { id: 3, project: "Jain Connection Marketing" },
  { id: 4, project: "Jain Marketplace" },
  { id: 5, project: "Product Support" },
  { id: 6, project: "Super App" },
  { id: 7, project: "Universal Software" },
];

// Mock employees data
const employeesData = [
  { id: 1, name: "Rahul Sharma" },
  { id: 2, name: "Priya Patel" },
  { id: 3, name: "Amit Kumar" },
  { id: 4, name: "Sneha Gupta" },
  { id: 5, name: "Vikram Singh" },
  { id: 6, name: "Neha Verma" },
];

// Task categories
const taskCategories = [
  "Testing",
  "Designing",
  "Development",
  "Analysis",
  "Documentation",
  "Code Review",
  "Bug Fixing",
  "Deployment",
];

// Mock sprints data
const sprintsData = [
  { id: 1, name: "Sprint 1", startDate: "01-12-2024", endDate: "15-12-2024", status: "Completed" },
  { id: 2, name: "Sprint 2", startDate: "16-12-2024", endDate: "31-12-2024", status: "Active" },
  { id: 3, name: "Sprint 3", startDate: "01-01-2025", endDate: "15-01-2025", status: "Planned" },
  { id: 4, name: "Sprint 4", startDate: "16-01-2025", endDate: "31-01-2025", status: "Planned" },
];

// Mock tasks data with sprint assignment
const tasksData = [
  { id: 1, name: "Login UI Design", project: "Universal Software", sprint: "Sprint 2", category: "Designing", hours: 8, assignee: "Priya Patel", status: "In Progress" },
  { id: 2, name: "API Integration", project: "Universal Software", sprint: "Sprint 2", category: "Development", hours: 16, assignee: "Amit Kumar", status: "To Do" },
  { id: 3, name: "Database Schema", project: "Super App", sprint: "Sprint 2", category: "Development", hours: 12, assignee: "Rahul Sharma", status: "Completed" },
  { id: 4, name: "User Authentication", project: "Go Live", sprint: "Sprint 1", category: "Development", hours: 20, assignee: "Vikram Singh", status: "Completed" },
  { id: 5, name: "Unit Testing", project: "Universal Software", sprint: "Sprint 3", category: "Testing", hours: 10, assignee: "Sneha Gupta", status: "To Do" },
  { id: 6, name: "Code Review", project: "Super App", sprint: "Sprint 2", category: "Code Review", hours: 6, assignee: "Neha Verma", status: "In Progress" },
];

const Tasks = () => {
  // Task form state
  const [taskProject, setTaskProject] = useState<string>("");
  const [taskSprint, setTaskSprint] = useState<string>("");
  const [taskName, setTaskName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [taskCategory, setTaskCategory] = useState<string>("");
  const [filterSprint, setFilterSprint] = useState<string>("all");

  const handleEmployeeToggle = (employeeId: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskProject) {
      toast.error("Please select a project");
      return;
    }
    if (!taskSprint) {
      toast.error("Please select a sprint");
      return;
    }
    if (!taskName.trim()) {
      toast.error("Please enter task name");
      return;
    }
    if (!estimatedHours || parseFloat(estimatedHours) <= 0) {
      toast.error("Please enter valid estimated hours");
      return;
    }
    if (selectedEmployees.length === 0) {
      toast.error("Please assign at least one employee");
      return;
    }
    if (!taskCategory) {
      toast.error("Please select a task category");
      return;
    }

    const assignedNames = employeesData
      .filter((emp) => selectedEmployees.includes(emp.id))
      .map((emp) => emp.name)
      .join(", ");

    toast.success(`Task "${taskName}" created in ${taskSprint}! Assigned to: ${assignedNames}`);
    
    // Reset form
    setTaskProject("");
    setTaskSprint("");
    setTaskName("");
    setEstimatedHours("");
    setSelectedEmployees([]);
    setTaskCategory("");
  };

  const filteredTasks =
    filterSprint === "all"
      ? tasksData
      : tasksData.filter((t) => t.sprint === filterSprint);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500/20 text-green-700 text-xs">{status}</Badge>;
      case "In Progress":
        return <Badge className="bg-blue-500/20 text-blue-700 text-xs">{status}</Badge>;
      case "To Do":
        return <Badge className="bg-gray-500/20 text-gray-700 text-xs">{status}</Badge>;
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

  const getSprintStatusBadge = (status: string) => {
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

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage tasks and sprint assignments
          </p>
        </div>

        {/* Create Task Form */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Plus className="h-4 w-4" />
              Create New Task
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {/* Project Selection */}
                <div className="space-y-1">
                  <Label htmlFor="task-project" className="text-xs">Project *</Label>
                  <Select value={taskProject} onValueChange={setTaskProject}>
                    <SelectTrigger id="task-project" className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {projectsData.map((project) => (
                        <SelectItem key={project.id} value={project.project}>
                          {project.project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sprint Selection */}
                <div className="space-y-1">
                  <Label htmlFor="task-sprint" className="text-xs">Sprint *</Label>
                  <Select value={taskSprint} onValueChange={setTaskSprint}>
                    <SelectTrigger id="task-sprint" className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {sprintsData.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.name}>
                          {sprint.name} ({sprint.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Task Name */}
                <div className="space-y-1">
                  <Label htmlFor="task-name" className="text-xs">Task Name *</Label>
                  <Input
                    id="task-name"
                    placeholder="Enter task name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Estimated Hours */}
                <div className="space-y-1">
                  <Label htmlFor="estimated-hours" className="text-xs">Est. Hours *</Label>
                  <Input
                    id="estimated-hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="Hours"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Task Category */}
                <div className="space-y-1">
                  <Label htmlFor="task-category" className="text-xs">Category *</Label>
                  <Select value={taskCategory} onValueChange={setTaskCategory}>
                    <SelectTrigger id="task-category" className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {taskCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Employee Assignment */}
              <div className="space-y-2">
                <Label className="text-xs">Assign Employees *</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 p-3 border rounded-md bg-muted/30">
                  {employeesData.map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-1.5">
                      <Checkbox
                        id={`employee-${employee.id}`}
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => handleEmployeeToggle(employee.id)}
                        className="h-3.5 w-3.5"
                      />
                      <label
                        htmlFor={`employee-${employee.id}`}
                        className="text-xs font-medium leading-none cursor-pointer"
                      >
                        {employee.name}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedEmployees.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedEmployees.length} employee(s) selected
                  </p>
                )}
              </div>

              <Button type="submit" size="sm" className="gap-1.5 h-8 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Create Task
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Task List by Sprint */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <ListTodo className="h-4 w-4" />
                Tasks by Sprint
              </CardTitle>
              <Select value={filterSprint} onValueChange={setFilterSprint}>
                <SelectTrigger className="h-8 text-xs w-40 bg-background">
                  <SelectValue placeholder="Filter by sprint" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Sprints</SelectItem>
                  {sprintsData.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.name}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-2">Task Name</TableHead>
                    <TableHead className="text-xs py-2">Project</TableHead>
                    <TableHead className="text-xs py-2">Sprint</TableHead>
                    <TableHead className="text-xs py-2">Category</TableHead>
                    <TableHead className="text-xs py-2 text-center">Hours</TableHead>
                    <TableHead className="text-xs py-2">Assignee</TableHead>
                    <TableHead className="text-xs py-2">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="text-sm py-2 font-medium">{task.name}</TableCell>
                      <TableCell className="text-sm py-2">{task.project}</TableCell>
                      <TableCell className="text-sm py-2">{task.sprint}</TableCell>
                      <TableCell className="text-sm py-2">{task.category}</TableCell>
                      <TableCell className="text-sm py-2 text-center">{task.hours}</TableCell>
                      <TableCell className="text-sm py-2">{task.assignee}</TableCell>
                      <TableCell className="text-sm py-2">{getStatusBadge(task.status)}</TableCell>
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

export default Tasks;
