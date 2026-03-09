import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Users, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// --- Mock Data (consistent with Sprints.tsx) ---
const allEmployees = [
  { id: "e1", name: "John Doe", role: "Developer" },
  { id: "e2", name: "Ravi Kumar", role: "QA" },
  { id: "e3", name: "Mehul Patel", role: "DevOps" },
  { id: "e4", name: "Priya Sharma", role: "Developer" },
  { id: "e5", name: "Amit Singh", role: "QA" },
  { id: "e6", name: "Sneha Reddy", role: "Tester" },
];

interface SprintAllocation {
  sprintId: number;
  sprintName: string;
  project: string;
  startDate: string;
  endDate: string;
  status: string;
  tasks: {
    taskName: string;
    priority: string;
    dailyHours: Record<string, number>; // date -> hours
  }[];
}

// Mock sprint allocations per employee
const employeeSprintAllocations: Record<string, SprintAllocation[]> = {
  "e1": [
    {
      sprintId: 1, sprintName: "Sprint 1", project: "Universal Software",
      startDate: "2026-02-23", endDate: "2026-03-06", status: "Active",
      tasks: [
        { taskName: "User Auth Flow", priority: "High", dailyHours: { "2026-02-23": 4, "2026-02-24": 4, "2026-02-25": 3, "2026-02-26": 4, "2026-02-27": 3, "2026-03-02": 4, "2026-03-03": 3, "2026-03-04": 4, "2026-03-05": 3, "2026-03-06": 2 } },
        { taskName: "Dashboard API", priority: "High", dailyHours: { "2026-02-23": 2, "2026-02-24": 2, "2026-02-25": 3, "2026-02-26": 2, "2026-02-27": 3, "2026-03-02": 2, "2026-03-03": 3, "2026-03-04": 2, "2026-03-05": 3, "2026-03-06": 2 } },
      ],
    },
    {
      sprintId: 3, sprintName: "Release Sprint", project: "Go Live",
      startDate: "2026-03-09", endDate: "2026-03-27", status: "Planned",
      tasks: [
        { taskName: "CI/CD Pipeline", priority: "High", dailyHours: { "2026-03-09": 4, "2026-03-10": 4, "2026-03-11": 4, "2026-03-12": 4, "2026-03-13": 4, "2026-03-16": 4, "2026-03-17": 4, "2026-03-18": 4, "2026-03-19": 4, "2026-03-20": 4, "2026-03-23": 3, "2026-03-24": 3, "2026-03-25": 3, "2026-03-26": 3, "2026-03-27": 3 } },
      ],
    },
  ],
  "e2": [
    {
      sprintId: 1, sprintName: "Sprint 1", project: "Universal Software",
      startDate: "2026-02-23", endDate: "2026-03-06", status: "Active",
      tasks: [
        { taskName: "User Auth Flow", priority: "High", dailyHours: { "2026-02-23": 3, "2026-02-24": 3, "2026-02-25": 2, "2026-02-26": 3, "2026-02-27": 2, "2026-03-02": 3, "2026-03-03": 2 } },
        { taskName: "Profile Page", priority: "Medium", dailyHours: { "2026-03-04": 4, "2026-03-05": 4, "2026-03-06": 4 } },
      ],
    },
    {
      sprintId: 3, sprintName: "Release Sprint", project: "Go Live",
      startDate: "2026-03-09", endDate: "2026-03-27", status: "Planned",
      tasks: [
        { taskName: "Performance Testing", priority: "High", dailyHours: { "2026-03-09": 6, "2026-03-10": 6, "2026-03-11": 6, "2026-03-12": 6, "2026-03-13": 6, "2026-03-16": 5, "2026-03-17": 5, "2026-03-18": 5, "2026-03-19": 5, "2026-03-20": 5 } },
      ],
    },
  ],
  "e3": [
    {
      sprintId: 2, sprintName: "Sprint 2", project: "Universal Software",
      startDate: "2026-03-09", endDate: "2026-03-20", status: "Planned",
      tasks: [
        { taskName: "Report Module", priority: "High", dailyHours: { "2026-03-09": 4, "2026-03-10": 4, "2026-03-11": 4, "2026-03-12": 4, "2026-03-13": 4, "2026-03-16": 4, "2026-03-17": 4, "2026-03-18": 4, "2026-03-19": 4, "2026-03-20": 4 } },
      ],
    },
    {
      sprintId: 3, sprintName: "Release Sprint", project: "Go Live",
      startDate: "2026-03-09", endDate: "2026-03-27", status: "Planned",
      tasks: [
        { taskName: "CI/CD Pipeline", priority: "High", dailyHours: { "2026-03-09": 4, "2026-03-10": 4, "2026-03-11": 4, "2026-03-12": 4, "2026-03-13": 4, "2026-03-16": 4, "2026-03-17": 4, "2026-03-18": 4, "2026-03-19": 4, "2026-03-20": 4, "2026-03-23": 4, "2026-03-24": 4, "2026-03-25": 4, "2026-03-26": 4, "2026-03-27": 4 } },
      ],
    },
  ],
  "e4": [
    {
      sprintId: 1, sprintName: "Sprint 1", project: "Universal Software",
      startDate: "2026-02-23", endDate: "2026-03-06", status: "Active",
      tasks: [
        { taskName: "Dashboard API", priority: "High", dailyHours: { "2026-02-23": 5, "2026-02-24": 5, "2026-02-25": 4, "2026-02-26": 5, "2026-02-27": 4, "2026-03-02": 5, "2026-03-03": 4, "2026-03-04": 5, "2026-03-05": 4, "2026-03-06": 4 } },
      ],
    },
    {
      sprintId: 4, sprintName: "Sprint 1", project: "Super App",
      startDate: "2026-02-23", endDate: "2026-03-06", status: "Active",
      tasks: [
        { taskName: "Payment Gateway", priority: "Critical", dailyHours: { "2026-02-23": 3, "2026-02-24": 3, "2026-02-25": 4, "2026-02-26": 3, "2026-02-27": 4, "2026-03-02": 3, "2026-03-03": 4, "2026-03-04": 3, "2026-03-05": 4, "2026-03-06": 4 } },
      ],
    },
  ],
  "e5": [
    {
      sprintId: 2, sprintName: "Sprint 2", project: "Universal Software",
      startDate: "2026-03-09", endDate: "2026-03-20", status: "Planned",
      tasks: [
        { taskName: "Report Module", priority: "High", dailyHours: { "2026-03-09": 4, "2026-03-10": 4, "2026-03-11": 4, "2026-03-12": 4, "2026-03-13": 4, "2026-03-16": 4, "2026-03-17": 4, "2026-03-18": 4, "2026-03-19": 4, "2026-03-20": 4 } },
      ],
    },
    {
      sprintId: 3, sprintName: "Release Sprint", project: "Go Live",
      startDate: "2026-03-09", endDate: "2026-03-27", status: "Planned",
      tasks: [
        { taskName: "Performance Testing", priority: "High", dailyHours: { "2026-03-09": 4, "2026-03-10": 4, "2026-03-11": 4, "2026-03-12": 4, "2026-03-13": 4, "2026-03-16": 3, "2026-03-17": 3, "2026-03-18": 3, "2026-03-19": 3, "2026-03-20": 3 } },
      ],
    },
  ],
  "e6": [
    {
      sprintId: 3, sprintName: "Release Sprint", project: "Go Live",
      startDate: "2026-03-09", endDate: "2026-03-27", status: "Planned",
      tasks: [
        { taskName: "Security Audit", priority: "Critical", dailyHours: { "2026-03-09": 4, "2026-03-10": 4, "2026-03-11": 4, "2026-03-12": 4, "2026-03-13": 4, "2026-03-16": 4, "2026-03-17": 4, "2026-03-18": 4, "2026-03-19": 4, "2026-03-20": 4 } },
        { taskName: "UAT & Bug Fixes", priority: "High", dailyHours: { "2026-03-09": 4, "2026-03-10": 4, "2026-03-11": 4, "2026-03-12": 4, "2026-03-13": 4, "2026-03-16": 4, "2026-03-17": 4, "2026-03-18": 4, "2026-03-19": 4, "2026-03-20": 4, "2026-03-23": 4, "2026-03-24": 4, "2026-03-25": 4, "2026-03-26": 4, "2026-03-27": 4 } },
      ],
    },
    {
      sprintId: 4, sprintName: "Sprint 1", project: "Super App",
      startDate: "2026-02-23", endDate: "2026-03-06", status: "Active",
      tasks: [
        { taskName: "Payment Gateway", priority: "Critical", dailyHours: { "2026-02-23": 4, "2026-02-24": 4, "2026-02-25": 4, "2026-02-26": 4, "2026-02-27": 4, "2026-03-02": 4, "2026-03-03": 4, "2026-03-04": 4, "2026-03-05": 4, "2026-03-06": 4 } },
      ],
    },
  ],
};

