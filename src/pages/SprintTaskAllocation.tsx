import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Calendar, Clock, User, Users, ListChecks, Save } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const DAILY_CAPACITY = 8;
const WEEKLY_CAPACITY = 40;

// --- Mock Data ---
const projectsData = [
  { id: 1, name: "Universal Software" },
  { id: 2, name: "Super App" },
  { id: 3, name: "Go Live" },
];

interface MockSprint {
  id: number;
  name: string;
  project: string;
  startDate: string;
  endDate: string;
  status: string;
}

const sprintsData: MockSprint[] = [
  { id: 1, name: "Sprint 1", project: "Universal Software", startDate: "2025-02-24", endDate: "2025-02-28", status: "Active" },
  { id: 2, name: "Sprint 2", project: "Universal Software", startDate: "2025-03-03", endDate: "2025-03-07", status: "Planned" },
  { id: 3, name: "Release Sprint", project: "Go Live", startDate: "2025-03-10", endDate: "2025-03-28", status: "Planned" },
  { id: 4, name: "Sprint 1", project: "Super App", startDate: "2025-02-24", endDate: "2025-02-28", status: "Active" },
];

interface TaskData {
  id: number;
  name: string;
  project: string;
  estimatedHours: number;
  priority: string;
  employees: { id: string; name: string; role: string }[];
}

const tasksData: TaskData[] = [
  { id: 1, name: "User Auth Flow", project: "Universal Software", estimatedHours: 16, priority: "High",
    employees: [{ id: "e1", name: "John Doe", role: "Developer" }, { id: "e2", name: "Ravi Kumar", role: "QA" }] },
  { id: 2, name: "Dashboard API", project: "Universal Software", estimatedHours: 12, priority: "High",
    employees: [{ id: "e4", name: "Priya Sharma", role: "Developer" }] },
  { id: 3, name: "Profile Page", project: "Universal Software", estimatedHours: 8, priority: "Medium",
    employees: [{ id: "e2", name: "Ravi Kumar", role: "Developer" }] },
  { id: 4, name: "Report Module", project: "Universal Software", estimatedHours: 20, priority: "High",
    employees: [{ id: "e3", name: "Mehul Patel", role: "Developer" }, { id: "e5", name: "Amit Singh", role: "QA" }] },
  { id: 5, name: "Payment Gateway", project: "Super App", estimatedHours: 24, priority: "Critical",
    employees: [{ id: "e4", name: "Priya Sharma", role: "Developer" }, { id: "e6", name: "Sneha Reddy", role: "Tester" }] },
  { id: 6, name: "CI/CD Pipeline", project: "Go Live", estimatedHours: 40, priority: "High",
    employees: [{ id: "e3", name: "Mehul Patel", role: "DevOps" }, { id: "e1", name: "John Doe", role: "Developer" }] },
  { id: 7, name: "Performance Testing", project: "Go Live", estimatedHours: 30, priority: "High",
    employees: [{ id: "e5", name: "Amit Singh", role: "QA" }, { id: "e2", name: "Ravi Kumar", role: "QA" }] },
  { id: 8, name: "Security Audit", project: "Go Live", estimatedHours: 20, priority: "Critical",
    employees: [{ id: "e6", name: "Sneha Reddy", role: "Security" }] },
  { id: 9, name: "UAT & Bug Fixes", project: "Go Live", estimatedHours: 44, priority: "High",
    employees: [{ id: "e4", name: "Priya Sharma", role: "Developer" }, { id: "e6", name: "Sneha Reddy", role: "Tester" }] },
];

// Simulated existing allocations across sprints
const existingAllocations: Record<string, Record<string, number>> = {
  // employeeId -> { date -> hours }
  "e1": { "2025-02-24": 4, "2025-02-25": 6, "2025-02-26": 5, "2025-02-27": 3, "2025-02-28": 2 },
  "e2": { "2025-02-24": 3, "2025-02-25": 4, "2025-02-26": 2 },
  "e3": { "2025-02-24": 8, "2025-02-25": 7, "2025-02-26": 6, "2025-02-27": 4, "2025-02-28": 5 },
  "e4": { "2025-02-24": 5, "2025-02-25": 5, "2025-02-26": 4, "2025-02-27": 6, "2025-02-28": 4 },
};

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

