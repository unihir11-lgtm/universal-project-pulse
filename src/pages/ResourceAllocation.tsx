import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle, Users, Clock, TrendingUp, Calendar, User,
  ChevronDown, ChevronRight, Layers, ListChecks,
} from "lucide-react";

// --- Constants ---
const DAILY_CAPACITY = 8;
const WEEKLY_CAPACITY = 40;

// --- Helpers ---
const getWorkingDays = (start: string, end: string): string[] => {
  const days: string[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) days.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

const formatShortDay = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit" });
};

const groupDaysByWeek = (days: string[]): { weekLabel: string; days: string[] }[] => {
  const weeks: { weekLabel: string; days: string[] }[] = [];
  let currentWeek: string[] = [];
  let currentWeekNum = -1;

  days.forEach(day => {
    const d = new Date(day);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7);
    if (weekNum !== currentWeekNum) {
      if (currentWeek.length > 0) {
        weeks.push({ weekLabel: `Week ${weeks.length + 1}`, days: currentWeek });
      }
      currentWeek = [day];
      currentWeekNum = weekNum;
    } else {
      currentWeek.push(day);
    }
  });
  if (currentWeek.length > 0) {
    weeks.push({ weekLabel: `Week ${weeks.length + 1}`, days: currentWeek });
  }
  return weeks;
};

const distributeHours = (hours: number, days: string[]): Record<string, number> => {
  const r: Record<string, number> = {};
  if (!days.length) return r;
  const per = Math.floor(hours / days.length);
  const rem = hours - per * days.length;
  days.forEach((d, i) => { r[d] = per + (i < rem ? 1 : 0); });
  return r;
};

// --- Mock Data (same as Sprints) ---
const projectsData = [
  { id: 1, name: "Go Live" },
  { id: 2, name: "Human Resource" },
  { id: 3, name: "Jain Connection Marketing" },
  { id: 4, name: "Jain Marketplace" },
  { id: 5, name: "Product Support" },
  { id: 6, name: "Super App" },
  { id: 7, name: "Universal Software" },
];

const employeesData = [
  { id: "e1", name: "John Doe", capacity: WEEKLY_CAPACITY },
  { id: "e2", name: "Ravi Kumar", capacity: WEEKLY_CAPACITY },
  { id: "e3", name: "Mehul Patel", capacity: WEEKLY_CAPACITY },
  { id: "e4", name: "Priya Sharma", capacity: WEEKLY_CAPACITY },
  { id: "e5", name: "Amit Singh", capacity: WEEKLY_CAPACITY },
  { id: "e6", name: "Sneha Reddy", capacity: WEEKLY_CAPACITY },
];

interface SprintTaskAssignee {
  employeeId: string;
  employeeName: string;
  dayHours: Record<string, number>;
}

interface SprintTask {
  id: number;
  name: string;
  project: string;
  assignees: SprintTaskAssignee[];
  estimatedHours: number;
  status: string;
  priority: string;
}

interface Sprint {
  id: number;
  name: string;
  project: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: string;
  tasks: SprintTask[];
}