const DAILY_CAPACITY = 8;

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
      if (currentWeek.length > 0) weeks.push({ weekLabel: `Week ${weeks.length + 1}`, days: currentWeek });
      currentWeek = [day];
      currentWeekNum = weekNum;
    } else {
      currentWeek.push(day);
    }
  });
  if (currentWeek.length > 0) weeks.push({ weekLabel: `Week ${weeks.length + 1}`, days: currentWeek });
  return weeks;
};

const projectColors: Record<string, string> = {
  "Universal Software": "bg-primary/80",
  "Super App": "bg-[hsl(var(--warning))]/80",
  "Go Live": "bg-[hsl(var(--success))]/80",
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "Critical": return <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px]">{priority}</Badge>;
    case "High": return <Badge className="bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30 text-[10px]">{priority}</Badge>;
    default: return <Badge variant="outline" className="text-[10px]">{priority}</Badge>;
  }
};

const SprintTaskAllocation = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const employee = allEmployees.find(e => e.id === selectedEmployee);
  const allocations = selectedEmployee ? (employeeSprintAllocations[selectedEmployee] || []) : [];

  // Filter sprints that overlap with selected date range
  const filteredAllocations = useMemo(() => {
    if (!fromDate || !toDate) return allocations;
    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];
    return allocations.filter(a => a.startDate <= to && a.endDate >= from);
  }, [allocations, fromDate, toDate]);

  // Compute the combined working days for the filtered range
  const dateRange = useMemo(() => {
    if (!fromDate || !toDate) return { days: [] as string[], weeks: [] as { weekLabel: string; days: string[] }[] };
    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];
    const days = getWorkingDays(from, to);
    const weeks = groupDaysByWeek(days);
    return { days, weeks };
  }, [fromDate, toDate]);

  const hasResults = selectedEmployee && fromDate && toDate && filteredAllocations.length > 0;

  // Compute daily totals across all sprints
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredAllocations.forEach(a => {
      a.tasks.forEach(t => {
        Object.entries(t.dailyHours).forEach(([day, hrs]) => {
          if (dateRange.days.includes(day)) {
            totals[day] = (totals[day] || 0) + hrs;
          }
        });
      });
    });
    return totals;
  }, [filteredAllocations, dateRange.days]);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Sprint Task Allocation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select an employee and date range to view their sprint assignments
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Employee *</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="h-9 text-sm bg-background">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {allEmployees.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} — {e.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">From Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-9 w-full justify-start text-left text-sm font-normal", !fromDate && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-3.5 w-3.5" />
                      {fromDate ? format(fromDate, "dd MMM yyyy") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={fromDate} onSelect={setFromDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">To Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-9 w-full justify-start text-left text-sm font-normal", !toDate && "text-muted-foreground")}>
                      <Calendar className="mr-2 h-3.5 w-3.5" />
                      {toDate ? format(toDate, "dd MMM yyyy") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={toDate} onSelect={setToDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasResults && employee && (
          <>
            {/* Employee Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Employee</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{employee.name}</p>
                  <p className="text-[10px] text-muted-foreground">{employee.role}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[hsl(var(--info))]/5 to-[hsl(var(--info))]/10 border-[hsl(var(--info))]/20">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Active Sprints</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{filteredAllocations.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Working Days</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{dateRange.days.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
                <CardContent className="p-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total Allocated</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {Object.values(dailyTotals).reduce((s, h) => s + h, 0)}h / {dateRange.days.length * DAILY_CAPACITY}h
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sprint-wise breakdown with day grid */}
            {filteredAllocations.map(alloc => {
              // Only show days within the filtered range
              const sprintDays = dateRange.days.filter(d => d >= alloc.startDate && d <= alloc.endDate);
              const sprintWeeks = groupDaysByWeek(sprintDays);
              const hasMultipleWeeks = sprintWeeks.length > 1;

              return (
                <Card key={alloc.sprintId}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`h-2 w-2 rounded-full ${projectColors[alloc.project] || "bg-muted-foreground"}`} />
                      <CardTitle className="text-sm font-semibold">{alloc.sprintName}</CardTitle>
                      <span className="text-xs text-muted-foreground">— {alloc.project}</span>
                      <Badge variant={alloc.status === "Active" ? "default" : "outline"} className="text-[10px] ml-auto">
                        {alloc.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(alloc.startDate), "dd MMM")} – {format(new Date(alloc.endDate), "dd MMM yyyy")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          {hasMultipleWeeks && (
                            <TableRow className="hover:bg-transparent border-0">
                              <TableHead className="sticky left-0 bg-background z-10 min-w-[160px]" />
                              <TableHead className="sticky left-[160px] bg-background z-10 min-w-[60px]" />
                              {sprintWeeks.map((week, wi) => (
                                <TableHead key={wi} colSpan={week.days.length} className="text-[10px] py-1 h-auto text-center font-bold text-primary border-l border-r border-border/40">
                                  {week.weekLabel}
                                </TableHead>
                              ))}
                              <TableHead className="min-w-[60px]" />
                            </TableRow>
                          )}
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-[10px] py-1.5 h-auto sticky left-0 bg-background z-10 min-w-[160px]">Task</TableHead>
                            <TableHead className="text-[10px] py-1.5 h-auto sticky left-[160px] bg-background z-10 min-w-[60px] text-center">Priority</TableHead>
                            {sprintDays.map((day, i) => {
                              const isWeekStart = hasMultipleWeeks && i > 0 && sprintWeeks.some(w => w.days[0] === day);
                              return (
                                <TableHead key={day} className={`text-[10px] py-1.5 h-auto text-center whitespace-nowrap min-w-[56px] ${isWeekStart ? "border-l border-border/40" : ""}`}>
                                  {formatShortDay(day)}
                                </TableHead>
                              );
                            })}
                            <TableHead className="text-[10px] py-1.5 h-auto text-center min-w-[60px] font-semibold">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {alloc.tasks.map((task, ti) => {
                            const taskTotal = sprintDays.reduce((s, d) => s + (task.dailyHours[d] || 0), 0);
                            return (
                              <TableRow key={ti} className="hover:bg-muted/20">
                                <TableCell className="py-1.5 sticky left-0 bg-background z-10">
                                  <span className="text-xs font-medium">{task.taskName}</span>
                                </TableCell>
                                <TableCell className="py-1.5 text-center sticky left-[160px] bg-background z-10">
                                  {getPriorityBadge(task.priority)}
                                </TableCell>
                                {sprintDays.map((day, i) => {
                                  const hrs = task.dailyHours[day] || 0;
                                  const isWeekStart = hasMultipleWeeks && i > 0 && sprintWeeks.some(w => w.days[0] === day);
                                  return (
                                    <TableCell key={day} className={`py-1.5 text-center text-xs ${isWeekStart ? "border-l border-border/40" : ""}`}>
                                      {hrs > 0 ? (
                                        <span className="font-semibold">{hrs}h</span>
                                      ) : (
                                        <span className="text-muted-foreground/40">—</span>
                                      )}
                                    </TableCell>
                                  );
                                })}
                                <TableCell className="py-1.5 text-center">
                                  <Badge variant="outline" className="text-[10px] font-mono">{taskTotal}h</Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {/* Sprint total row */}
                          <TableRow className="bg-muted/30 hover:bg-muted/40 font-semibold">
                            <TableCell className="py-1.5 sticky left-0 bg-muted/30 z-10 text-xs">Sprint Total</TableCell>
                            <TableCell className="py-1.5 sticky left-[160px] bg-muted/30 z-10" />
                            {sprintDays.map((day, i) => {
                              const dayTotal = alloc.tasks.reduce((s, t) => s + (t.dailyHours[day] || 0), 0);
                              const isWeekStart = hasMultipleWeeks && i > 0 && sprintWeeks.some(w => w.days[0] === day);
                              const isOver = dayTotal > DAILY_CAPACITY;
                              return (
                                <TableCell key={day} className={`py-1.5 text-center text-xs ${isWeekStart ? "border-l border-border/40" : ""} ${isOver ? "text-destructive" : ""}`}>
                                  {dayTotal > 0 ? `${dayTotal}h` : "—"}
                                </TableCell>
                              );
                            })}
                            <TableCell className="py-1.5 text-center text-xs">
                              {alloc.tasks.reduce((s, t) => s + sprintDays.reduce((s2, d) => s2 + (t.dailyHours[d] || 0), 0), 0)}h
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Daily capacity overview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Daily Capacity Overview (All Sprints Combined)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      {dateRange.weeks.length > 1 && (
                        <TableRow className="hover:bg-transparent border-0">
                          <TableHead className="sticky left-0 bg-background z-10 min-w-[100px]" />
                          {dateRange.weeks.map((week, wi) => (
                            <TableHead key={wi} colSpan={week.days.length} className="text-[10px] py-1 h-auto text-center font-bold text-primary border-l border-r border-border/40">
                              {week.weekLabel}
                            </TableHead>
                          ))}
                        </TableRow>
                      )}
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[10px] py-1.5 h-auto sticky left-0 bg-background z-10 min-w-[100px]" />
                        {dateRange.days.map((day, i) => {
                          const isWeekStart = dateRange.weeks.length > 1 && i > 0 && dateRange.weeks.some(w => w.days[0] === day);
                          return (
                            <TableHead key={day} className={`text-[10px] py-1.5 h-auto text-center whitespace-nowrap min-w-[56px] ${isWeekStart ? "border-l border-border/40" : ""}`}>
                              {formatShortDay(day)}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-muted/20">
                        <TableCell className="py-1.5 text-xs font-medium sticky left-0 bg-background z-10">Allocated</TableCell>
                        {dateRange.days.map((day, i) => {
                          const total = dailyTotals[day] || 0;
                          const isOver = total > DAILY_CAPACITY;
                          const isWeekStart = dateRange.weeks.length > 1 && i > 0 && dateRange.weeks.some(w => w.days[0] === day);
                          return (
                            <TableCell key={day} className={`py-1.5 text-center text-xs font-semibold ${isWeekStart ? "border-l border-border/40" : ""} ${isOver ? "text-destructive bg-destructive/5" : total > 0 ? "text-foreground" : "text-muted-foreground/40"}`}>
                              {total > 0 ? `${total}h` : "—"}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      <TableRow className="hover:bg-muted/20">
                        <TableCell className="py-1.5 text-xs font-medium sticky left-0 bg-background z-10">Available</TableCell>
                        {dateRange.days.map((day, i) => {
                          const total = dailyTotals[day] || 0;
                          const available = DAILY_CAPACITY - total;
                          const isWeekStart = dateRange.weeks.length > 1 && i > 0 && dateRange.weeks.some(w => w.days[0] === day);
                          return (
                            <TableCell key={day} className={`py-1.5 text-center text-xs ${isWeekStart ? "border-l border-border/40" : ""} ${available < 0 ? "text-destructive font-semibold" : available > 0 ? "text-[hsl(var(--success))] font-semibold" : "text-muted-foreground/40"}`}>
                              {available !== DAILY_CAPACITY ? `${available}h` : `${DAILY_CAPACITY}h`}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* No results */}
        {selectedEmployee && fromDate && toDate && filteredAllocations.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center">
              <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No sprint assignments found for {employee?.name} in the selected date range</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {(!selectedEmployee || !fromDate || !toDate) && (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center">
              <User className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select an employee and date range to view sprint allocations</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SprintTaskAllocation;
