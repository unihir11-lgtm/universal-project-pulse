import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Edit, 
  Users, 
  Clock,
  TrendingUp,
  Calendar
} from "lucide-react";
import { format, startOfWeek, addWeeks, isSameWeek } from "date-fns";

// Project colors for allocation bars (industry-standard project types)
const projectColors: Record<string, { bg: string; border: string; text: string }> = {
  "CRM Implementation": { bg: "bg-blue-500/90", border: "border-blue-600", text: "text-white" },
  "Mobile Banking App": { bg: "bg-emerald-500/90", border: "border-emerald-600", text: "text-white" },
  "Cloud Migration": { bg: "bg-orange-500/90", border: "border-orange-600", text: "text-white" },
  "E-Commerce Platform": { bg: "bg-purple-500/90", border: "border-purple-600", text: "text-white" },
  "HR Portal": { bg: "bg-pink-500/90", border: "border-pink-600", text: "text-white" },
  "Data Analytics Dashboard": { bg: "bg-cyan-500/90", border: "border-cyan-600", text: "text-white" },
  "Security Audit": { bg: "bg-red-500/90", border: "border-red-600", text: "text-white" },
  "API Gateway": { bg: "bg-indigo-500/90", border: "border-indigo-600", text: "text-white" },
};

// Helper to create week date
const createWeekDate = (year: number, month: number, day: number) => {
  return startOfWeek(new Date(year, month, day), { weekStartsOn: 1 });
};

// Realistic employee data with varied weekly allocations (standard 40h capacity)
const mockEmployees = [
  {
    id: "1",
    name: "Sarah Chen",
    designation: "Senior Developer",
    department: "Engineering",
    initials: "SC",
    avatar: null,
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "CRM Implementation", hours: 24 }, { project: "Mobile Banking App", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "CRM Implementation", hours: 32 }, { project: "API Gateway", hours: 8 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Mobile Banking App", hours: 40 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "CRM Implementation", hours: 20 }, { project: "Security Audit", hours: 12 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "E-Commerce Platform", hours: 36 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "CRM Implementation", hours: 24 }, { project: "Mobile Banking App", hours: 8 }] },
    ],
  },
  {
    id: "2",
    name: "Mike Johnson",
    designation: "Tech Lead",
    department: "Engineering",
    initials: "MJ",
    avatar: null,
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Cloud Migration", hours: 32 }, { project: "Security Audit", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Cloud Migration", hours: 40 }, { project: "API Gateway", hours: 8 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Cloud Migration", hours: 24 }, { project: "Data Analytics Dashboard", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "E-Commerce Platform", hours: 32 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "Cloud Migration", hours: 28 }, { project: "Security Audit", hours: 12 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "API Gateway", hours: 40 }] },
    ],
  },
  {
    id: "3",
    name: "Lisa Wang",
    designation: "UX Designer",
    department: "Design",
    initials: "LW",
    avatar: null,
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Mobile Banking App", hours: 32 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Mobile Banking App", hours: 24 }, { project: "HR Portal", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "E-Commerce Platform", hours: 36 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "HR Portal", hours: 28 }, { project: "CRM Implementation", hours: 8 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "Data Analytics Dashboard", hours: 32 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "Mobile Banking App", hours: 20 }, { project: "E-Commerce Platform", hours: 16 }] },
    ],
  },
  {
    id: "4",
    name: "John Davis",
    designation: "Backend Developer",
    department: "Engineering",
    initials: "JD",
    avatar: null,
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "API Gateway", hours: 28 }, { project: "Cloud Migration", hours: 12 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "API Gateway", hours: 40 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Data Analytics Dashboard", hours: 24 }, { project: "Security Audit", hours: 8 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "CRM Implementation", hours: 16 }, { project: "API Gateway", hours: 24 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "E-Commerce Platform", hours: 36 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "Cloud Migration", hours: 32 }] },
    ],
  },
  {
    id: "5",
    name: "Emma Wilson",
    designation: "Project Manager",
    department: "Management",
    initials: "EW",
    avatar: null,
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "CRM Implementation", hours: 16 }, { project: "Mobile Banking App", hours: 12 }, { project: "Cloud Migration", hours: 8 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "E-Commerce Platform", hours: 20 }, { project: "HR Portal", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "CRM Implementation", hours: 24 }, { project: "Data Analytics Dashboard", hours: 12 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "Mobile Banking App", hours: 20 }, { project: "Cloud Migration", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "API Gateway", hours: 16 }, { project: "Security Audit", hours: 20 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "HR Portal", hours: 24 }, { project: "CRM Implementation", hours: 12 }] },
    ],
  },
  {
    id: "6",
    name: "Alex Thompson",
    designation: "DevOps Engineer",
    department: "Engineering",
    initials: "AT",
    avatar: null,
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Cloud Migration", hours: 36 }, { project: "Security Audit", hours: 12 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Cloud Migration", hours: 32 }, { project: "API Gateway", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Security Audit", hours: 40 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "Cloud Migration", hours: 28 }, { project: "Data Analytics Dashboard", hours: 8 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "E-Commerce Platform", hours: 24 }, { project: "Security Audit", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "API Gateway", hours: 32 }, { project: "Cloud Migration", hours: 8 }] },
    ],
  },
  {
    id: "7",
    name: "Rachel Kim",
    designation: "QA Engineer",
    department: "Quality Assurance",
    initials: "RK",
    avatar: null,
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "CRM Implementation", hours: 20 }, { project: "Mobile Banking App", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "E-Commerce Platform", hours: 32 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "API Gateway", hours: 24 }, { project: "HR Portal", hours: 12 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "Mobile Banking App", hours: 36 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "Cloud Migration", hours: 20 }, { project: "Data Analytics Dashboard", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "CRM Implementation", hours: 28 }] },
    ],
  },
  {
    id: "8",
    name: "David Martinez",
    designation: "Full Stack Developer",
    department: "Engineering",
    initials: "DM",
    avatar: null,
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "E-Commerce Platform", hours: 32 }, { project: "HR Portal", hours: 8 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Data Analytics Dashboard", hours: 40 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "CRM Implementation", hours: 28 }, { project: "Mobile Banking App", hours: 12 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "E-Commerce Platform", hours: 24 }, { project: "API Gateway", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "HR Portal", hours: 36 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "Data Analytics Dashboard", hours: 24 }, { project: "Security Audit", hours: 12 }] },
    ],
  },
];

