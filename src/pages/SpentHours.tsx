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
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Clock, Filter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const workLogs = [
  {
    id: 1,
    date: "2024-01-15",
    project: "E-Commerce Platform",
    task: "Payment Integration",
    description: "Implemented payment gateway integration",
    hours: 6,
    category: "Development",
  },
  {
    id: 2,
    date: "2024-01-15",
    project: "Mobile Banking App",
    task: "Sprint Planning",
    description: "Sprint planning and requirements gathering",
    hours: 2,
    category: "Meeting",
  },
  {
    id: 3,
    date: "2024-01-14",
    project: "CRM System",
    task: "Auth Testing",
    description: "Testing user authentication module",
    hours: 4,
    category: "QA",
  },
  {
    id: 4,
    date: "2024-01-14",
    project: "E-Commerce Platform",
    task: "Bug Fixes",
    description: "Bug fixes and code review",
    hours: 5,
    category: "Development",
  },
  {
    id: 5,
    date: "2024-01-13",
    project: "Analytics Dashboard",
    task: "Client Demo",
    description: "Client demo and feedback session",
    hours: 3,
    category: "Meeting",
  },
];

const SpentHours = () => {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [category, setCategory] = useState("");
  
  // Filter states
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [filterTask, setFilterTask] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);

  const maxHoursPerDay = 9;

  const tasks = [
    "Frontend Development",
    "Backend Development",
    "API Integration",
    "Bug Fixes",
    "Code Review",
    "Testing",
    "Documentation",
    "UI/UX Design",
    "Database Design",
    "Deployment",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Number(hours) > maxHoursPerDay) {
      toast.error(`Cannot log more than ${maxHoursPerDay} hours per day`);
      return;
    }

    if (!selectedProject || !selectedTask || !description || !hours || !category) {
      toast.error("Please fill in all fields");
      return;
    }

    toast.success("Work log submitted successfully");
    // Reset form
    setSelectedProject("");
    setSelectedTask("");
    setDescription("");
    setHours("");
    setCategory("");
  };

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case "Development":
        return "default";
      case "QA":
        return "secondary";
      case "Meeting":
        return "outline";
      default:
        return "default";
    }
  };

  const filteredLogs = workLogs.filter((log) => {
    const matchesEmployee = filterEmployee === "all" || log.id <= 5; // Simplified for demo
    const matchesProject = filterProject === "all" || log.project === filterProject;
    const matchesTask = filterTask === "all" || log.task === filterTask;
    return matchesEmployee && matchesProject && matchesTask;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(filteredLogs.map((log) => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const handleSelectLog = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedLogs([...selectedLogs, id]);
    } else {
      setSelectedLogs(selectedLogs.filter((logId) => logId !== id));
    }
  };

  const handleExport = () => {
    if (selectedLogs.length > 0) {
      toast.success(`Exporting ${selectedLogs.length} selected log(s) to Excel...`);
    } else {
      toast.success("Exporting work logs to Excel...");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Spent Hours</h1>
            <p className="text-sm text-muted-foreground">
              Log and track time spent on projects
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Log Work Hours Form - Compact */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              Log Work Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-1">
                  <Label htmlFor="project" className="text-xs">Project *</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger id="project" className="h-9">
                      <SelectValue placeholder="Choose project" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="ecommerce">E-Commerce Platform</SelectItem>
                      <SelectItem value="banking">Mobile Banking App</SelectItem>
                      <SelectItem value="crm">CRM System</SelectItem>
                      <SelectItem value="analytics">Analytics Dashboard</SelectItem>
                      <SelectItem value="inventory">Inventory Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="task" className="text-xs">Task *</Label>
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger id="task" className="h-9">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {tasks.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="category" className="text-xs">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="h-9">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="QA">QA</SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
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
                  />
                </div>
                <Button type="submit" size="sm" className="bg-primary">
                  Submit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Filters - Inline */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4 text-primary" />
              Filter Work Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
              <div className="space-y-1">
                <Label className="text-xs">Employee</Label>
                <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="john-doe">John Doe</SelectItem>
                    <SelectItem value="sarah-smith">Sarah Smith</SelectItem>
                    <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Project</Label>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="E-Commerce Platform">E-Commerce Platform</SelectItem>
                    <SelectItem value="Mobile Banking App">Mobile Banking App</SelectItem>
                    <SelectItem value="CRM System">CRM System</SelectItem>
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
                      <SelectItem key={t} value={t}>{t}</SelectItem>
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

        {/* Work Log Table - Compact */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Work Log History</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {filteredLogs.length} Records
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-sm">Date</TableHead>
                  <TableHead className="text-sm">Project</TableHead>
                  <TableHead className="text-sm">Task</TableHead>
                  <TableHead className="text-sm">Description</TableHead>
                  <TableHead className="text-sm">Category</TableHead>
                  <TableHead className="text-sm text-right">Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="py-2">
                      <Checkbox
                        checked={selectedLogs.includes(log.id)}
                        onCheckedChange={(checked) => handleSelectLog(log.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="py-2 text-sm">{formatDate(log.date)}</TableCell>
                    <TableCell className="py-2 text-sm font-medium">{log.project}</TableCell>
                    <TableCell className="py-2 text-sm">{log.task}</TableCell>
                    <TableCell className="py-2 text-sm text-muted-foreground max-w-[200px] truncate">{log.description}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant={getCategoryVariant(log.category)} className="text-xs">
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-sm text-right font-medium">{log.hours}h</TableCell>
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

export default SpentHours;
