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
import { Download, FileBarChart, TrendingUp, Calendar, DollarSign, Clock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { ACTIVITY_TYPE_LABELS, ActivityType, CURRENCY_SYMBOLS } from "@/types/project";

type Project = Tables<"projects">;
type Profile = Tables<"profiles">;

// Mock billing data for demo
interface BillingSummaryEntry {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  activityType: ActivityType;
  totalHours: number;
  billableHours: number;
  billRate: number;
  costRate: number;
  billableAmount: number;
  costAmount: number;
  margin: number;
  marginPercent: number;
}

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
  const { user, hasPermission } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "billing";
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Billing Summary state
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filterProject, setFilterProject] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showCostData, setShowCostData] = useState(false);
  
  // Check if user can view cost/margin data (Finance/Admin only)
  const canViewCostData = hasPermission(["admin", "finance"]);

  // Fetch projects and profiles
  useEffect(() => {
    const fetchData = async () => {
      const [projectsRes, profilesRes] = await Promise.all([
        supabase.from("projects").select("*").order("name"),
        supabase.from("profiles").select("*").order("full_name"),
      ]);
      
      if (projectsRes.data) setProjects(projectsRes.data);
      if (profilesRes.data) setProfiles(profilesRes.data);
    };
    fetchData();
  }, []);

  // Mock billing summary data
  const mockBillingSummary: BillingSummaryEntry[] = useMemo(() => [
    {
      id: "1",
      userId: "user1",
      userName: "John Doe",
      projectId: "11111111-1111-1111-1111-111111111111",
      projectName: "E-Commerce Platform",
      activityType: "dev",
      totalHours: 42,
      billableHours: 40,
      billRate: 150,
      costRate: 75,
      billableAmount: 6000,
      costAmount: 3150,
      margin: 2850,
      marginPercent: 47.5,
    },
    {
      id: "2",
      userId: "user1",
      userName: "John Doe",
      projectId: "22222222-2222-2222-2222-222222222222",
      projectName: "Mobile Banking App",
      activityType: "dev",
      totalHours: 28,
      billableHours: 28,
      billRate: 150,
      costRate: 75,
      billableAmount: 4200,
      costAmount: 2100,
      margin: 2100,
      marginPercent: 50,
    },
    {
      id: "3",
      userId: "user2",
      userName: "Sarah Smith",
      projectId: "11111111-1111-1111-1111-111111111111",
      projectName: "E-Commerce Platform",
      activityType: "meeting",
      totalHours: 12,
      billableHours: 10,
      billRate: 125,
      costRate: 65,
      billableAmount: 1250,
      costAmount: 780,
      margin: 470,
      marginPercent: 37.6,
    },
    {
      id: "4",
      userId: "user2",
      userName: "Sarah Smith",
      projectId: "33333333-3333-3333-3333-333333333333",
      projectName: "CRM System",
      activityType: "design",
      totalHours: 35,
      billableHours: 35,
      billRate: 125,
      costRate: 65,
      billableAmount: 4375,
      costAmount: 2275,
      margin: 2100,
      marginPercent: 48,
    },
    {
      id: "5",
      userId: "user3",
      userName: "Mike Johnson",
      projectId: "22222222-2222-2222-2222-222222222222",
      projectName: "Mobile Banking App",
      activityType: "dev",
      totalHours: 45,
      billableHours: 42,
      billRate: 140,
      costRate: 70,
      billableAmount: 5880,
      costAmount: 3150,
      margin: 2730,
      marginPercent: 46.4,
    },
    {
      id: "6",
      userId: "user3",
      userName: "Mike Johnson",
      projectId: "55555555-5555-5555-5555-555555555555",
      projectName: "Internal Tools",
      activityType: "admin",
      totalHours: 8,
      billableHours: 0,
      billRate: 0,
      costRate: 70,
      billableAmount: 0,
      costAmount: 560,
      margin: -560,
      marginPercent: 0,
    },
    {
      id: "7",
      userId: "user4",
      userName: "Emily Brown",
      projectId: "33333333-3333-3333-3333-333333333333",
      projectName: "CRM System",
      activityType: "dev",
      totalHours: 38,
      billableHours: 36,
      billRate: 135,
      costRate: 68,
      billableAmount: 4860,
      costAmount: 2584,
      margin: 2276,
      marginPercent: 46.8,
    },
    {
      id: "8",
      userId: "user4",
      userName: "Emily Brown",
      projectId: "11111111-1111-1111-1111-111111111111",
      projectName: "E-Commerce Platform",
      activityType: "meeting",
      totalHours: 6,
      billableHours: 6,
      billRate: 135,
      costRate: 68,
      billableAmount: 810,
      costAmount: 408,
      margin: 402,
      marginPercent: 49.6,
    },
    {
      id: "9",
      userId: "user5",
      userName: "David Lee",
      projectId: "44444444-4444-4444-4444-444444444444",
      projectName: "Analytics Dashboard",
      activityType: "dev",
      totalHours: 52,
      billableHours: 48,
      billRate: 145,
      costRate: 72,
      billableAmount: 6960,
      costAmount: 3744,
      margin: 3216,
      marginPercent: 46.2,
    },
    {
      id: "10",
      userId: "user5",
      userName: "David Lee",
      projectId: "66666666-6666-6666-6666-666666666666",
      projectName: "HR Portal",
      activityType: "admin",
      totalHours: 4,
      billableHours: 0,
      billRate: 0,
      costRate: 72,
      billableAmount: 0,
      costAmount: 288,
      margin: -288,
      marginPercent: 0,
    },
  ], []);

  // Filter billing summary
  const filteredBillingSummary = useMemo(() => {
    return mockBillingSummary.filter(entry => {
      const matchesProject = filterProject === "all" || entry.projectId === filterProject;
      const matchesUser = filterUser === "all" || entry.userId === filterUser;
      return matchesProject && matchesUser;
    });
  }, [mockBillingSummary, filterProject, filterUser]);

  // Calculate totals
  const billingSummaryTotals = useMemo(() => {
    return filteredBillingSummary.reduce((acc, entry) => ({
      totalHours: acc.totalHours + entry.totalHours,
      billableHours: acc.billableHours + entry.billableHours,
      billableAmount: acc.billableAmount + entry.billableAmount,
      costAmount: acc.costAmount + entry.costAmount,
      margin: acc.margin + entry.margin,
    }), {
      totalHours: 0,
      billableHours: 0,
      billableAmount: 0,
      costAmount: 0,
      margin: 0,
    });
  }, [filteredBillingSummary]);

  const overallMarginPercent = billingSummaryTotals.billableAmount > 0 
    ? ((billingSummaryTotals.margin / billingSummaryTotals.billableAmount) * 100).toFixed(1)
    : "0";

  // Export to CSV
  const handleExportBillingCSV = () => {
    const headers = canViewCostData && showCostData
      ? ["User", "Project", "Activity", "Total Hours", "Billable Hours", "Bill Rate", "Billable Amount", "Cost Rate", "Cost Amount", "Margin", "Margin %"]
      : ["User", "Project", "Activity", "Total Hours", "Billable Hours", "Bill Rate", "Billable Amount"];
    
    const rows = filteredBillingSummary.map(entry => {
      const baseRow = [
        entry.userName,
        entry.projectName,
        ACTIVITY_TYPE_LABELS[entry.activityType],
        entry.totalHours.toString(),
        entry.billableHours.toString(),
        `$${entry.billRate}`,
        `$${entry.billableAmount.toLocaleString()}`,
      ];
      
      if (canViewCostData && showCostData) {
        baseRow.push(
          `$${entry.costRate}`,
          `$${entry.costAmount.toLocaleString()}`,
          `$${entry.margin.toLocaleString()}`,
          `${entry.marginPercent}%`
        );
      }
      
      return baseRow;
    });
    
    // Add totals row
    const totalsRow = canViewCostData && showCostData
      ? ["TOTAL", "", "", billingSummaryTotals.totalHours.toString(), billingSummaryTotals.billableHours.toString(), "", `$${billingSummaryTotals.billableAmount.toLocaleString()}`, "", `$${billingSummaryTotals.costAmount.toLocaleString()}`, `$${billingSummaryTotals.margin.toLocaleString()}`, `${overallMarginPercent}%`]
      : ["TOTAL", "", "", billingSummaryTotals.totalHours.toString(), billingSummaryTotals.billableHours.toString(), "", `$${billingSummaryTotals.billableAmount.toLocaleString()}`];
    
    rows.push(totalsRow);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-summary-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Billing summary exported to CSV");
  };

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

  const getActivityBadge = (type: ActivityType) => {
    const variants: Record<ActivityType, "default" | "secondary" | "outline"> = {
      dev: "default",
      design: "secondary",
      admin: "outline",
      meeting: "outline",
    };
    return <Badge variant={variants[type]}>{ACTIVITY_TYPE_LABELS[type]}</Badge>;
  };

  // Get unique users from billing data for filter
  const uniqueUsers = useMemo(() => {
    const users = new Map<string, string>();
    mockBillingSummary.forEach(entry => {
      users.set(entry.userId, entry.userName);
    });
    return Array.from(users.entries()).map(([id, name]) => ({ id, name }));
  }, [mockBillingSummary]);

  // Render billing summary content (reusable)
  const renderBillingSummaryContent = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Timesheet Billing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleExportBillingCSV} variant="outline" className="gap-2 w-full">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">
              {billingSummaryTotals.totalHours.toLocaleString()}h
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Billable Hours</p>
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">
              {billingSummaryTotals.billableHours.toLocaleString()}h
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {((billingSummaryTotals.billableHours / billingSummaryTotals.totalHours) * 100).toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Billable Amount</p>
            </div>
            <p className="text-3xl font-bold text-success mt-2">
              ${billingSummaryTotals.billableAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        {canViewCostData && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Cost / Margin</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowCostData(!showCostData)}
                >
                  {showCostData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {showCostData ? (
                <>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    ${billingSummaryTotals.margin.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {overallMarginPercent}% margin (Cost: ${billingSummaryTotals.costAmount.toLocaleString()})
                  </p>
                </>
              ) : (
                <p className="text-xl text-muted-foreground mt-2">Click to reveal</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Billing Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detailed Billing Summary</CardTitle>
            <Badge variant="secondary">{filteredBillingSummary.length} Records</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Total Hrs</TableHead>
                <TableHead className="text-right">Billable Hrs</TableHead>
                <TableHead className="text-right">Bill Rate</TableHead>
                <TableHead className="text-right">Billable Amt</TableHead>
                {canViewCostData && showCostData && (
                  <>
                    <TableHead className="text-right">Cost Rate</TableHead>
                    <TableHead className="text-right">Cost Amt</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="text-right">Margin %</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBillingSummary.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.userName}</TableCell>
                  <TableCell>{entry.projectName}</TableCell>
                  <TableCell>{getActivityBadge(entry.activityType)}</TableCell>
                  <TableCell className="text-right">{entry.totalHours}h</TableCell>
                  <TableCell className="text-right">{entry.billableHours}h</TableCell>
                  <TableCell className="text-right">${entry.billRate}</TableCell>
                  <TableCell className="text-right font-medium">${entry.billableAmount.toLocaleString()}</TableCell>
                  {canViewCostData && showCostData && (
                    <>
                      <TableCell className="text-right">${entry.costRate}</TableCell>
                      <TableCell className="text-right">${entry.costAmount.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-medium ${entry.margin >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${entry.margin.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={entry.marginPercent >= 40 ? "default" : entry.marginPercent > 0 ? "secondary" : "destructive"}>
                          {entry.marginPercent}%
                        </Badge>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">{billingSummaryTotals.totalHours}h</TableCell>
                <TableCell className="text-right">{billingSummaryTotals.billableHours}h</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right">${billingSummaryTotals.billableAmount.toLocaleString()}</TableCell>
                {canViewCostData && showCostData && (
                  <>
                    <TableCell className="text-right"></TableCell>
                    <TableCell className="text-right">${billingSummaryTotals.costAmount.toLocaleString()}</TableCell>
                    <TableCell className={`text-right ${billingSummaryTotals.margin >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${billingSummaryTotals.margin.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default">{overallMarginPercent}%</Badge>
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // If accessed via billing tab URL, show only billing summary
  if (defaultTab === "billing") {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Billing Summary</h1>
              <p className="text-muted-foreground mt-1">
                Timesheet billing summary with hours and amounts
              </p>
            </div>
            <Button onClick={handleExportBillingCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          {renderBillingSummaryContent()}
        </div>
      </DashboardLayout>
    );
  }

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
            <TabsTrigger value="projects">Project Reports</TabsTrigger>
            <TabsTrigger value="employees">Employee Reports</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
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
                      <SelectContent className="bg-background">
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
                      <SelectContent className="bg-background">
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
                      <SelectContent className="bg-background">
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;