import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { startOfWeek, endOfWeek, format, eachDayOfInterval, parseISO } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Users,
  CheckCircle2,
  UserPlus,
  FilePlus,
  CalendarCheck,
  Clock,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(199, 89%, 48%)",
];

// Sample data to display when no real data exists
const SAMPLE_PROJECTS = ["E-Commerce Platform", "Mobile Banking App", "CRM System", "Analytics Dashboard"];
const SAMPLE_CHART_DATA = [
  { name: "Mon", "E-Commerce Platform": 4, "Mobile Banking App": 3, "CRM System": 2, "Analytics Dashboard": 0 },
  { name: "Tue", "E-Commerce Platform": 5, "Mobile Banking App": 2, "CRM System": 0, "Analytics Dashboard": 3 },
  { name: "Wed", "E-Commerce Platform": 3, "Mobile Banking App": 0, "CRM System": 4, "Analytics Dashboard": 2 },
  { name: "Thu", "E-Commerce Platform": 0, "Mobile Banking App": 6, "CRM System": 2, "Analytics Dashboard": 0 },
  { name: "Fri", "E-Commerce Platform": 4, "Mobile Banking App": 0, "CRM System": 0, "Analytics Dashboard": 5 },
  { name: "Sat", "E-Commerce Platform": 0, "Mobile Banking App": 0, "CRM System": 0, "Analytics Dashboard": 0 },
  { name: "Sun", "E-Commerce Platform": 0, "Mobile Banking App": 0, "CRM System": 0, "Analytics Dashboard": 0 },
];

// Sample delayed tasks data by assignee
const DELAYED_BY_ASSIGNEE = [
  { name: "John Doe", avgDays: 5.2, taskCount: 8 },
  { name: "Sarah Smith", avgDays: 3.8, taskCount: 5 },
  { name: "Mike Johnson", avgDays: 2.5, taskCount: 3 },
  { name: "Emily Brown", avgDays: 4.1, taskCount: 6 },
  { name: "David Lee", avgDays: 1.9, taskCount: 2 },
];

// Sample delayed tasks data by project
const DELAYED_BY_PROJECT = [
  { name: "E-Commerce Platform", avgDays: 4.5, taskCount: 12 },
  { name: "Mobile Banking App", avgDays: 3.2, taskCount: 7 },
  { name: "CRM System", avgDays: 2.8, taskCount: 5 },
  { name: "Analytics Dashboard", avgDays: 5.1, taskCount: 9 },
  { name: "Inventory Management", avgDays: 1.5, taskCount: 3 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: weeklyProjectHours, isLoading } = useQuery({
    queryKey: ["weekly-project-hours", format(weekStart, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data: timeEntries, error } = await supabase
        .from("time_entries")
        .select(`
          entry_date,
          logged_hours,
          project_id,
          projects!inner(name)
        `)
        .gte("entry_date", format(weekStart, "yyyy-MM-dd"))
        .lte("entry_date", format(weekEnd, "yyyy-MM-dd"));

      if (error) throw error;
      return timeEntries;
    },
  });

  // Process data for chart
  const processedChartData = weekDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayLabel = format(day, "EEE");
    
    const dayData: Record<string, string | number> = { name: dayLabel };
    
    if (weeklyProjectHours && weeklyProjectHours.length > 0) {
      const projectHoursMap = new Map<string, number>();
      
      weeklyProjectHours
        .filter((entry) => entry.entry_date === dayStr)
        .forEach((entry) => {
          const projectName = (entry.projects as { name: string })?.name || "Unknown";
          const current = projectHoursMap.get(projectName) || 0;
          projectHoursMap.set(projectName, current + Number(entry.logged_hours));
        });
      
      projectHoursMap.forEach((hours, projectName) => {
        dayData[projectName] = hours;
      });
    }
    
    return dayData;
  });

  // Determine if we have real data or should use sample data
  const hasRealData = weeklyProjectHours && weeklyProjectHours.length > 0;
  const chartData = hasRealData ? processedChartData : SAMPLE_CHART_DATA;
  
  // Get unique project names for lines
  const projectNames = hasRealData
    ? [...new Set(weeklyProjectHours.map((entry) => (entry.projects as { name: string })?.name || "Unknown"))]
    : SAMPLE_PROJECTS;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Projects"
            value="48"
            icon={FolderKanban}
            trend={{ value: "+12%", isPositive: true }}
            iconBgClass="bg-gradient-primary"
            href="/projects"
          />
          <StatCard
            title="Total Employees"
            value="156"
            icon={Users}
            trend={{ value: "+8%", isPositive: true }}
            iconBgClass="bg-gradient-accent"
            href="/employees"
          />
          <StatCard
            title="Active Projects"
            value="32"
            icon={CheckCircle2}
            trend={{ value: "+5%", isPositive: true }}
            iconBgClass="bg-success"
            href="/projects"
          />
        </div>

        {/* Weekly Project Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Project Hours This Week</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                {!hasRealData && (
                  <p className="text-sm text-muted-foreground mb-2">Sample data shown - no time entries recorded yet</p>
                )}
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
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
                    <Legend />
                    {projectNames.map((projectName, index) => (
                      <Line
                        key={projectName}
                        type="monotone"
                        dataKey={projectName}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], r: 4 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button 
                className="h-24 flex flex-col gap-2" 
                variant="outline"
                onClick={() => navigate("/employees")}
              >
                <UserPlus className="h-6 w-6" />
                <span>Add Employee</span>
              </Button>
              <Button 
                className="h-24 flex flex-col gap-2" 
                variant="outline"
                onClick={() => navigate("/projects")}
              >
                <FilePlus className="h-6 w-6" />
                <span>Add Project</span>
              </Button>
              <Button 
                className="h-24 flex flex-col gap-2" 
                variant="outline"
                onClick={() => navigate("/todays-hours")}
              >
                <CalendarCheck className="h-6 w-6" />
                <span>Today's Attendance</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delayed Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              <h2 className="text-xl font-semibold text-foreground">Delayed Tasks</h2>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Breakdown by Assignee */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Breakdown by Assignee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {DELAYED_BY_ASSIGNEE.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {item.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Avg: <span className="text-destructive font-medium">{item.avgDays} days</span>
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.taskCount} tasks
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Breakdown by Project */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Breakdown by Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {DELAYED_BY_PROJECT.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FolderKanban className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Avg: <span className="text-destructive font-medium">{item.avgDays} days</span>
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.taskCount} tasks
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
