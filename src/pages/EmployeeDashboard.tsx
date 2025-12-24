import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Clock, LogOut, LogIn, Target, FileText, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const EmployeeDashboard = () => {
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const TARGET_HOURS = 9;

  const employees = [
    { id: "all", name: "All Employees" },
    { id: "emp001", name: "Rahul Sharma" },
    { id: "emp002", name: "Priya Patel" },
    { id: "emp003", name: "Amit Kumar" },
    { id: "emp004", name: "Sneha Gupta" },
  ];

  const attendanceData = {
    inTime: "09:05 AM",
    outTime: "06:10 PM",
    totalHours: 8.3,
    breakDuration: 1.25,
    productiveHours: 7.55,
  };

  const monthlyData = {
    workingDays: 22,
    expectedHours: 22 * 9, // 198
    actualHours: 185.5,
    difference: 185.5 - (22 * 9), // -12.5
  };

  // Spent hours calculation
  const spentPercentage = Math.min((attendanceData.productiveHours / TARGET_HOURS) * 100, 100);
  const extraHours = Math.max(attendanceData.productiveHours - TARGET_HOURS, 0);
  const remainingHours = Math.max(TARGET_HOURS - attendanceData.productiveHours, 0);

  const getProgressColor = () => {
    if (attendanceData.productiveHours >= TARGET_HOURS) return "bg-blue-500";
    if (attendanceData.productiveHours >= TARGET_HOURS * 0.8) return "bg-success";
    return "bg-destructive";
  };

  const getStatusBadge = () => {
    if (extraHours > 0) {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Extra Hours</Badge>;
    }
    if (attendanceData.productiveHours >= TARGET_HOURS * 0.8) {
      return <Badge className="bg-success/10 text-success border-success/20">On Track</Badge>;
    }
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Under Target</Badge>;
  };

  const spentHoursData = [
    { id: 1, date: "2024-01-15", project: "E-Commerce Platform", task: "Frontend Development", description: "Implemented payment gateway integration", hours: 3.5, category: "Development" },
    { id: 2, date: "2024-01-15", project: "Mobile App", task: "Bug Fixes", description: "Sprint planning and requirements gathering", hours: 2.0, category: "Meeting" },
    { id: 3, date: "2024-01-14", project: "Admin Dashboard", task: "Code Review", description: "Testing user authentication module", hours: 1.5, category: "Code Review" },
    { id: 4, date: "2024-01-14", project: "E-Commerce Platform", task: "Testing", description: "Bug fixes and code review", hours: 0.55, category: "Testing" },
  ];

  const totalSpentHours = spentHoursData.reduce((sum, item) => sum + item.hours, 0);

  const projects = [
    "E-Commerce Platform",
    "Mobile App",
    "Admin Dashboard",
    "CRM System",
    "API Development",
  ];

  const categories = [
    "Testing",
    "Designing",
    "Development",
    "Analysis",
    "Documentation",
    "Code Review",
    "Bug Fixing",
    "Deployment",
  ];

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
    
    if (!project || !task || !category || !description || !hours) {
      toast.error("Please fill all required fields");
      return;
    }

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      toast.error("Please enter valid hours");
      return;
    }

    if (hoursNum > 9) {
      toast.error("Maximum 9 hours allowed per day");
      return;
    }

    toast.success("Work log submitted successfully!");
    setProject("");
    setTask("");
    setCategory("");
    setDescription("");
    setHours("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here's your daily overview
          </p>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[180px] h-8 text-sm bg-background">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-[160px] h-8 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Daily Summary & Spent Hours Tracker */}
        <Card>
          <CardContent className="py-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Daily Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Daily Summary</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="text-center px-4 py-2 bg-primary rounded-full">
                    <p className="text-[9px] text-primary-foreground/80 uppercase tracking-wide">Total Hours</p>
                    <p className="text-lg font-bold text-primary-foreground">{attendanceData.totalHours}h</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <p className="text-[9px] text-amber-700 dark:text-amber-400 uppercase tracking-wide">Break</p>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{attendanceData.breakDuration}h</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                    <p className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Productive</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{attendanceData.productiveHours}h</p>
                  </div>
                  <div className={`text-center px-4 py-2 rounded-full ${monthlyData.difference >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Monthly Diff</p>
                    <p className={`text-lg font-bold ${monthlyData.difference >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {monthlyData.difference >= 0 ? '+' : ''}{monthlyData.difference}h
                    </p>
                  </div>
                </div>
              </div>

              {/* Spent Hours Tracker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Spent Hours Tracker</span>
                  </div>
                  {getStatusBadge()}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium ml-auto">{attendanceData.productiveHours}h / {TARGET_HOURS}h</span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all ${getProgressColor()}`}
                      style={{ width: `${spentPercentage}%` }}
                    />
                  </div>
                  {remainingHours > 0 && (
                    <div className="inline-block px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 rounded-md border border-teal-200 dark:border-teal-800">
                      <p className="text-[10px] text-muted-foreground">Remaining</p>
                      <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{remainingHours.toFixed(2)}h</p>
                    </div>
                  )}
                  {extraHours > 0 && (
                    <div className="inline-block px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-[10px] text-muted-foreground">Extra</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">+{extraHours.toFixed(2)}h</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-In / Check-Out Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* First Check-In */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <LogIn className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs text-muted-foreground">First Check-In</h4>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] border-0">
                      On Time
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-foreground">{attendanceData.inTime}</p>
                  <p className="text-xs text-muted-foreground">Biometric ID: EMP001 verified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Check-Out */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <LogOut className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs text-muted-foreground">Final Check-Out</h4>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] border-0">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-foreground">{attendanceData.outTime}</p>
                  <p className="text-xs text-muted-foreground">Biometric ID: EMP001 verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Break Sessions Card */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-amber-500" />
              Break Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-medium">Break #</TableHead>
                  <TableHead className="text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <span className="text-amber-500">॥</span> Break-In
                    </span>
                  </TableHead>
                  <TableHead className="text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <span className="text-muted-foreground">▷</span> Break-Out
                    </span>
                  </TableHead>
                  <TableHead className="text-xs font-medium">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="py-3 text-sm text-primary font-medium">1</TableCell>
                  <TableCell className="py-3 text-sm text-primary">10:30 AM</TableCell>
                  <TableCell className="py-3 text-sm text-teal-600 dark:text-teal-400">10:45 AM</TableCell>
                  <TableCell className="py-3 text-sm">0.25h</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-sm text-primary font-medium">2</TableCell>
                  <TableCell className="py-3 text-sm text-primary">12:30 PM</TableCell>
                  <TableCell className="py-3 text-sm text-teal-600 dark:text-teal-400">01:15 PM</TableCell>
                  <TableCell className="py-3 text-sm">0.75h</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-3 text-sm text-primary font-medium">3</TableCell>
                  <TableCell className="py-3 text-sm text-primary">04:00 PM</TableCell>
                  <TableCell className="py-3 text-sm text-teal-600 dark:text-teal-400">04:15 PM</TableCell>
                  <TableCell className="py-3 text-sm">0.25h</TableCell>
                </TableRow>
                <TableRow className="border-t-2">
                  <TableCell className="py-3 text-sm font-semibold" colSpan={3}>Total Break Duration</TableCell>
                  <TableCell className="py-3 text-sm font-bold text-amber-600 dark:text-amber-400">{attendanceData.breakDuration}h</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Log Work Hours Card - Compact */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              Log Work Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <div className="space-y-1">
                  <Label htmlFor="project" className="text-xs">Project *</Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger id="project" className="h-9 bg-background">
                      <SelectValue placeholder="Choose project" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {projects.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="task" className="text-xs">Task *</Label>
                  <Select value={task} onValueChange={setTask}>
                    <SelectTrigger id="task" className="h-9 bg-background">
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
                    <SelectTrigger id="category" className="h-9 bg-background">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hours" className="text-xs">Hours * (max 9)</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="9"
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

        {/* Spent Hours Section */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                Spent Hours - Work Log
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                Total: {totalSpentHours}h
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">Date</TableHead>
                  <TableHead className="text-sm">Project</TableHead>
                  <TableHead className="text-sm">Task</TableHead>
                  <TableHead className="text-sm">Description</TableHead>
                  <TableHead className="text-sm">Category</TableHead>
                  <TableHead className="text-sm text-right">Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spentHoursData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="py-2 text-sm text-muted-foreground">{formatDate(item.date)}</TableCell>
                    <TableCell className="py-2 text-sm font-medium">{item.project}</TableCell>
                    <TableCell className="py-2 text-sm">{item.task}</TableCell>
                    <TableCell className="py-2 text-sm text-muted-foreground">{item.description}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className="text-xs font-normal">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-sm text-right font-medium">{item.hours}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Summary Bar */}
            <div className="mt-3 p-2 bg-muted/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Today:</span>
                <span className="text-xs font-medium">{formatDate(new Date().toISOString().split('T')[0])}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Logged:</span>
                <Badge variant="secondary" className="text-xs">{totalSpentHours}h</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