const distributeHours = (hours: number, days: string[]): Record<string, number> => {
  const r: Record<string, number> = {};
  if (!days.length) return r;
  const per = Math.floor(hours / days.length);
  const rem = hours - per * days.length;
  days.forEach((d, i) => { r[d] = per + (i < rem ? 1 : 0); });
  return r;
};

const SprintTaskAllocation = () => {
  const [selectedSprint, setSelectedSprint] = useState("");
  const [selectedTask, setSelectedTask] = useState("");

  // Day-wise allocation state: employeeId -> { date -> hours }
  const [dayHours, setDayHours] = useState<Record<string, Record<string, number>>>({});

  const sprint = sprintsData.find(s => s.id.toString() === selectedSprint);
  const filteredTasks = sprint ? tasksData.filter(t => t.project === sprint.project) : [];
  const task = tasksData.find(t => t.id.toString() === selectedTask);

  const workingDays = useMemo(() => {
    if (!sprint) return [];
    return getWorkingDays(sprint.startDate, sprint.endDate);
  }, [sprint]);

  const weeks = useMemo(() => groupDaysByWeek(workingDays), [workingDays]);
  const hasMultipleWeeks = weeks.length > 1;

  // When task changes, pre-fill with distributed hours
  const handleTaskChange = (taskId: string) => {
    setSelectedTask(taskId);
    const t = tasksData.find(tk => tk.id.toString() === taskId);
    if (t && workingDays.length > 0) {
      const empCount = t.employees.length;
      const hoursPerEmp = Math.ceil(t.estimatedHours / empCount);
      const newDayHours: Record<string, Record<string, number>> = {};
      t.employees.forEach(emp => {
        newDayHours[emp.id] = distributeHours(hoursPerEmp, workingDays);
      });
      setDayHours(newDayHours);
    } else {
      setDayHours({});
    }
  };

  const getExistingAllocation = (empId: string, day: string) => {
    return existingAllocations[empId]?.[day] || 0;
  };

  const updateHours = (empId: string, day: string, hours: number) => {
    const existing = getExistingAllocation(empId, day);
    const currentFromOtherTasks = existing;
    const maxAllowed = DAILY_CAPACITY - currentFromOtherTasks;
    const clamped = Math.min(Math.max(0, hours), maxAllowed);

    setDayHours(prev => ({
      ...prev,
      [empId]: { ...(prev[empId] || {}), [day]: clamped },
    }));

    if (hours > maxAllowed) {
      toast.warning(`Max ${maxAllowed}h available for this day (${DAILY_CAPACITY}h - ${currentFromOtherTasks}h already allocated)`);
    }
  };

  const handleSave = () => {
    toast.success("Task allocation saved successfully!");
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical": return <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px]">{priority}</Badge>;
      case "High": return <Badge className="bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30 text-[10px]">{priority}</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">{priority}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Sprint Task Allocation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Assign employee hours day-wise for sprint tasks
          </p>
        </div>

        {/* Selection Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Sprint *</Label>
                <Select value={selectedSprint} onValueChange={(v) => { setSelectedSprint(v); setSelectedTask(""); setDayHours({}); }}>
                  <SelectTrigger className="h-9 text-sm bg-background"><SelectValue placeholder="Select sprint" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    {sprintsData.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name} — {s.project}
                        <span className="text-muted-foreground ml-1 text-[10px]">({s.status})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Task *</Label>
                <Select value={selectedTask} onValueChange={handleTaskChange} disabled={!sprint}>
                  <SelectTrigger className="h-9 text-sm bg-background"><SelectValue placeholder={sprint ? "Select task" : "Select sprint first"} /></SelectTrigger>
                  <SelectContent className="bg-background">
                    {filteredTasks.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name} ({t.estimatedHours}h)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Task Estimated Hours</Label>
                <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-semibold">
                  {task ? `${task.estimatedHours}h` : "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sprint Info Bar */}
        {sprint && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Sprint</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{sprint.name}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[hsl(var(--info))]/5 to-[hsl(var(--info))]/10 border-[hsl(var(--info))]/20">
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Duration</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{workingDays.length} working days</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20">
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Capacity/Employee</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{workingDays.length * DAILY_CAPACITY}h</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{sprint.status}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employee Allocation Grid */}
        {task && sprint && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Employee Day-wise Allocation
                  <span className="text-muted-foreground font-normal ml-1">— {task.name}</span>
                  {getPriorityBadge(task.priority)}
                </CardTitle>
                <Button size="sm" className="gap-1.5" onClick={handleSave}>
                  <Save className="h-3.5 w-3.5" />
                  Save Allocation
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Employee Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {task.employees.map(emp => {
                  const empHours = dayHours[emp.id] || {};
                  const totalAllocated = Object.values(empHours).reduce((s, h) => s + h, 0);
                  const sprintCapacity = workingDays.length * DAILY_CAPACITY;
                  const totalExisting = workingDays.reduce((s, d) => s + getExistingAllocation(emp.id, d), 0);
                  const remaining = sprintCapacity - totalExisting - totalAllocated;
                  const utilPct = Math.round(((totalExisting + totalAllocated) / sprintCapacity) * 100);

                  return (
                    <div key={emp.id} className="rounded-lg border p-3 bg-muted/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{emp.name}</p>
                          <p className="text-[10px] text-muted-foreground">{emp.role}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div>
                          <p className="text-muted-foreground">Task Hours</p>
                          <p className="text-sm font-bold text-[hsl(var(--info))]">{totalAllocated}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sprint Cap.</p>
                          <p className="text-sm font-bold">{sprintCapacity}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining</p>
                          <p className={`text-sm font-bold ${remaining < 0 ? "text-destructive" : "text-[hsl(var(--success))]"}`}>{remaining}h</p>
                        </div>
                      </div>
                      <Progress value={Math.min(100, utilPct)} className="h-1.5 mt-2" />
                      <p className="text-[10px] text-muted-foreground text-right mt-0.5">{utilPct}% utilized</p>
                    </div>
                  );
                })}
              </div>

              {/* Day-wise Grid */}
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    {hasMultipleWeeks && (
                      <TableRow className="hover:bg-transparent border-0">
                        <TableHead className="sticky left-0 bg-background z-10 min-w-[140px]" />
                        <TableHead className="sticky left-[140px] bg-background z-10 min-w-[60px]" />
                        <TableHead className="sticky left-[200px] bg-background z-10 min-w-[80px]" />
                        {weeks.map((week, wi) => (
                          <TableHead key={wi} colSpan={week.days.length} className="text-[10px] py-1 h-auto text-center font-bold text-primary border-l border-r border-border/40">
                            {week.weekLabel}
                            <span className="text-muted-foreground font-normal ml-1">
                              ({formatShortDay(week.days[0])} – {formatShortDay(week.days[week.days.length - 1])})
                            </span>
                          </TableHead>
                        ))}
                        <TableHead className="min-w-[70px]" />
                      </TableRow>
                    )}
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] py-1.5 h-auto sticky left-0 bg-background z-10 min-w-[140px]">Employee</TableHead>
                      <TableHead className="text-[10px] py-1.5 h-auto sticky left-[140px] bg-background z-10 min-w-[60px] text-center">Role</TableHead>
                      <TableHead className="text-[10px] py-1.5 h-auto sticky left-[200px] bg-background z-10 min-w-[80px] text-center">Task Hours</TableHead>
                      {workingDays.map((day, i) => {
                        const isWeekStart = hasMultipleWeeks && i > 0 && weeks.some(w => w.days[0] === day);
                        return (
                          <TableHead key={day} className={`text-[10px] py-1.5 h-auto text-center whitespace-nowrap min-w-[76px] ${isWeekStart ? "border-l border-border/40" : ""}`}>
                            {formatShortDay(day)}
                          </TableHead>
                        );
                      })}
                      <TableHead className="text-[10px] py-1.5 h-auto text-center min-w-[70px] font-semibold">Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {task.employees.map(emp => {
                      const empHours = dayHours[emp.id] || {};
                      const totalAllocated = Object.values(empHours).reduce((s, h) => s + h, 0);
                      const sprintCapacity = workingDays.length * DAILY_CAPACITY;
                      const totalExisting = workingDays.reduce((s, d) => s + getExistingAllocation(emp.id, d), 0);
                      const remaining = sprintCapacity - totalExisting - totalAllocated;

                      return (
                        <TableRow key={emp.id} className="hover:bg-muted/20">
                          <TableCell className="py-1.5 sticky left-0 bg-background z-10">
                            <div className="flex items-center gap-1.5">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-2.5 w-2.5 text-primary" />
                              </div>
                              <span className="text-xs font-medium whitespace-nowrap">{emp.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 text-center text-[10px] text-muted-foreground sticky left-[140px] bg-background z-10">{emp.role}</TableCell>
                          <TableCell className="py-1.5 text-center sticky left-[200px] bg-background z-10">
                            <Badge variant="outline" className="text-[10px] font-mono">{totalAllocated}h</Badge>
                          </TableCell>
                          {workingDays.map((day, i) => {
                            const thisHours = empHours[day] || 0;
                            const existingHrs = getExistingAllocation(emp.id, day);
                            const availableToday = DAILY_CAPACITY - existingHrs;
                            const remainingToday = availableToday - thisHours;
                            const isWeekStart = hasMultipleWeeks && i > 0 && weeks.some(w => w.days[0] === day);

                            return (
                              <TableCell key={day} className={`py-1 px-1 text-center ${isWeekStart ? "border-l border-border/40" : ""}`}>
                                <div className="flex flex-col items-center gap-0.5">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={availableToday}
                                    value={thisHours || ""}
                                    placeholder="0"
                                    onChange={e => updateHours(emp.id, day, Number(e.target.value) || 0)}
                                    className={`h-7 w-14 text-[11px] text-center p-0 mx-auto ${remainingToday < 0 ? "border-destructive" : ""}`}
                                  />
                                  <span className={`text-[9px] leading-none ${remainingToday < 0 ? "text-destructive font-semibold" : existingHrs > 0 ? "text-[hsl(var(--warning))]" : "text-muted-foreground"}`}>
                                    {remainingToday < 0 && <AlertTriangle className="h-2.5 w-2.5 inline mr-0.5" />}
                                    {existingHrs > 0 ? `${existingHrs}h used · ${remainingToday}h left` : `${remainingToday}h left`}
                                  </span>
                                </div>
                              </TableCell>
                            );
                          })}
                          <TableCell className="py-1.5 text-center">
                            <span className={`text-xs font-bold ${remaining < 0 ? "text-destructive" : "text-[hsl(var(--success))]"}`}>
                              {remaining}h
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Validation Summary */}
              {task.employees.some(emp => {
                const empHours = dayHours[emp.id] || {};
                return workingDays.some(day => {
                  const existing = getExistingAllocation(emp.id, day);
                  return (empHours[day] || 0) + existing > DAILY_CAPACITY;
                });
              }) && (
                <div className="mt-3 flex items-center gap-2 text-destructive text-xs bg-destructive/5 border border-destructive/20 rounded-md px-3 py-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Some employees have over-allocated hours. Please adjust day-wise allocation to stay within {DAILY_CAPACITY}h/day limit.</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!task && (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center">
              <ListChecks className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a sprint and task to view the employee allocation grid</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SprintTaskAllocation;