// Same sprint data as Sprints page
const buildSprints = (): Sprint[] => {
  const sprint2Days = getWorkingDays("2026-03-16", "2026-04-03");
  const sprint3Days = getWorkingDays("2026-02-24", "2026-03-14");

  return [
    {
      id: 1, name: "Sprint 1", project: "Universal Software",
      startDate: "2026-02-24", endDate: "2026-03-14", duration: "3 weeks", status: "Active",
      tasks: [
        { id: 101, name: "User Auth Flow", project: "Universal Software", estimatedHours: 40, status: "In Progress", priority: "High",
          assignees: [
            { employeeId: "e1", employeeName: "John Doe", dayHours: {
              "2026-02-24": 4, "2026-02-25": 4, "2026-02-26": 3, "2026-02-27": 3, "2026-02-28": 2,
              "2026-03-03": 2, "2026-03-04": 2, "2026-03-05": 1, "2026-03-06": 0, "2026-03-07": 0,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
            { employeeId: "e4", employeeName: "Priya Sharma", dayHours: {
              "2026-02-24": 3, "2026-02-25": 3, "2026-02-26": 2, "2026-02-27": 2, "2026-02-28": 2,
              "2026-03-03": 2, "2026-03-04": 2, "2026-03-05": 2, "2026-03-06": 1, "2026-03-07": 0,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
        { id: 102, name: "Dashboard API", project: "Universal Software", estimatedHours: 30, status: "Open", priority: "High",
          assignees: [
            { employeeId: "e1", employeeName: "John Doe", dayHours: {
              "2026-02-24": 0, "2026-02-25": 0, "2026-02-26": 2, "2026-02-27": 2, "2026-02-28": 3,
              "2026-03-03": 3, "2026-03-04": 3, "2026-03-05": 4, "2026-03-06": 4, "2026-03-07": 3,
              "2026-03-10": 2, "2026-03-11": 2, "2026-03-12": 2, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
        { id: 103, name: "Profile Page", project: "Universal Software", estimatedHours: 24, status: "In Progress", priority: "Medium",
          assignees: [
            { employeeId: "e2", employeeName: "Ravi Kumar", dayHours: {
              "2026-02-24": 3, "2026-02-25": 3, "2026-02-26": 2, "2026-02-27": 2, "2026-02-28": 2,
              "2026-03-03": 2, "2026-03-04": 2, "2026-03-05": 2, "2026-03-06": 2, "2026-03-07": 2,
              "2026-03-10": 1, "2026-03-11": 1, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
        { id: 104, name: "Unit Tests", project: "Universal Software", estimatedHours: 36, status: "Open", priority: "Medium",
          assignees: [
            { employeeId: "e2", employeeName: "Ravi Kumar", dayHours: {
              "2026-02-24": 2, "2026-02-25": 2, "2026-02-26": 2, "2026-02-27": 2, "2026-02-28": 2,
              "2026-03-03": 2, "2026-03-04": 2, "2026-03-05": 2, "2026-03-06": 2, "2026-03-07": 2,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
            { employeeId: "e5", employeeName: "Amit Singh", dayHours: {
              "2026-02-24": 2, "2026-02-25": 2, "2026-02-26": 2, "2026-02-27": 2, "2026-02-28": 2,
              "2026-03-03": 1, "2026-03-04": 1, "2026-03-05": 1, "2026-03-06": 1, "2026-03-07": 0,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
        { id: 105, name: "Report Module", project: "Universal Software", estimatedHours: 48, status: "Open", priority: "High",
          assignees: [
            { employeeId: "e3", employeeName: "Mehul Patel", dayHours: {
              "2026-02-24": 4, "2026-02-25": 4, "2026-02-26": 4, "2026-02-27": 4, "2026-02-28": 4,
              "2026-03-03": 3, "2026-03-04": 3, "2026-03-05": 2, "2026-03-06": 2, "2026-03-07": 0,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
            { employeeId: "e6", employeeName: "Sneha Reddy", dayHours: {
              "2026-02-24": 3, "2026-02-25": 3, "2026-02-26": 3, "2026-02-27": 3, "2026-02-28": 2,
              "2026-03-03": 2, "2026-03-04": 2, "2026-03-05": 0, "2026-03-06": 0, "2026-03-07": 0,
              "2026-03-10": 0, "2026-03-11": 0, "2026-03-12": 0, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
        { id: 106, name: "Bug Fixes", project: "Universal Software", estimatedHours: 30, status: "Open", priority: "Low",
          assignees: [
            { employeeId: "e3", employeeName: "Mehul Patel", dayHours: {
              "2026-02-24": 0, "2026-02-25": 0, "2026-02-26": 0, "2026-02-27": 0, "2026-02-28": 0,
              "2026-03-03": 3, "2026-03-04": 3, "2026-03-05": 4, "2026-03-06": 4, "2026-03-07": 4,
              "2026-03-10": 4, "2026-03-11": 4, "2026-03-12": 4, "2026-03-13": 0, "2026-03-14": 0,
            }},
          ] },
      ],
    },
    {
      id: 2, name: "Sprint 2", project: "Universal Software",
      startDate: "2026-03-16", endDate: "2026-04-03", duration: "3 weeks", status: "Planned",
      tasks: [
        { id: 201, name: "Search Feature", project: "Universal Software", estimatedHours: 40, status: "Open", priority: "High",
          assignees: [{ employeeId: "e4", employeeName: "Priya Sharma", dayHours: distributeHours(40, sprint2Days) }] },
        { id: 202, name: "Notification Service", project: "Universal Software", estimatedHours: 30, status: "Open", priority: "Medium",
          assignees: [{ employeeId: "e5", employeeName: "Amit Singh", dayHours: distributeHours(30, sprint2Days) }] },
        { id: 203, name: "Data Export Module", project: "Universal Software", estimatedHours: 24, status: "Open", priority: "Low",
          assignees: [{ employeeId: "e2", employeeName: "Ravi Kumar", dayHours: distributeHours(24, sprint2Days) }] },
      ],
    },
    {
      id: 3, name: "Sprint 1", project: "Super App",
      startDate: "2026-02-24", endDate: "2026-03-14", duration: "3 weeks", status: "Active",
      tasks: [
        { id: 301, name: "Payment Gateway", project: "Super App", estimatedHours: 48, status: "In Progress", priority: "Critical",
          assignees: [
            { employeeId: "e4", employeeName: "Priya Sharma", dayHours: distributeHours(28, sprint3Days) },
            { employeeId: "e6", employeeName: "Sneha Reddy", dayHours: distributeHours(20, sprint3Days) },
          ] },
        { id: 302, name: "Push Notifications", project: "Super App", estimatedHours: 24, status: "Open", priority: "Medium",
          assignees: [{ employeeId: "e5", employeeName: "Amit Singh", dayHours: distributeHours(24, sprint3Days) }] },
      ],
    },
    {
      id: 4, name: "Release Sprint", project: "Go Live",
      startDate: "2026-04-06", endDate: "2026-04-24", duration: "3 weeks", status: "Planned",
      tasks: [
        { id: 401, name: "CI/CD Pipeline Setup & Config", project: "Go Live", estimatedHours: 48, status: "In Progress", priority: "High",
          assignees: [
            { employeeId: "e3", employeeName: "Mehul Patel", dayHours: {
              "2026-04-06": 6, "2026-04-07": 7, "2026-04-08": 5, "2026-04-09": 4, "2026-04-10": 3,
              "2026-04-13": 2, "2026-04-14": 2, "2026-04-15": 1, "2026-04-16": 0, "2026-04-17": 0,
              "2026-04-20": 0, "2026-04-21": 0, "2026-04-22": 0, "2026-04-23": 0, "2026-04-24": 0,
            }},
            { employeeId: "e1", employeeName: "John Doe", dayHours: {
              "2026-04-06": 4, "2026-04-07": 4, "2026-04-08": 3, "2026-04-09": 3, "2026-04-10": 2,
              "2026-04-13": 0, "2026-04-14": 0, "2026-04-15": 0, "2026-04-16": 0, "2026-04-17": 0,
              "2026-04-20": 0, "2026-04-21": 0, "2026-04-22": 0, "2026-04-23": 0, "2026-04-24": 0,
            }},
          ] },
        { id: 402, name: "Performance & Load Testing", project: "Go Live", estimatedHours: 56, status: "Open", priority: "High",
          assignees: [
            { employeeId: "e5", employeeName: "Amit Singh", dayHours: {
              "2026-04-06": 2, "2026-04-07": 2, "2026-04-08": 4, "2026-04-09": 4, "2026-04-10": 6,
              "2026-04-13": 6, "2026-04-14": 6, "2026-04-15": 4, "2026-04-16": 2, "2026-04-17": 0,
              "2026-04-20": 0, "2026-04-21": 0, "2026-04-22": 0, "2026-04-23": 0, "2026-04-24": 0,
            }},
            { employeeId: "e2", employeeName: "Ravi Kumar", dayHours: {
              "2026-04-06": 0, "2026-04-07": 0, "2026-04-08": 0, "2026-04-09": 2, "2026-04-10": 4,
              "2026-04-13": 4, "2026-04-14": 6, "2026-04-15": 6, "2026-04-16": 4, "2026-04-17": 2,
              "2026-04-20": 0, "2026-04-21": 0, "2026-04-22": 0, "2026-04-23": 0, "2026-04-24": 0,
            }},
          ] },
        { id: 403, name: "Security Audit & Pen Testing", project: "Go Live", estimatedHours: 40, status: "Open", priority: "Critical",
          assignees: [
            { employeeId: "e6", employeeName: "Sneha Reddy", dayHours: {
              "2026-04-06": 0, "2026-04-07": 0, "2026-04-08": 2, "2026-04-09": 4, "2026-04-10": 4,
              "2026-04-13": 6, "2026-04-14": 6, "2026-04-15": 6, "2026-04-16": 4, "2026-04-17": 2,
              "2026-04-20": 0, "2026-04-21": 0, "2026-04-22": 0, "2026-04-23": 0, "2026-04-24": 0,
            }},
          ] },
        { id: 404, name: "Production Deployment & Monitoring", project: "Go Live", estimatedHours: 36, status: "Open", priority: "Critical",
          assignees: [
            { employeeId: "e3", employeeName: "Mehul Patel", dayHours: {
              "2026-04-06": 0, "2026-04-07": 0, "2026-04-08": 0, "2026-04-09": 0, "2026-04-10": 0,
              "2026-04-13": 4, "2026-04-14": 4, "2026-04-15": 6, "2026-04-16": 6, "2026-04-17": 4,
              "2026-04-20": 0, "2026-04-21": 0, "2026-04-22": 0, "2026-04-23": 0, "2026-04-24": 0,
            }},
            { employeeId: "e1", employeeName: "John Doe", dayHours: {
              "2026-04-06": 0, "2026-04-07": 0, "2026-04-08": 0, "2026-04-09": 0, "2026-04-10": 0,
              "2026-04-13": 0, "2026-04-14": 0, "2026-04-15": 0, "2026-04-16": 4, "2026-04-17": 6,
              "2026-04-20": 2, "2026-04-21": 0, "2026-04-22": 0, "2026-04-23": 0, "2026-04-24": 0,
            }},
          ] },
        { id: 405, name: "UAT & Bug Fixes", project: "Go Live", estimatedHours: 44, status: "Open", priority: "High",
          assignees: [
            { employeeId: "e4", employeeName: "Priya Sharma", dayHours: {
              "2026-04-06": 0, "2026-04-07": 0, "2026-04-08": 0, "2026-04-09": 0, "2026-04-10": 0,
              "2026-04-13": 0, "2026-04-14": 0, "2026-04-15": 2, "2026-04-16": 4, "2026-04-17": 6,
              "2026-04-20": 8, "2026-04-21": 8, "2026-04-22": 6, "2026-04-23": 4, "2026-04-24": 2,
            }},
            { employeeId: "e6", employeeName: "Sneha Reddy", dayHours: {
              "2026-04-06": 0, "2026-04-07": 0, "2026-04-08": 0, "2026-04-09": 0, "2026-04-10": 0,
              "2026-04-13": 0, "2026-04-14": 0, "2026-04-15": 0, "2026-04-16": 0, "2026-04-17": 0,
              "2026-04-20": 4, "2026-04-21": 4, "2026-04-22": 0, "2026-04-23": 0, "2026-04-24": 0,
            }},
          ] },
      ],
    },
  ];
};

// Project colors
const projectColorMap: Record<string, string> = {
  "Universal Software": "bg-blue-500",
  "Super App": "bg-emerald-500",
  "Go Live": "bg-orange-500",
  "Human Resource": "bg-purple-500",
  "Jain Connection Marketing": "bg-pink-500",
  "Jain Marketplace": "bg-cyan-500",
  "Product Support": "bg-indigo-500",
};

const ResourceAllocation = () => {
  const sprints = useMemo(() => buildSprints(), []);
  const [filterProject, setFilterProject] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  // Date range: derive from all sprints
  const dateRange = useMemo(() => {
    let minDate = "9999-12-31";
    let maxDate = "0000-01-01";
    sprints.forEach(s => {
      if (s.startDate < minDate) minDate = s.startDate;
      if (s.endDate > maxDate) maxDate = s.endDate;
    });
    return { start: minDate, end: maxDate };
  }, [sprints]);

  const allWorkingDays = useMemo(() => getWorkingDays(dateRange.start, dateRange.end), [dateRange]);
  const weeks = useMemo(() => groupDaysByWeek(allWorkingDays), [allWorkingDays]);
  const hasMultipleWeeks = weeks.length > 1;

  // Build per-employee, per-day allocation breakdown: empId -> day -> [{project, sprint, task, hours}]
  const employeeAllocations = useMemo(() => {
    const map: Record<string, Record<string, { project: string; sprint: string; task: string; hours: number }[]>> = {};
    employeesData.forEach(emp => { map[emp.id] = {}; });

    sprints.forEach(sprint => {
      sprint.tasks.forEach(task => {
        task.assignees.forEach(assignee => {
          if (!map[assignee.employeeId]) map[assignee.employeeId] = {};
          Object.entries(assignee.dayHours).forEach(([day, hours]) => {
            if (hours > 0) {
              if (!map[assignee.employeeId][day]) map[assignee.employeeId][day] = [];
              map[assignee.employeeId][day].push({
                project: sprint.project,
                sprint: sprint.name,
                task: task.name,
                hours,
              });
            }
          });
        });
      });
    });
    return map;
  }, [sprints]);

  // Get total hours for employee on a day
  const getDayTotal = (empId: string, day: string) => {
    return (employeeAllocations[empId]?.[day] || []).reduce((s, a) => s + a.hours, 0);
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employeesData.filter(emp => {
      if (filterEmployee !== "all" && emp.id !== filterEmployee) return false;
      if (filterProject !== "all") {
        // Check if employee has any allocation in this project
        const hasProject = Object.values(employeeAllocations[emp.id] || {}).some(
          dayAllocs => dayAllocs.some(a => a.project === filterProject)
        );
        if (!hasProject) return false;
      }
      return true;
    });
  }, [filterEmployee, filterProject, employeeAllocations]);

  // Stats
  const stats = useMemo(() => {
    let totalAllocated = 0;
    let overAllocatedDays = 0;
    const activeProjects = new Set<string>();

    filteredEmployees.forEach(emp => {
      allWorkingDays.forEach(day => {
        const total = getDayTotal(emp.id, day);
        totalAllocated += total;
        if (total > DAILY_CAPACITY) overAllocatedDays++;
        (employeeAllocations[emp.id]?.[day] || []).forEach(a => activeProjects.add(a.project));
      });
    });

    const totalCapacity = filteredEmployees.length * allWorkingDays.length * DAILY_CAPACITY;
    return {
      utilization: totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0,
      totalAllocated,
      totalCapacity,
      overAllocatedDays,
      teamSize: filteredEmployees.length,
      projectCount: activeProjects.size,
    };
  }, [filteredEmployees, allWorkingDays, employeeAllocations]);

  // Get cell color based on utilization
  const getCellBg = (hours: number) => {
    if (hours === 0) return "";
    if (hours > DAILY_CAPACITY) return "bg-destructive/15";
    if (hours >= DAILY_CAPACITY) return "bg-[hsl(var(--warning))]/15";
    if (hours >= 6) return "bg-[hsl(var(--success))]/10";
    return "bg-primary/5";
  };

  // Get unique projects for an employee on a specific day for the color bar
  const getProjectsForDay = (empId: string, day: string) => {
    const allocs = employeeAllocations[empId]?.[day] || [];
    const grouped: Record<string, number> = {};
    allocs.forEach(a => {
      grouped[a.project] = (grouped[a.project] || 0) + a.hours;
    });
    return Object.entries(grouped).map(([project, hours]) => ({ project, hours }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Resource Allocation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Employee-wise day-level capacity utilization across all sprints
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[hsl(var(--success))]/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilization</p>
                  <p className="text-2xl font-bold mt-1">{stats.utilization}%</p>
                </div>
                <div className="p-2.5 bg-[hsl(var(--success))]/10 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-[hsl(var(--success))]" />
                </div>
              </div>
              <Progress value={stats.utilization} className="mt-3 h-1.5" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[hsl(var(--info))]/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Allocated Hours</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalAllocated}h</p>
                </div>
                <div className="p-2.5 bg-[hsl(var(--info))]/10 rounded-xl">
                  <Clock className="h-5 w-5 text-[hsl(var(--info))]" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">of {stats.totalCapacity}h capacity</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team × Projects</p>
                  <p className="text-2xl font-bold mt-1">{stats.teamSize} × {stats.projectCount}</p>
                </div>
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{stats.teamSize} employees, {stats.projectCount} projects</p>
            </CardContent>
          </Card>

          <Card className={`relative overflow-hidden ${stats.overAllocatedDays > 0 ? 'border-[hsl(var(--warning))]/50' : ''}`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[hsl(var(--warning))]/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Over-Allocated Days</p>
                  <p className="text-2xl font-bold mt-1">{stats.overAllocatedDays}</p>
                </div>
                <div className="p-2.5 bg-[hsl(var(--warning))]/10 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--warning))]" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">exceeding {DAILY_CAPACITY}h/day</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Project</Label>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger className="h-8 text-xs w-44 bg-background"><SelectValue placeholder="All Projects" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectsData.map(p => (
                      <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Employee</Label>
                <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                  <SelectTrigger className="h-8 text-xs w-44 bg-background"><SelectValue placeholder="All Employees" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Employees</SelectItem>
                    {employeesData.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] font-mono">
                  {dateRange.start && new Date(dateRange.start).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  {" – "}
                  {dateRange.end && new Date(dateRange.end).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day-wise Allocation Grid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                <Layers className="h-3.5 w-3.5 text-primary" />
              </div>
              Day-wise Resource Allocation
              <Badge variant="outline" className="text-[10px] ml-1">{filteredEmployees.length} employees</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {/* Week group header */}
                  {hasMultipleWeeks && (
                    <TableRow className="hover:bg-transparent border-0">
                      <TableHead className="sticky left-0 bg-background z-10 min-w-[160px]" />
                      {weeks.map((week, wi) => (
                        <TableHead
                          key={wi}
                          colSpan={week.days.length}
                          className="text-[10px] py-1 h-auto text-center font-bold text-primary border-l border-r border-border/40"
                        >
                          {week.weekLabel}
                          <span className="text-muted-foreground font-normal ml-1">
                            ({formatShortDay(week.days[0])} – {formatShortDay(week.days[week.days.length - 1])})
                          </span>
                        </TableHead>
                      ))}
                      <TableHead className="min-w-[60px]" />
                    </TableRow>
                  )}
                  {/* Day columns */}
                  <TableRow className="hover:bg-transparent border-0">
                    <TableHead className="text-[10px] py-1.5 h-auto whitespace-nowrap sticky left-0 bg-background z-10 min-w-[160px]">Employee</TableHead>
                    {allWorkingDays.map((day, i) => {
                      const isWeekStart = hasMultipleWeeks && i > 0 && weeks.some(w => w.days[0] === day);
                      return (
                        <TableHead key={day} className={`text-[10px] py-1.5 h-auto text-center whitespace-nowrap min-w-[72px] ${isWeekStart ? "border-l border-border/40" : ""}`}>
                          {formatShortDay(day)}
                        </TableHead>
                      );
                    })}
                    <TableHead className="text-[10px] py-1.5 h-auto text-center whitespace-nowrap min-w-[60px] font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map(emp => {
                    const isExpanded = expandedEmployee === emp.id;
                    let empTotal = 0;
                    allWorkingDays.forEach(day => { empTotal += getDayTotal(emp.id, day); });

                    return (
                      <>
                        {/* Employee summary row */}
                        <TableRow
                          key={emp.id}
                          className="border-0 hover:bg-muted/20 cursor-pointer"
                          onClick={() => setExpandedEmployee(isExpanded ? null : emp.id)}
                        >
                          <TableCell className="py-1.5 sticky left-0 bg-background z-10">
                            <div className="flex items-center gap-2">
                              {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-xs font-semibold whitespace-nowrap">{emp.name}</span>
                            </div>
                          </TableCell>
                          {allWorkingDays.map((day, i) => {
                            const total = getDayTotal(emp.id, day);
                            const remaining = DAILY_CAPACITY - total;
                            const isWeekStart = hasMultipleWeeks && i > 0 && weeks.some(w => w.days[0] === day);
                            const projects = getProjectsForDay(emp.id, day);

                            return (
                              <TableCell key={day} className={`py-1 px-1 text-center ${isWeekStart ? "border-l border-border/40" : ""} ${getCellBg(total)}`}>
                                <div className="flex flex-col items-center gap-0.5">
                                  {/* Project color bar */}
                                  {projects.length > 0 && (
                                    <div className="flex w-full h-1.5 rounded-full overflow-hidden gap-px">
                                      {projects.map((p, pi) => (
                                        <div
                                          key={pi}
                                          className={`h-full ${projectColorMap[p.project] || "bg-muted-foreground"}`}
                                          style={{ flex: p.hours }}
                                          title={`${p.project}: ${p.hours}h`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                  <span className={`text-xs font-semibold ${total > DAILY_CAPACITY ? "text-destructive" : total > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                                    {total > 0 ? `${total}h` : "—"}
                                  </span>
                                  {total > 0 && (
                                    <span className={`text-[9px] leading-none ${remaining < 0 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                                      {remaining < 0 && <AlertTriangle className="h-2.5 w-2.5 inline mr-0.5" />}
                                      {remaining}h left
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            );
                          })}
                          <TableCell className="py-1 text-center">
                            <span className="text-xs font-bold">{empTotal}h</span>
                          </TableCell>
                        </TableRow>

                        {/* Expanded: project-wise breakdown */}
                        {isExpanded && (() => {
                          // Group all allocations by project for this employee
                          const projectMap: Record<string, { sprint: string; tasks: Record<string, Record<string, number>> }> = {};
                          sprints.forEach(sprint => {
                            sprint.tasks.forEach(task => {
                              task.assignees.forEach(a => {
                                if (a.employeeId !== emp.id) return;
                                if (filterProject !== "all" && sprint.project !== filterProject) return;
                                if (!projectMap[sprint.project]) {
                                  projectMap[sprint.project] = { sprint: sprint.name, tasks: {} };
                                }
                                if (!projectMap[sprint.project].tasks[task.name]) {
                                  projectMap[sprint.project].tasks[task.name] = {};
                                }
                                Object.entries(a.dayHours).forEach(([day, hours]) => {
                                  if (hours > 0) {
                                    projectMap[sprint.project].tasks[task.name][day] =
                                      (projectMap[sprint.project].tasks[task.name][day] || 0) + hours;
                                  }
                                });
                              });
                            });
                          });

                          return Object.entries(projectMap).map(([project, data]) => (
                            <React.Fragment key={`${emp.id}-${project}`}>
                              {/* Project row */}
                              <TableRow className="border-0 hover:bg-muted/10">
                                <TableCell className="py-1 sticky left-0 bg-background z-10 pl-10">
                                  <div className="flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded ${projectColorMap[project] || "bg-muted-foreground"}`} />
                                    <span className="text-[11px] font-semibold text-foreground">{project}</span>
                                    <span className="text-[10px] text-muted-foreground">({data.sprint})</span>
                                  </div>
                                </TableCell>
                                {allWorkingDays.map((day, i) => {
                                  const isWeekStart = hasMultipleWeeks && i > 0 && weeks.some(w => w.days[0] === day);
                                  const projectTotal = Object.values(data.tasks).reduce((s, t) => s + (t[day] || 0), 0);
                                  return (
                                    <TableCell key={day} className={`py-0.5 px-1 text-center ${isWeekStart ? "border-l border-border/40" : ""}`}>
                                      <span className={`text-[10px] ${projectTotal > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                                        {projectTotal > 0 ? `${projectTotal}h` : ""}
                                      </span>
                                    </TableCell>
                                  );
                                })}
                                <TableCell className="py-0.5 text-center">
                                  <span className="text-[10px] font-semibold">
                                    {Object.values(data.tasks).reduce((s, t) => s + Object.values(t).reduce((a, b) => a + b, 0), 0)}h
                                  </span>
                                </TableCell>
                              </TableRow>
                              {/* Task rows under project */}
                              {Object.entries(data.tasks).map(([taskName, taskDays]) => (
                                <TableRow key={`${emp.id}-${project}-${taskName}`} className="border-0 hover:bg-muted/10">
                                  <TableCell className="py-0.5 sticky left-0 bg-background z-10 pl-16">
                                    <div className="flex items-center gap-1.5">
                                      <ListChecks className="h-2.5 w-2.5 text-muted-foreground" />
                                      <span className="text-[10px] text-muted-foreground">{taskName}</span>
                                    </div>
                                  </TableCell>
                                  {allWorkingDays.map((day, i) => {
                                    const isWeekStart = hasMultipleWeeks && i > 0 && weeks.some(w => w.days[0] === day);
                                    const hrs = taskDays[day] || 0;
                                    return (
                                      <TableCell key={day} className={`py-0.5 px-1 text-center ${isWeekStart ? "border-l border-border/40" : ""}`}>
                                        <span className={`text-[10px] ${hrs > 0 ? "text-muted-foreground" : ""}`}>
                                          {hrs > 0 ? `${hrs}h` : ""}
                                        </span>
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell className="py-0.5 text-center">
                                    <span className="text-[10px] text-muted-foreground">
                                      {Object.values(taskDays).reduce((a, b) => a + b, 0)}h
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </React.Fragment>
                          ));
                        })()}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Project Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Project Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(projectColorMap).map(([project, color]) => (
                <div key={project} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${color}`} />
                  <span className="text-xs text-muted-foreground">{project}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ResourceAllocation;
