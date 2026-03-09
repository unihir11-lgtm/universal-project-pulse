import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, BarChart3, ChevronDown, ChevronRight, Clock, TrendingUp, User, Users, Layers } from "lucide-react";
import { useState, useMemo } from "react";

const DAILY_CAPACITY = 8;

const projectsData = [
  { id: 1, name: "Universal Software" },
  { id: 2, name: "Super App" },
  { id: 3, name: "Go Live" },
];

const sprintOptions = [
  { id: 1, name: "Sprint 1", project: "Universal Software", startDate: "2025-02-24", endDate: "2025-02-28" },
  { id: 2, name: "Sprint 2", project: "Universal Software", startDate: "2025-03-03", endDate: "2025-03-07" },
  { id: 3, name: "Release Sprint", project: "Go Live", startDate: "2025-03-10", endDate: "2025-03-28" },
  { id: 4, name: "Sprint 1", project: "Super App", startDate: "2025-02-24", endDate: "2025-02-28" },
];

interface EmployeeAllocation {
  employeeId: string;
  employeeName: string;
  dayAllocations: { date: string; hours: number; task: string }[];
}

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

// Mock allocation data
const mockAllocations: Record<number, EmployeeAllocation[]> = {
  1: [
    { employeeId: "e1", employeeName: "John Doe", dayAllocations: [
      { date: "2025-02-24", hours: 4, task: "User Auth Flow" }, { date: "2025-02-25", hours: 4, task: "User Auth Flow" },
      { date: "2025-02-26", hours: 4, task: "User Auth Flow" }, { date: "2025-02-27", hours: 4, task: "Dashboard API" },
      { date: "2025-02-28", hours: 3, task: "Dashboard API" },
    ]},
    { employeeId: "e2", employeeName: "Ravi Kumar", dayAllocations: [
      { date: "2025-02-24", hours: 2, task: "Profile Page" }, { date: "2025-02-25", hours: 2, task: "Profile Page" },
      { date: "2025-02-26", hours: 2, task: "Profile Page" }, { date: "2025-02-27", hours: 2, task: "Unit Tests" },
      { date: "2025-02-28", hours: 3, task: "Unit Tests" },
    ]},
    { employeeId: "e3", employeeName: "Mehul Patel", dayAllocations: [
      { date: "2025-02-24", hours: 8, task: "Report Module" }, { date: "2025-02-25", hours: 8, task: "Report Module" },
      { date: "2025-02-26", hours: 6, task: "Report Module" }, { date: "2025-02-27", hours: 6, task: "Bug Fixes" },
      { date: "2025-02-28", hours: 4, task: "Bug Fixes" },
    ]},
  ],
  3: [
    { employeeId: "e3", employeeName: "Mehul Patel", dayAllocations: [
      { date: "2025-03-10", hours: 6, task: "CI/CD Pipeline" }, { date: "2025-03-11", hours: 7, task: "CI/CD Pipeline" },
      { date: "2025-03-12", hours: 5, task: "CI/CD Pipeline" }, { date: "2025-03-13", hours: 4, task: "CI/CD Pipeline" },
      { date: "2025-03-14", hours: 3, task: "CI/CD Pipeline" },
      { date: "2025-03-17", hours: 6, task: "Production Deploy" }, { date: "2025-03-18", hours: 6, task: "Production Deploy" },
      { date: "2025-03-19", hours: 7, task: "Production Deploy" }, { date: "2025-03-20", hours: 6, task: "Production Deploy" },
      { date: "2025-03-21", hours: 4, task: "Production Deploy" },
    ]},
    { employeeId: "e1", employeeName: "John Doe", dayAllocations: [
      { date: "2025-03-10", hours: 4, task: "CI/CD Pipeline" }, { date: "2025-03-11", hours: 4, task: "CI/CD Pipeline" },
      { date: "2025-03-12", hours: 3, task: "CI/CD Pipeline" }, { date: "2025-03-13", hours: 3, task: "CI/CD Pipeline" },
      { date: "2025-03-14", hours: 2, task: "CI/CD Pipeline" },
      { date: "2025-03-20", hours: 4, task: "Production Deploy" }, { date: "2025-03-21", hours: 6, task: "Production Deploy" },
      { date: "2025-03-24", hours: 2, task: "Production Deploy" },
    ]},
    { employeeId: "e5", employeeName: "Amit Singh", dayAllocations: [
      { date: "2025-03-10", hours: 2, task: "Performance Testing" }, { date: "2025-03-11", hours: 2, task: "Performance Testing" },
      { date: "2025-03-12", hours: 4, task: "Performance Testing" }, { date: "2025-03-13", hours: 4, task: "Performance Testing" },
      { date: "2025-03-14", hours: 6, task: "Performance Testing" },
      { date: "2025-03-17", hours: 6, task: "Performance Testing" }, { date: "2025-03-18", hours: 6, task: "Performance Testing" },
    ]},
    { employeeId: "e6", employeeName: "Sneha Reddy", dayAllocations: [
      { date: "2025-03-12", hours: 2, task: "Security Audit" }, { date: "2025-03-13", hours: 4, task: "Security Audit" },
      { date: "2025-03-14", hours: 4, task: "Security Audit" },
      { date: "2025-03-17", hours: 6, task: "Security Audit" }, { date: "2025-03-18", hours: 6, task: "Security Audit" },
      { date: "2025-03-19", hours: 6, task: "Security Audit" }, { date: "2025-03-20", hours: 4, task: "Security Audit" },
      { date: "2025-03-24", hours: 4, task: "UAT & Bug Fixes" }, { date: "2025-03-25", hours: 4, task: "UAT & Bug Fixes" },
    ]},
    { employeeId: "e4", employeeName: "Priya Sharma", dayAllocations: [
      { date: "2025-03-19", hours: 2, task: "UAT & Bug Fixes" }, { date: "2025-03-20", hours: 4, task: "UAT & Bug Fixes" },
      { date: "2025-03-21", hours: 6, task: "UAT & Bug Fixes" },
      { date: "2025-03-24", hours: 8, task: "UAT & Bug Fixes" }, { date: "2025-03-25", hours: 8, task: "UAT & Bug Fixes" },
      { date: "2025-03-26", hours: 6, task: "UAT & Bug Fixes" }, { date: "2025-03-27", hours: 4, task: "UAT & Bug Fixes" },
      { date: "2025-03-28", hours: 2, task: "UAT & Bug Fixes" },
    ]},
  ],
};