// Get unique departments
const departments = [...new Set(mockEmployees.map(e => e.department))];

// Get unique projects for legend
const allProjects = [...new Set(mockEmployees.flatMap(e => 
  e.weeklyAllocations.flatMap(w => w.allocations.map(a => a.project))
))];

interface SelectedAllocation {
  employee: typeof mockEmployees[0];
  weekDate: Date;
  allocations: { project: string; hours: number }[];
  totalHours: number;
}

const ResourceAllocation = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(2025, 0, 13), { weekStartsOn: 1 })
  );
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedAllocation, setSelectedAllocation] = useState<SelectedAllocation | null>(null);

  // Generate 6 weeks starting from current week
  const weeks = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => addWeeks(currentWeekStart, i));
  }, [currentWeekStart]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return mockEmployees.filter(employee => {
      const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
      const matchesProject = projectFilter === "all" || 
        employee.weeklyAllocations.some(w => w.allocations.some(a => a.project === projectFilter));
      return matchesDepartment && matchesProject;
    });
  }, [departmentFilter, projectFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalAllocated = 0;
    let overAllocatedCount = 0;
    const capacity = filteredEmployees.length * 40;
    
    filteredEmployees.forEach(employee => {
      const weekAlloc = employee.weeklyAllocations.find(w => 
        isSameWeek(w.weekStart, currentWeekStart, { weekStartsOn: 1 })
      );
      if (weekAlloc) {
        const hours = weekAlloc.allocations.reduce((sum, a) => sum + a.hours, 0);
        totalAllocated += hours;
        if (hours > 40) overAllocatedCount++;
      }
    });
    
    return {
      utilization: capacity > 0 ? Math.round((totalAllocated / capacity) * 100) : 0,
      totalHours: totalAllocated,
      overAllocated: overAllocatedCount,
      teamSize: filteredEmployees.length,
    };
  }, [filteredEmployees, currentWeekStart]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const getProjectColor = (project: string) => {
    return projectColors[project] || { bg: "bg-gray-400", border: "border-gray-500", text: "text-white" };
  };

  // Get allocations for a specific employee and week
  const getAllocationsForWeek = (employee: typeof mockEmployees[0], weekDate: Date) => {
    const weekAllocation = employee.weeklyAllocations.find(w => 
      isSameWeek(w.weekStart, weekDate, { weekStartsOn: 1 })
    );
    return weekAllocation?.allocations || [];
  };

  // Get total hours for week
  const getTotalHoursForWeek = (employee: typeof mockEmployees[0], weekDate: Date) => {
    const allocations = getAllocationsForWeek(employee, weekDate);
    return allocations.reduce((sum, a) => sum + a.hours, 0);
  };

  // Handle clicking on allocation bars
  const handleAllocationClick = (employee: typeof mockEmployees[0], weekDate: Date) => {
    const allocations = getAllocationsForWeek(employee, weekDate);
    if (allocations.length > 0) {
      const totalHours = allocations.reduce((sum, a) => sum + a.hours, 0);
      setSelectedAllocation({
        employee,
        weekDate,
        allocations,
        totalHours,
      });
    }
  };

  const capacity = 40;
  const overAllocation = selectedAllocation ? Math.max(0, selectedAllocation.totalHours - capacity) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Resource Allocation</h1>
            <p className="text-muted-foreground mt-1">
              Plan and visualize team capacity across projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek} className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="px-4 py-2 bg-muted rounded-lg">
              <span className="font-medium text-sm">
                {format(currentWeekStart, "MMM d")} - {format(addWeeks(currentWeekStart, 5), "MMM d, yyyy")}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleNextWeek} className="gap-1">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-success/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilization</p>
                  <p className="text-2xl font-bold mt-1">{stats.utilization}%</p>
                </div>
                <div className="p-2.5 bg-success/10 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </div>
              <Progress value={stats.utilization} className="mt-3 h-1.5" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-info/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Allocated Hours</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalHours}h</p>
                </div>
                <div className="p-2.5 bg-info/10 rounded-xl">
                  <Clock className="h-5 w-5 text-info" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">of {stats.teamSize * 40}h capacity</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold mt-1">{stats.teamSize}</p>
                </div>
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">in current view</p>
            </CardContent>
          </Card>

          <Card className={`relative overflow-hidden ${stats.overAllocated > 0 ? 'border-warning/50' : ''}`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-warning/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Over-Allocated</p>
                  <p className="text-2xl font-bold mt-1">{stats.overAllocated}</p>
                </div>
                <div className="p-2.5 bg-warning/10 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Projects</SelectItem>
                  {allProjects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Team Schedule</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[220px] font-semibold">Team Member</TableHead>
                  {weeks.map((week, index) => (
                    <TableHead 
                      key={index} 
                      className={`text-center font-semibold min-w-[130px] ${index === 0 ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs text-muted-foreground">{format(week, "EEE")}</span>
                        <span>{format(week, "MMM d")}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map(employee => (
                  <TableRow key={employee.id} className="hover:bg-muted/30">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                          <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-xs font-semibold">
                            {employee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.designation}</p>
                        </div>
                      </div>
                    </TableCell>
                    {weeks.map((week, weekIndex) => {
                      const allocations = getAllocationsForWeek(employee, week);
                      const totalHours = getTotalHoursForWeek(employee, week);
                      const isOverAllocated = totalHours > 40;
                      
                      return (
                        <TableCell 
                          key={weekIndex} 
                          className={`p-2 ${weekIndex === 0 ? "bg-primary/5" : ""}`}
                        >
                          {allocations.length > 0 && (
                            <div 
                              className="space-y-1 cursor-pointer group"
                              onClick={() => handleAllocationClick(employee, week)}
                            >
                              {/* Stacked bars */}
                              <div className="relative h-8 rounded-md overflow-hidden bg-muted/50 flex">
                                {allocations.map((allocation, allocIndex) => {
                                  const color = getProjectColor(allocation.project);
                                  const widthPercent = (allocation.hours / 40) * 100;
                                  return (
                                    <div
                                      key={allocIndex}
                                      className={`${color.bg} h-full transition-all group-hover:brightness-110`}
                                      style={{ width: `${widthPercent}%` }}
                                      title={`${allocation.project}: ${allocation.hours}h`}
                                    />
                                  );
                                })}
                              </div>
                              {/* Hours label */}
                              <div className="flex items-center justify-between px-1">
                                <span className={`text-xs font-medium ${isOverAllocated ? 'text-destructive' : 'text-muted-foreground'}`}>
                                  {totalHours}h
                                </span>
                                {isOverAllocated && (
                                  <AlertTriangle className="h-3 w-3 text-destructive" />
                                )}
                              </div>
                            </div>
                          )}
                          {allocations.length === 0 && (
                            <div className="h-8 rounded-md bg-muted/30 flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">—</span>
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Project Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Project Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {allProjects.map(project => {
                const color = getProjectColor(project);
                return (
                  <div key={project} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${color.bg}`} />
                    <span className="text-sm text-muted-foreground">{project}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Allocation Detail Sheet */}
        <Sheet open={!!selectedAllocation} onOpenChange={() => setSelectedAllocation(null)}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-xl">Allocation Details</SheetTitle>
            </SheetHeader>
            
            {selectedAllocation && (
              <div className="mt-6 space-y-6">
                {/* Employee Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <Avatar className="h-14 w-14 border-2 border-background shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-semibold">
                      {selectedAllocation.employee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedAllocation.employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedAllocation.employee.designation}</p>
                    <Badge variant="outline" className="mt-1">{selectedAllocation.employee.department}</Badge>
                  </div>
                </div>

                {/* Week Info */}
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">Week of {format(selectedAllocation.weekDate, "MMMM d, yyyy")}</span>
                </div>

                {/* Hours Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl text-center">
                    <p className="text-sm text-muted-foreground">Allocated</p>
                    <p className={`text-2xl font-bold ${selectedAllocation.totalHours > capacity ? 'text-destructive' : 'text-foreground'}`}>
                      {selectedAllocation.totalHours}h
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl text-center">
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="text-2xl font-bold text-foreground">{capacity}h</p>
                  </div>
                </div>

                {/* Over-allocation Warning */}
                {overAllocation > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <div>
                      <p className="font-medium text-destructive">Over-allocated by {overAllocation}h</p>
                      <p className="text-sm text-muted-foreground">Consider redistributing work</p>
                    </div>
                  </div>
                )}

                {/* Utilization Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Utilization</span>
                    <span className={`text-sm font-bold ${selectedAllocation.totalHours > capacity ? 'text-destructive' : 'text-success'}`}>
                      {Math.round((selectedAllocation.totalHours / capacity) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((selectedAllocation.totalHours / capacity) * 100, 100)} 
                    className={`h-2 ${selectedAllocation.totalHours > capacity ? '[&>div]:bg-destructive' : ''}`}
                  />
                </div>

                {/* Project Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Project Breakdown</h4>
                  {selectedAllocation.allocations.map((allocation, index) => {
                    const color = getProjectColor(allocation.project);
                    const percent = Math.round((allocation.hours / selectedAllocation.totalHours) * 100);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded ${color.bg}`} />
                          <span className="font-medium">{allocation.project}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{percent}%</span>
                          <Badge variant="secondary" className="font-semibold">{allocation.hours}h</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Button */}
                <Button className="w-full gap-2" variant="outline">
                  <Edit className="h-4 w-4" />
                  Edit Allocation
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default ResourceAllocation;