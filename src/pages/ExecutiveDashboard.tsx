import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, DollarSign, TrendingUp, TrendingDown, Users, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for charts
const weeklyHoursData = [
  { week: "W1", planned: 380, actual: 360 },
  { week: "W2", planned: 420, actual: 400 },
  { week: "W3", planned: 400, actual: 350 },
  { week: "W4", planned: 450, actual: 420 },
  { week: "W5", planned: 480, actual: 450 },
  { week: "W6", planned: 460, actual: 380 },
];

const projectBurnData = [
  { week: "W1", burn: 32000 },
  { week: "W2", burn: 28000 },
  { week: "W3", burn: 38000 },
  { week: "W4", burn: 52000 },
  { week: "W5", burn: 55000 },
  { week: "W6", burn: 48000 },
];

const topProjects = [
  { project: "Enterprise Platform", client: "Acme Corp", burn: 124500, progress: 72, status: "healthy" },
  { project: "Mobile App v3", client: "TechStart Inc", burn: 89200, progress: 45, status: "warning" },
  { project: "Data Migration", client: "GlobalBank", burn: 67800, progress: 88, status: "healthy" },
  { project: "API Integration", client: "RetailMax", burn: 52300, progress: 35, status: "critical" },
  { project: "Dashboard Redesign", client: "HealthCo", burn: 38900, progress: 90, status: "healthy" },
];

const atRiskProjects = [
  { project: "API Integration", client: "RetailMax", risk: "Budget at 92%" },
  { project: "Mobile App v3", client: "TechStart Inc", risk: "Timeline delay" },
];

const overAllocatedEmployees = ["Sarah Chen", "Mike Johnson", "Lisa Wang"];

const ExecutiveDashboard = () => {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      healthy: "bg-green-100 text-green-700 hover:bg-green-100",
      warning: "bg-orange-100 text-orange-700 hover:bg-orange-100",
      critical: "bg-red-100 text-red-700 hover:bg-red-100",
    };
    return styles[status] || styles.healthy;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executive Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of project operations</p>
        </div>

        {/* Alert Banners */}
        <div className="space-y-3">
          {/* Over-allocated Alert */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-700">
                    {overAllocatedEmployees.length} employees over-allocated this week
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {overAllocatedEmployees.join(", ")} exceed 100% capacity
                  </p>
                  <button className="text-sm text-orange-600 hover:underline mt-1">
                    View details
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Alert */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">
                    API Integration project at 92% budget
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Only $4,200 remaining with 12 days until deadline
                  </p>
                  <button className="text-sm text-red-600 hover:underline mt-1">
                    View details
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Utilization</p>
                  <p className="text-3xl font-bold mt-1">78%</p>
                  <p className="text-sm text-muted-foreground">Billable capacity used</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+5.2% vs last month</span>
                  </div>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Billable Hours (30d)</p>
                  <p className="text-3xl font-bold mt-1">2,840</p>
                  <p className="text-sm text-muted-foreground">Across all projects</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+8.1% vs last month</span>
                  </div>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unbilled Value</p>
                  <p className="text-3xl font-bold mt-1">$128k</p>
                  <p className="text-sm text-muted-foreground">Pending invoicing</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                    <TrendingDown className="h-4 w-4" />
                    <span>-12.3% vs last month</span>
                  </div>
                </div>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Over-Allocated</p>
                  <p className="text-3xl font-bold mt-1">3</p>
                  <p className="text-sm text-muted-foreground">Employees this week</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Planned vs Actual Hours */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold">Planned vs Actual Hours</CardTitle>
                <p className="text-sm text-muted-foreground">Weekly comparison</p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyHoursData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="planned"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 4 }}
                      name="Planned"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: "#22c55e", r: 4 }}
                      name="Actual"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Project Burn by Week */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold">Project Burn by Week</CardTitle>
                <p className="text-sm text-muted-foreground">Total spend across projects</p>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectBurnData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Burn"]} />
                    <Bar dataKey="burn" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Projects by Burn */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Top Projects by Burn</CardTitle>
              <p className="text-sm text-muted-foreground">Highest spending projects this period</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Burn</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProjects.map((project) => (
                    <TableRow key={project.project}>
                      <TableCell className="font-medium text-blue-600">
                        {project.project}
                      </TableCell>
                      <TableCell className="text-blue-600">{project.client}</TableCell>
                      <TableCell className="text-right">
                        ${project.burn.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="w-16 h-2" />
                          <span className="text-sm text-muted-foreground">
                            {project.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(project.status)}>
                          {project.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* At-Risk Projects */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">At-Risk Projects</CardTitle>
              <p className="text-sm text-muted-foreground">Requires immediate attention</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atRiskProjects.map((project) => (
                    <TableRow key={project.project}>
                      <TableCell className="font-medium">{project.project}</TableCell>
                      <TableCell>{project.client}</TableCell>
                      <TableCell className="text-red-600 font-medium">
                        {project.risk}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExecutiveDashboard;
