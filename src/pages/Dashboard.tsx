import { useNavigate } from "react-router-dom";
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