const SprintResourceReport = () => {
  const [filterProject, setFilterProject] = useState("all");
  const [filterSprint, setFilterSprint] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  const filteredSprintOptions = filterProject === "all"
    ? sprintOptions
    : sprintOptions.filter(s => s.project === filterProject);

  const sprint = sprintOptions.find(s => s.id.toString() === filterSprint);
  const allocations = filterSprint ? (mockAllocations[Number(filterSprint)] || []) : [];
  const filteredAllocations = filterEmployee === "all"
    ? allocations
    : allocations.filter(a => a.employeeId === filterEmployee);

  const workingDays = useMemo(() => {
    if (!sprint) return [];
    return getWorkingDays(sprint.startDate, sprint.endDate);
  }, [sprint]);

  // Compute summary
  const summary = useMemo(() => {
    const totalEmployees = filteredAllocations.length;
    const totalCapacity = totalEmployees * workingDays.length * DAILY_CAPACITY;
    let totalAllocated = 0;
    filteredAllocations.forEach(a => {
      a.dayAllocations.forEach(d => { totalAllocated += d.hours; });
    });
    const remaining = totalCapacity - totalAllocated;
    const utilPct = totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0;
    return { totalEmployees, totalCapacity, totalAllocated, remaining, utilPct };
  }, [filteredAllocations, workingDays]);

  const allEmployees = useMemo(() => {
    const empSet = new Map<string, string>();
    Object.values(mockAllocations).forEach(allocs => {
      allocs.forEach(a => empSet.set(a.employeeId, a.employeeName));
    });
    return Array.from(empSet.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Resource Allocation Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Employee utilization and day-wise allocation breakdown
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Project</Label>
                <Select value={filterProject} onValueChange={(v) => { setFilterProject(v); setFilterSprint(""); }}>
                  <SelectTrigger className="h-9 text-sm bg-background"><SelectValue placeholder="All Projects" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectsData.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Sprint</Label>
                <Select value={filterSprint} onValueChange={setFilterSprint}>
                  <SelectTrigger className="h-9 text-sm bg-background"><SelectValue placeholder="Select sprint" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    {filteredSprintOptions.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name} — {s.project}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Employee</Label>
                <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                  <SelectTrigger className="h-9 text-sm bg-background"><SelectValue placeholder="All Employees" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Employees</SelectItem>
                    {allEmployees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Date Range</Label>
                <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-xs text-muted-foreground">
                  {sprint ? `${new Date(sprint.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} – ${new Date(sprint.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}` : "Select sprint"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {filterSprint && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-3 text-center">
                <Users className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase">Employees</p>
                <p className="text-xl font-bold">{summary.totalEmployees}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[hsl(var(--info))]/5 to-[hsl(var(--info))]/10 border-[hsl(var(--info))]/20">
              <CardContent className="p-3 text-center">
                <Layers className="h-5 w-5 text-[hsl(var(--info))] mx-auto mb-1" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase">Total Capacity</p>
                <p className="text-xl font-bold">{summary.totalCapacity}h</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 text-accent mx-auto mb-1" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase">Allocated</p>
                <p className="text-xl font-bold">{summary.totalAllocated}h</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[hsl(var(--success))]/5 to-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20">
              <CardContent className="p-3 text-center">
                <BarChart3 className="h-5 w-5 text-[hsl(var(--success))] mx-auto mb-1" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase">Remaining</p>
                <p className="text-xl font-bold">{summary.remaining}h</p>
              </CardContent>
            </Card>
            <Card className={`bg-gradient-to-br ${summary.utilPct > 90 ? "from-destructive/5 to-destructive/10 border-destructive/20" : "from-[hsl(var(--warning))]/5 to-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/20"}`}>
              <CardContent className="p-3 text-center">
                <TrendingUp className={`h-5 w-5 mx-auto mb-1 ${summary.utilPct > 90 ? "text-destructive" : "text-[hsl(var(--warning))]"}`} />
                <p className="text-[10px] font-medium text-muted-foreground uppercase">Utilization</p>
                <p className="text-xl font-bold">{summary.utilPct}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employee Utilization Table */}
        {filterSprint && filteredAllocations.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" />
                </div>
                Employee Utilization
                <Badge variant="outline" className="text-[10px] ml-1">{filteredAllocations.length} employees</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] py-2 h-auto w-8"></TableHead>
                      <TableHead className="text-[10px] py-2 h-auto">Employee</TableHead>
                      <TableHead className="text-[10px] py-2 h-auto text-center">Total Capacity</TableHead>
                      <TableHead className="text-[10px] py-2 h-auto text-center">Allocated Hours</TableHead>
                      <TableHead className="text-[10px] py-2 h-auto text-center">Remaining Hours</TableHead>
                      <TableHead className="text-[10px] py-2 h-auto text-center min-w-[150px]">Utilization %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAllocations.map(alloc => {
                      const totalAllocated = alloc.dayAllocations.reduce((s, d) => s + d.hours, 0);
                      const capacity = workingDays.length * DAILY_CAPACITY;
                      const remaining = capacity - totalAllocated;
                      const utilPct = Math.round((totalAllocated / capacity) * 100);
                      const isExpanded = expandedEmployee === alloc.employeeId;
                      const isOverAllocated = alloc.dayAllocations.some(d => d.hours > DAILY_CAPACITY);

                      return (
                        <React.Fragment key={alloc.employeeId}>
                          <TableRow
                            className="cursor-pointer hover:bg-muted/30"
                            onClick={() => setExpandedEmployee(isExpanded ? null : alloc.employeeId)}
                          >
                            <TableCell className="py-2 px-2 text-center">
                              {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-xs font-semibold">{alloc.employeeName}</span>
                                {isOverAllocated && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                              </div>
                            </TableCell>
                            <TableCell className="py-2 text-center text-xs font-medium">{capacity}h</TableCell>
                            <TableCell className="py-2 text-center">
                              <Badge variant="outline" className="text-[10px] font-mono">{totalAllocated}h</Badge>
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              <span className={`text-xs font-bold ${remaining < 0 ? "text-destructive" : "text-[hsl(var(--success))]"}`}>{remaining}h</span>
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <Progress value={Math.min(100, utilPct)} className="h-2 flex-1" />
                                <span className={`text-xs font-bold min-w-[35px] text-right ${utilPct > 100 ? "text-destructive" : utilPct > 80 ? "text-[hsl(var(--warning))]" : "text-foreground"}`}>
                                  {utilPct}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                          {/* Expanded Day-wise View */}
                          {isExpanded && (
                            <TableRow className="hover:bg-transparent">
                              <TableCell colSpan={6} className="p-0">
                                <div className="bg-muted/20 px-6 py-3">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Day-wise Allocation</p>
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="hover:bg-transparent border-0">
                                        <TableHead className="text-[10px] py-1 h-auto">Date</TableHead>
                                        <TableHead className="text-[10px] py-1 h-auto text-center">Allocated Hours</TableHead>
                                        <TableHead className="text-[10px] py-1 h-auto">Task</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {alloc.dayAllocations.map((da, idx) => (
                                        <TableRow key={idx} className="border-0 hover:bg-muted/20">
                                          <TableCell className="py-1 text-xs">
                                            {new Date(da.date).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short" })}
                                          </TableCell>
                                          <TableCell className="py-1 text-center">
                                            <Badge variant={da.hours > DAILY_CAPACITY ? "destructive" : "outline"} className="text-[10px] font-mono">
                                              {da.hours}h
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="py-1 text-xs text-muted-foreground">{da.task}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {(!filterSprint || filteredAllocations.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {!filterSprint ? "Select a sprint to view the resource allocation report" : "No allocations found for the selected filters"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

import React from "react";
export default SprintResourceReport;
