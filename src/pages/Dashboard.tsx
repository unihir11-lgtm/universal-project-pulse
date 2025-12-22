import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  UserPlus,
  FilePlus,
  CalendarCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const projectData = [
  { name: "Jan", completed: 12, active: 8 },
  { name: "Feb", completed: 15, active: 10 },
  { name: "Mar", completed: 18, active: 12 },
  { name: "Apr", completed: 20, active: 15 },
  { name: "May", completed: 25, active: 18 },
  { name: "Jun", completed: 22, active: 16 },
];

const productivityData = [
  { name: "Mon", hours: 42 },
  { name: "Tue", hours: 48 },
  { name: "Wed", hours: 45 },
  { name: "Thu", hours: 52 },
  { name: "Fri", hours: 38 },
];

const Dashboard = () => {
  const navigate = useNavigate();

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
          <StatCard
            title="Hours Logged Today"
            value="892"
            icon={Clock}
            trend={{ value: "-3%", isPositive: false }}
            iconBgClass="bg-info"
            href="/todays-hours"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectData}>
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
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="active" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee Productivity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={productivityData}>
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
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--accent))", r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

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
