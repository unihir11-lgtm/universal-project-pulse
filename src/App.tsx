import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Employees from "./pages/Employees";
import EmployeeRates from "./pages/EmployeeRates";
import Projects from "./pages/Projects";
import SpentHours from "./pages/SpentHours";
import TodaysHours from "./pages/TodaysHours";
import Reports from "./pages/Reports";
import Attendance from "./pages/Attendance";
import Settings from "./pages/Settings";
import Roles from "./pages/Roles";
import ProjectSummary from "./pages/ProjectSummary";
import Tasks from "./pages/Tasks";
import Sprints from "./pages/Sprints";
import TaskTimeReport from "./pages/TaskTimeReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employee-rates" element={<EmployeeRates />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/spent-hours" element={<SpentHours />} />
            <Route path="/todays-hours" element={<TodaysHours />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/project-summary" element={<ProjectSummary />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/sprints" element={<Sprints />} />
            <Route path="/task-time-report" element={<TaskTimeReport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
