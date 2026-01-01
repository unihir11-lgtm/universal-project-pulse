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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, LogOut, LogIn, Target, FileText, Calendar, Filter, Activity, ClipboardList, UserCheck, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const EmployeeDashboard = () => {
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [activityType, setActivityType] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [activityLogDate, setActivityLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceLogDate, setAttendanceLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkinLogDate, setCheckinLogDate] = useState(new Date().toISOString().split('T')[0]);
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

  // Activity Log Data (Time Entry History) - 10 entries
  const activityLogData = [
    { id: 1, date: "20-12-2024", employee: "Rahul Sharma", project: "E-Commerce Platform", task: "Payment Integration", activity: "Development", description: "Implemented payment gat...", status: "approved", hours: "6h" },
    { id: 2, date: "20-12-2024", employee: "Priya Patel", project: "E-Commerce Platform", task: "Stripe Setup", activity: "Development", description: "Configured Stripe webhooks", status: "pending", hours: "4h" },
    { id: 3, date: "19-12-2024", employee: "Rahul Sharma", project: "Mobile Banking App", task: "User Authentication", activity: "Development", description: "Built authentication flow", status: "approved", hours: "8h" },
    { id: 4, date: "19-12-2024", employee: "Amit Kumar", project: "Mobile Banking App", task: "-", activity: "Meeting", description: "Sprint planning with client", status: "approved", hours: "2h" },
    { id: 5, date: "18-12-2024", employee: "Priya Patel", project: "CRM System", task: "Contact Management", activity: "Design", description: "Designed contact manage...", status: "approved", hours: "5h" },
    { id: 6, date: "18-12-2024", employee: "Sneha Gupta", project: "E-Commerce Platform", task: "Shopping Cart", activity: "Development", description: "Shopping cart state manag...", status: "pending", hours: "7h" },
    { id: 7, date: "17-12-2024", employee: "Amit Kumar", project: "Internal Tools", task: "Build Pipeline", activity: "Admin", description: "CI/CD pipeline optimization", status: "approved", hours: "3h" },
    { id: 8, date: "17-12-2024", employee: "Rahul Sharma", project: "CRM System", task: "-", activity: "Meeting", description: "Requirements gathering se...", status: "approved", hours: "1.5h" },
    { id: 9, date: "16-12-2024", employee: "Priya Patel", project: "E-Commerce Platform", task: "Product Catalog", activity: "Development", description: "Product catalog search feat...", status: "approved", hours: "6h" },
    { id: 10, date: "16-12-2024", employee: "Sneha Gupta", project: "Mobile Banking App", task: "Transaction History", activity: "Development", description: "Transaction history API inte...", status: "pending", hours: "4.5h" },
  ];

  // Attendance Log Data (Daily Attendance Report) - 10 entries
  const attendanceLogData = [
    { id: 1, date: "2024-12-24", checkIn: "09:05 AM", checkOut: "06:10 PM", totalHours: 8.3, breakHours: 1.25, productiveHours: 7.55, status: "Present" },
    { id: 2, date: "2024-12-23", checkIn: "09:00 AM", checkOut: "06:00 PM", totalHours: 8.0, breakHours: 1.0, productiveHours: 7.0, status: "Present" },
    { id: 3, date: "2024-12-22", checkIn: "09:15 AM", checkOut: "05:45 PM", totalHours: 7.5, breakHours: 0.75, productiveHours: 6.75, status: "Present" },
    { id: 4, date: "2024-12-21", checkIn: "08:50 AM", checkOut: "06:30 PM", totalHours: 8.67, breakHours: 1.5, productiveHours: 7.17, status: "Present" },
    { id: 5, date: "2024-12-20", checkIn: "09:30 AM", checkOut: "06:00 PM", totalHours: 7.5, breakHours: 1.0, productiveHours: 6.5, status: "Late" },
    { id: 6, date: "2024-12-19", checkIn: "-", checkOut: "-", totalHours: 0, breakHours: 0, productiveHours: 0, status: "Absent" },
    { id: 7, date: "2024-12-18", checkIn: "09:00 AM", checkOut: "06:15 PM", totalHours: 8.25, breakHours: 1.25, productiveHours: 7.0, status: "Present" },
    { id: 8, date: "2024-12-17", checkIn: "08:45 AM", checkOut: "05:30 PM", totalHours: 7.75, breakHours: 1.0, productiveHours: 6.75, status: "Present" },
    { id: 9, date: "2024-12-16", checkIn: "-", checkOut: "-", totalHours: 0, breakHours: 0, productiveHours: 0, status: "Leave" },
    { id: 10, date: "2024-12-15", checkIn: "09:10 AM", checkOut: "06:20 PM", totalHours: 8.17, breakHours: 1.0, productiveHours: 7.17, status: "Present" },
  ];

  // Employee Checkin Data - 10 entries
  const employeeCheckinData = [
    { id: 1, empId: "EMP001", name: "Rahul Sharma", department: "Engineering", checkIn: "09:05 AM", checkOut: "06:10 PM", device: "Biometric", location: "Main Office" },
    { id: 2, empId: "EMP002", name: "Priya Patel", department: "Design", checkIn: "09:15 AM", checkOut: "06:00 PM", device: "Mobile App", location: "Remote" },
    { id: 3, empId: "EMP003", name: "Amit Kumar", department: "Engineering", checkIn: "08:50 AM", checkOut: "05:45 PM", device: "Biometric", location: "Main Office" },
    { id: 4, empId: "EMP004", name: "Sneha Gupta", department: "HR", checkIn: "09:00 AM", checkOut: "06:30 PM", device: "Biometric", location: "Main Office" },
    { id: 5, empId: "EMP005", name: "Vikram Singh", department: "Engineering", checkIn: "09:30 AM", checkOut: "06:15 PM", device: "Mobile App", location: "Remote" },
    { id: 6, empId: "EMP006", name: "Neha Sharma", department: "Marketing", checkIn: "09:10 AM", checkOut: "05:50 PM", device: "Biometric", location: "Main Office" },
    { id: 7, empId: "EMP007", name: "Rajesh Verma", department: "Finance", checkIn: "08:45 AM", checkOut: "06:00 PM", device: "Biometric", location: "Main Office" },
    { id: 8, empId: "EMP008", name: "Anjali Mishra", department: "Engineering", checkIn: "09:20 AM", checkOut: "06:20 PM", device: "Mobile App", location: "Remote" },
    { id: 9, empId: "EMP009", name: "Karan Joshi", department: "Design", checkIn: "09:00 AM", checkOut: "05:30 PM", device: "Biometric", location: "Main Office" },
    { id: 10, empId: "EMP010", name: "Pooja Reddy", department: "Engineering", checkIn: "08:55 AM", checkOut: "06:05 PM", device: "Biometric", location: "Main Office" },
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
    
    if (!logDate || !project || !activityType || !description || !hours) {
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
    setLogDate(new Date().toISOString().split('T')[0]);
    setProject("");
    setTask("");
    setActivityType("");
    setDescription("");
    setHours("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Employee Dashboard</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Welcome back! Here's your daily overview
          </p>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="py-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-full sm:w-[180px] h-8 text-sm bg-background">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
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
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estimated Check Out */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <LogOut className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs text-muted-foreground">Estimated Check Out</h4>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] border-0">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-foreground">{attendanceData.outTime}</p>
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
          <CardContent className="pt-0 overflow-x-auto">
            <Table className="min-w-[400px]">
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
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
                {/* Date */}
                <div className="space-y-1">
                  <Label htmlFor="log-date" className="text-xs">Date *</Label>
                  <Input
                    id="log-date"
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="h-9 bg-background"
                  />
                </div>

                {/* Project */}
                <div className="space-y-1">
                  <Label htmlFor="project" className="text-xs">Project *</Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger id="project" className="h-9 bg-background">
                      <SelectValue placeholder="Choose project" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {projects.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Task/Subtask */}
                <div className="space-y-1">
                  <Label htmlFor="task" className="text-xs">Task/Subtask</Label>
                  <Select value={task} onValueChange={setTask}>
                    <SelectTrigger id="task" className="h-9 bg-background">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {tasks.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Activity Type */}
                <div className="space-y-1">
                  <Label htmlFor="activity-type" className="text-xs">Activity Type *</Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger id="activity-type" className="h-9 bg-background">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hours */}
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

              {/* Description Row */}
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

        {/* Activity Logs Tabs */}
        <Card>
          <CardContent className="pt-4">
            <Tabs defaultValue="activity-log" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 h-auto">
                <TabsTrigger value="activity-log" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs px-1 sm:px-3 py-2">
                  <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Activity Log</span>
                  <span className="sm:hidden">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="attendance-log" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs px-1 sm:px-3 py-2">
                  <ClipboardList className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Attendance Log</span>
                  <span className="sm:hidden">Attendance</span>
                </TabsTrigger>
                <TabsTrigger value="employee-checkin" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs px-1 sm:px-3 py-2">
                  <UserCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Employee Checkin</span>
                  <span className="sm:hidden">Checkin</span>
                </TabsTrigger>
              </TabsList>

              {/* Activity Log Tab - Time Entry History */}
              <TabsContent value="activity-log">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Time Entry History</h3>
                    <Input
                      type="date"
                      value={activityLogDate}
                      onChange={(e) => setActivityLogDate(e.target.value)}
                      className="w-full sm:w-[140px] h-7 text-xs"
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs w-fit">10 Records</Badge>
                </div>
                <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10 text-xs"><Checkbox /></TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Employee</TableHead>
                      <TableHead className="text-xs">Project</TableHead>
                      <TableHead className="text-xs">Task</TableHead>
                      <TableHead className="text-xs">Activity</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Hours</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="py-2"><Checkbox /></TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">{item.date}</TableCell>
                        <TableCell className="py-2 text-xs font-medium">{item.employee}</TableCell>
                        <TableCell className="py-2 text-xs text-primary">{item.project}</TableCell>
                        <TableCell className="py-2 text-xs">{item.task}</TableCell>
                        <TableCell className="py-2">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${
                              item.activity === 'Development' ? 'bg-primary/10 text-primary border-primary/20' :
                              item.activity === 'Meeting' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400' :
                              item.activity === 'Design' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400' :
                              item.activity === 'Admin' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400' :
                              'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}
                          >
                            {item.activity}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground max-w-[180px] truncate">{item.description}</TableCell>
                        <TableCell className="py-2">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${
                              item.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              item.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-xs font-medium">{item.hours}</TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </TabsContent>

              {/* Attendance Log Tab - Daily Attendance Report */}
              <TabsContent value="attendance-log">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Daily Attendance Report</h3>
                    <Input
                      type="date"
                      value={attendanceLogDate}
                      onChange={(e) => setAttendanceLogDate(e.target.value)}
                      className="w-full sm:w-[140px] h-7 text-xs"
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs w-fit">10 Records</Badge>
                </div>
                <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Check-In</TableHead>
                      <TableHead className="text-xs">Check-Out</TableHead>
                      <TableHead className="text-xs">Total Hrs</TableHead>
                      <TableHead className="text-xs">Break</TableHead>
                      <TableHead className="text-xs">Productive</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceLogData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="py-2 text-xs text-muted-foreground">{formatDate(item.date)}</TableCell>
                        <TableCell className="py-2 text-xs text-primary">{item.checkIn}</TableCell>
                        <TableCell className="py-2 text-xs text-teal-600 dark:text-teal-400">{item.checkOut}</TableCell>
                        <TableCell className="py-2 text-xs font-medium">{item.totalHours}h</TableCell>
                        <TableCell className="py-2 text-xs text-amber-600">{item.breakHours}h</TableCell>
                        <TableCell className="py-2 text-xs text-emerald-600 font-medium">{item.productiveHours}h</TableCell>
                        <TableCell className="py-2">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${
                              item.status === 'Present' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              item.status === 'Late' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' :
                              item.status === 'Leave' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-xs text-muted-foreground">—</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </TabsContent>

              <TabsContent value="employee-checkin">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Employee Check-in Records</h3>
                    <Input
                      type="date"
                      value={checkinLogDate}
                      onChange={(e) => setCheckinLogDate(e.target.value)}
                      className="w-full sm:w-[140px] h-7 text-xs"
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs w-fit">10 Records</Badge>
                </div>
                <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">Emp ID</TableHead>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Department</TableHead>
                      <TableHead className="text-xs">Check-In</TableHead>
                      <TableHead className="text-xs">Check-Out</TableHead>
                      <TableHead className="text-xs">Device</TableHead>
                      <TableHead className="text-xs">Location</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeCheckinData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="py-2 text-xs text-primary font-medium">{item.empId}</TableCell>
                        <TableCell className="py-2 text-xs font-medium">{item.name}</TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">{item.department}</TableCell>
                        <TableCell className="py-2 text-xs text-primary">{item.checkIn}</TableCell>
                        <TableCell className="py-2 text-xs text-teal-600 dark:text-teal-400">{item.checkOut}</TableCell>
                        <TableCell className="py-2">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${
                              item.device === 'Biometric' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400' :
                              'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}
                          >
                            {item.device}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${
                              item.location === 'Main Office' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}
                          >
                            {item.location}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-xs text-muted-foreground">—</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
