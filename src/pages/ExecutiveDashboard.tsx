import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  ArrowUpRight,
  BarChart3,
  Target,
  Zap
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
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
  { week: "Week 1", planned: 380, actual: 360 },
  { week: "Week 2", planned: 420, actual: 400 },
  { week: "Week 3", planned: 400, actual: 350 },
  { week: "Week 4", planned: 450, actual: 420 },
  { week: "Week 5", planned: 480, actual: 450 },
  { week: "Week 6", planned: 460, actual: 380 },
];

const projectBurnData = [
  { name: "Jan", budget: 45000, actual: 42000 },
  { name: "Feb", budget: 52000, actual: 48000 },
  { name: "Mar", budget: 48000, actual: 55000 },
  { name: "Apr", budget: 61000, actual: 58000 },
  { name: "May", budget: 55000, actual: 52000 },
  { name: "Jun", budget: 67000, actual: 48000 },
];

const utilizationData = [
  { name: "Billable", value: 78, color: "hsl(var(--success))" },
  { name: "Non-Billable", value: 15, color: "hsl(var(--warning))" },
  { name: "Available", value: 7, color: "hsl(var(--muted))" },
];

const topProjects = [
  { project: "Enterprise Platform", client: "Acme Corp", burn: 124500, budget: 180000, progress: 72, status: "on-track" },
  { project: "Mobile App v3", client: "TechStart Inc", burn: 89200, budget: 95000, progress: 94, status: "at-risk" },
  { project: "Data Migration", client: "GlobalBank", burn: 67800, budget: 85000, progress: 80, status: "on-track" },
  { project: "API Integration", client: "RetailMax", burn: 52300, budget: 56000, progress: 93, status: "critical" },
  { project: "Dashboard Redesign", client: "HealthCo", burn: 38900, budget: 45000, progress: 86, status: "on-track" },
];

const alerts = [
  { type: "critical", title: "API Integration at 93% budget", description: "Only $3,700 remaining with 8 days until deadline", icon: DollarSign },
  { type: "warning", title: "3 employees over-allocated", description: "Sarah Chen, Mike Johnson, Alex Thompson exceed 100% capacity", icon: Users },
];

const ExecutiveDashboard = () => {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      "on-track": { label: "On Track", className: "bg-success/10 text-success border-success/20" },
      "at-risk": { label: "At Risk", className: "bg-warning/10 text-warning border-warning/20" },
      "critical": { label: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
    };
    return configs[status] || configs["on-track"];
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive Dashboard</h1>
            <p className="text-muted-foreground mt-1">Real-time insights into project operations and team performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Last 30 Days
            </Button>
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground">
              <ArrowUpRight className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Alert Banners */}
        {alerts.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {alerts.map((alert, index) => (
              <Card 
                key={index} 
                className={`border-l-4 ${
                  alert.type === "critical" 
                    ? "border-l-destructive bg-destructive/5" 
                    : "border-l-warning bg-warning/5"
                }`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      alert.type === "critical" ? "bg-destructive/10" : "bg-warning/10"
                    }`}>
                      <alert.icon className={`h-5 w-5 ${
                        alert.type === "critical" ? "text-destructive" : "text-warning"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{alert.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Team Utilization */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-success/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Team Utilization</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">78%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span>+5.2% vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-success/10 rounded-xl">
                  <Target className="h-6 w-6 text-success" />
                </div>
              </div>
              <Progress value={78} className="mt-4 h-2" />
            </CardContent>
          </Card>

          {/* Billable Hours */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-info/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Billable Hours (30d)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">2,840</span>
                    <span className="text-sm text-muted-foreground">hrs</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span>+8.1% vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-info/10 rounded-xl">
                  <Clock className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Unbilled Value</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">$128k</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-destructive">
                    <TrendingDown className="h-4 w-4" />
                    <span>-12.3% vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-accent/10 rounded-xl">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">12</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1 text-success">
                      <Zap className="h-3 w-3" /> 9 on track
                    </span>
                    <span className="text-destructive">2 at risk</span>
                  </div>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Planned vs Actual Hours - Area Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Hours Overview</CardTitle>
                  <p className="text-sm text-muted-foreground">Planned vs actual hours by week</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Planned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Actual</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyHoursData}>
                    <defs>
                      <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="planned"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPlanned)"
                      name="Planned"
                    />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorActual)"
                      name="Actual"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Utilization Donut */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Capacity Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">Team time distribution</p>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={utilizationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {utilizationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {utilizationData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget vs Actual Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Budget Performance</CardTitle>
                <p className="text-sm text-muted-foreground">Monthly budget vs actual spend</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectBurnData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Budget" />
                  <Bar dataKey="actual" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Project Health</CardTitle>
                <p className="text-sm text-muted-foreground">Active projects by budget consumption</p>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Project</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold text-right">Burn / Budget</TableHead>
                    <TableHead className="font-semibold">Budget Used</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProjects.map((project) => {
                    const statusConfig = getStatusConfig(project.status);
                    const budgetPercent = Math.round((project.burn / project.budget) * 100);
                    return (
                      <TableRow key={project.project} className="group cursor-pointer">
                        <TableCell>
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {project.project}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{project.client}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">${project.burn.toLocaleString()}</span>
                          <span className="text-muted-foreground"> / ${project.budget.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress 
                              value={budgetPercent} 
                              className={`h-2 w-24 ${budgetPercent > 90 ? '[&>div]:bg-destructive' : budgetPercent > 75 ? '[&>div]:bg-warning' : ''}`}
                            />
                            <span className={`text-sm font-medium ${
                              budgetPercent > 90 ? 'text-destructive' : budgetPercent > 75 ? 'text-warning' : 'text-muted-foreground'
                            }`}>
                              {budgetPercent}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ExecutiveDashboard;