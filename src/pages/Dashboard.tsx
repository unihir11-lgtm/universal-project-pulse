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
} from "lucide-react";
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
  const chartData = weekDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayLabel = format(day, "EEE");
    
    const dayData: Record<string, string | number> = { name: dayLabel };
    
    if (weeklyProjectHours) {
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

  // Get unique project names for lines
  const projectNames = weeklyProjectHours
    ? [...new Set(weeklyProjectHours.map((entry) => (entry.projects as { name: string })?.name || "Unknown"))]
    : [];

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
            ) : projectNames.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No time entries for this week
              </div>
            ) : (
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
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
