import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Download, FileBarChart, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const projectHoursData = [
  { name: "E-Commerce", hours: 342, percentage: 28 },
  { name: "Banking App", hours: 256, percentage: 21 },
  { name: "CRM System", hours: 189, percentage: 15 },
  { name: "Analytics", hours: 298, percentage: 24 },
  { name: "Inventory", hours: 145, percentage: 12 },
];

const employeeProductivityData = [
  { name: "John Doe", productivity: 92, attendance: 98, projects: 3 },
  { name: "Sarah Smith", productivity: 88, attendance: 95, projects: 4 },
  { name: "Mike Johnson", productivity: 85, attendance: 92, projects: 2 },
  { name: "Emily Brown", productivity: 90, attendance: 97, projects: 3 },
  { name: "David Lee", productivity: 87, attendance: 94, projects: 2 },
];

const categoryData = [
  { name: "Development", value: 65, color: "hsl(var(--primary))" },
  { name: "QA", value: 20, color: "hsl(var(--accent))" },
  { name: "Meeting", value: 15, color: "hsl(var(--success))" },
];

const Reports = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const attendanceData = [
    {
      id: 1,
      name: "John Doe",
      employeeId: "EMP001",
      inTime: "09:05 AM",
      breakIn: "12:30 PM",
      breakOut: "01:15 PM",
      outTime: "06:10 PM",
      totalHours: "8.3",
      status: "Present",
    },
    {
      id: 2,
      name: "Sarah Smith",
      employeeId: "EMP002",
      inTime: "08:55 AM",
      breakIn: "12:00 PM",
      breakOut: "01:00 PM",
      outTime: "06:05 PM",
      totalHours: "8.2",
      status: "Present",
    },
    {
      id: 3,
      name: "Mike Johnson",
      employeeId: "EMP003",
      inTime: "09:15 AM",
      breakIn: "01:00 PM",
      breakOut: "01:45 PM",
      outTime: "06:20 PM",
      totalHours: "8.3",
      status: "Present",
    },
    {
      id: 4,
      name: "Emily Brown",
      employeeId: "EMP004",
      inTime: "09:00 AM",
      breakIn: "12:45 PM",
      breakOut: "01:30 PM",
      outTime: "06:00 PM",
      totalHours: "8.3",
      status: "Present",
    },
    {
      id: 5,
      name: "David Lee",
      employeeId: "EMP005",
      inTime: "-",
      breakIn: "-",
      breakOut: "-",
      outTime: "-",
      totalHours: "0",
      status: "Absent",
    },
    {
      id: 6,
      name: "Lisa Wang",
      employeeId: "EMP006",
      inTime: "09:10 AM",
      breakIn: "12:15 PM",
      breakOut: "01:00 PM",
      outTime: "In Progress",
      totalHours: "4.5",
      status: "In Progress",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <Badge className="bg-success text-success-foreground">Present</Badge>;
      case "Absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "In Progress":
        return <Badge className="bg-info text-info-foreground">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  const handleExport = () => {
    toast.success("Exporting report to Excel...");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive analytics and insights
            </p>
          </div>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="projects">Project-wise Reports</TabsTrigger>
            <TabsTrigger value="employees">Employee-wise Reports</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Report</TabsTrigger>
          </TabsList>

          {/* Project-wise Reports */}
          <TabsContent value="projects" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        <SelectItem value="ecommerce">E-Commerce Platform</SelectItem>
                        <SelectItem value="banking">Mobile Banking App</SelectItem>
                        <SelectItem value="crm">CRM System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Select defaultValue="month">
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Manager</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Managers</SelectItem>
                        <SelectItem value="sarah">Sarah Smith</SelectItem>
                        <SelectItem value="john">John Doe</SelectItem>
                        <SelectItem value="emily">Emily Brown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hours Breakdown by Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectHoursData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Work Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-3xl font-bold text-foreground mt-2">1,230h</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-3xl font-bold text-foreground mt-2">32</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-success mt-2">16</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Avg Hours/Project</p>
                  <p className="text-3xl font-bold text-accent mt-2">38.4h</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Report */}
          <TabsContent value="attendance" className="space-y-6">
            {/* Date Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4">
                  <div className="flex-1 max-w-xs space-y-2">
                    <Label htmlFor="attendance-date">Date</Label>
                    <Input
                      id="attendance-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    Apply Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-3xl font-bold text-foreground mt-2">156</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-3xl font-bold text-success mt-2">148</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-3xl font-bold text-destructive mt-2">8</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="text-3xl font-bold text-accent mt-2">94.9%</p>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daily Attendance Report</CardTitle>
                  <Button onClick={handleExport} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>In Time</TableHead>
                      <TableHead>Break In</TableHead>
                      <TableHead>Break Out</TableHead>
                      <TableHead>Out Time</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeId}</TableCell>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.inTime}</TableCell>
                        <TableCell>{record.breakIn}</TableCell>
                        <TableCell>{record.breakOut}</TableCell>
                        <TableCell>{record.outTime}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.totalHours}h</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employee-wise Reports */}
          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Employee Productivity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employeeProductivityData.map((employee, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">{employee.name}</h4>
                        <div className="flex gap-2">
                          <span className="text-sm text-muted-foreground">
                            {employee.projects} projects
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Productivity Score</span>
                            <span className="text-sm font-semibold">{employee.productivity}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent transition-all"
                              style={{ width: `${employee.productivity}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Attendance</span>
                            <span className="text-sm font-semibold">{employee.attendance}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success transition-all"
                              style={{ width: `${employee.attendance}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Employee Stats */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Average Productivity</p>
                  <p className="text-3xl font-bold text-foreground mt-2">88.4%</p>
                  <p className="text-sm text-success mt-1">↑ +5% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Average Attendance</p>
                  <p className="text-3xl font-bold text-foreground mt-2">95.2%</p>
                  <p className="text-sm text-success mt-1">↑ +2% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Contributions</p>
                  <p className="text-3xl font-bold text-foreground mt-2">14</p>
                  <p className="text-sm text-muted-foreground mt-1">Active projects</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
