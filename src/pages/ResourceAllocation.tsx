import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, AlertTriangle, Edit } from "lucide-react";
import { format, startOfWeek, addWeeks, isSameWeek } from "date-fns";

// Project colors for allocation bars (industry-standard project types)
const projectColors: Record<string, { bg: string; text: string }> = {
  "CRM Implementation": { bg: "bg-blue-500", text: "text-white" },
  "Mobile Banking App": { bg: "bg-green-500", text: "text-white" },
  "Cloud Migration": { bg: "bg-orange-400", text: "text-white" },
  "E-Commerce Platform": { bg: "bg-purple-500", text: "text-white" },
  "HR Portal": { bg: "bg-pink-500", text: "text-white" },
  "Data Analytics Dashboard": { bg: "bg-teal-500", text: "text-white" },
  "Security Audit": { bg: "bg-red-500", text: "text-white" },
  "API Gateway": { bg: "bg-indigo-500", text: "text-white" },
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
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "CRM Implementation", hours: 24 }, { project: "Mobile Banking App", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "CRM Implementation", hours: 32 }, { project: "API Gateway", hours: 8 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Mobile Banking App", hours: 40 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "CRM Implementation", hours: 20 }, { project: "Security Audit", hours: 12 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "E-Commerce Platform", hours: 36 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "CRM Implementation", hours: 24 }, { project: "Mobile Banking App", hours: 8 }] },
    ],
    isOverAllocated: false,
  },
  {
    id: "2",
    name: "Mike Johnson",
    designation: "Tech Lead",
    department: "Engineering",
    initials: "MJ",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Cloud Migration", hours: 32 }, { project: "Security Audit", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Cloud Migration", hours: 40 }, { project: "API Gateway", hours: 8 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Cloud Migration", hours: 24 }, { project: "Data Analytics Dashboard", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "E-Commerce Platform", hours: 32 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "Cloud Migration", hours: 28 }, { project: "Security Audit", hours: 12 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "API Gateway", hours: 40 }] },
    ],
    isOverAllocated: true,
  },
  {
    id: "3",
    name: "Lisa Wang",
    designation: "UX Designer",
    department: "Design",
    initials: "LW",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Mobile Banking App", hours: 32 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Mobile Banking App", hours: 24 }, { project: "HR Portal", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "E-Commerce Platform", hours: 36 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "HR Portal", hours: 28 }, { project: "CRM Implementation", hours: 8 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "Data Analytics Dashboard", hours: 32 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "Mobile Banking App", hours: 20 }, { project: "E-Commerce Platform", hours: 16 }] },
    ],
    isOverAllocated: false,
  },
  {
    id: "4",
    name: "John Davis",
    designation: "Backend Developer",
    department: "Engineering",
    initials: "JD",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "API Gateway", hours: 28 }, { project: "Cloud Migration", hours: 12 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "API Gateway", hours: 40 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Data Analytics Dashboard", hours: 24 }, { project: "Security Audit", hours: 8 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "CRM Implementation", hours: 16 }, { project: "API Gateway", hours: 24 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "E-Commerce Platform", hours: 36 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "Cloud Migration", hours: 32 }] },
    ],
    isOverAllocated: false,
  },
  {
    id: "5",
    name: "Emma Wilson",
    designation: "Project Manager",
    department: "Management",
    initials: "EW",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "CRM Implementation", hours: 16 }, { project: "Mobile Banking App", hours: 12 }, { project: "Cloud Migration", hours: 8 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "E-Commerce Platform", hours: 20 }, { project: "HR Portal", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "CRM Implementation", hours: 24 }, { project: "Data Analytics Dashboard", hours: 12 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "Mobile Banking App", hours: 20 }, { project: "Cloud Migration", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "API Gateway", hours: 16 }, { project: "Security Audit", hours: 20 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "HR Portal", hours: 24 }, { project: "CRM Implementation", hours: 12 }] },
    ],
    isOverAllocated: false,
  },
  {
    id: "6",
    name: "Alex Thompson",
    designation: "DevOps Engineer",
    department: "Engineering",
    initials: "AT",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Cloud Migration", hours: 36 }, { project: "Security Audit", hours: 12 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Cloud Migration", hours: 32 }, { project: "API Gateway", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Security Audit", hours: 40 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "Cloud Migration", hours: 28 }, { project: "Data Analytics Dashboard", hours: 8 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "E-Commerce Platform", hours: 24 }, { project: "Security Audit", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "API Gateway", hours: 32 }, { project: "Cloud Migration", hours: 8 }] },
    ],
    isOverAllocated: true,
  },
  {
    id: "7",
    name: "Rachel Kim",
    designation: "QA Engineer",
    department: "Quality Assurance",
    initials: "RK",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "CRM Implementation", hours: 20 }, { project: "Mobile Banking App", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "E-Commerce Platform", hours: 32 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "API Gateway", hours: 24 }, { project: "HR Portal", hours: 12 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "Mobile Banking App", hours: 36 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "Cloud Migration", hours: 20 }, { project: "Data Analytics Dashboard", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "CRM Implementation", hours: 28 }] },
    ],
    isOverAllocated: false,
  },
  {
    id: "8",
    name: "David Martinez",
    designation: "Full Stack Developer",
    department: "Engineering",
    initials: "DM",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "E-Commerce Platform", hours: 32 }, { project: "HR Portal", hours: 8 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Data Analytics Dashboard", hours: 40 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "CRM Implementation", hours: 28 }, { project: "Mobile Banking App", hours: 12 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "E-Commerce Platform", hours: 24 }, { project: "API Gateway", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 10), allocations: [{ project: "HR Portal", hours: 36 }] },
      { weekStart: createWeekDate(2025, 1, 17), allocations: [{ project: "Data Analytics Dashboard", hours: 24 }, { project: "Security Audit", hours: 12 }] },
    ],
    isOverAllocated: false,
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

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const getProjectColor = (project: string) => {
    return projectColors[project] || { bg: "bg-gray-400", text: "text-white" };
  };

  // Get allocations for a specific employee and week
  const getAllocationsForWeek = (employee: typeof mockEmployees[0], weekDate: Date) => {
    const weekAllocation = employee.weeklyAllocations.find(w => 
      isSameWeek(w.weekStart, weekDate, { weekStartsOn: 1 })
    );
    return weekAllocation?.allocations || [];
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Allocation</h1>
          <p className="text-muted-foreground">
            Visualize team capacity and project assignments
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All projects</SelectItem>
                  {allProjects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handlePreviousWeek} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="font-medium">
            Week of {format(currentWeekStart, "MMM d")}
          </span>
          <Button variant="ghost" onClick={handleNextWeek} className="gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Allocation Table */}
        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Employee</TableHead>
                  {weeks.map((week, index) => (
                    <TableHead key={index} className={`text-center ${index === 0 ? "bg-primary/10" : ""}`}>
                      {format(week, "MMM d")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-primary/10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {employee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-primary">{employee.designation}</p>
                          </div>
                          {employee.isOverAllocated && (
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {weeks.map((week, weekIndex) => {
                      const allocations = getAllocationsForWeek(employee, week);
                      return (
                        <TableCell key={weekIndex} className={`${weekIndex === 0 ? "bg-primary/5" : ""}`}>
                          {allocations.length > 0 && (
                            <div 
                              className="space-y-1 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleAllocationClick(employee, week)}
                            >
                              {allocations.map((allocation, allocIndex) => {
                                const color = getProjectColor(allocation.project);
                                const widthPercent = Math.min((allocation.hours / 40) * 100, 100);
                                return (
                                  <div
                                    key={allocIndex}
                                    className={`${color.bg} ${color.text} text-xs font-medium px-2 py-1 rounded`}
                                    style={{ width: `${widthPercent}%`, minWidth: '40px' }}
                                  >
                                    {allocation.hours}h
                                  </div>
                                );
                              })}
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

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6">
          {allProjects.map(project => {
            const color = getProjectColor(project);
            return (
              <div key={project} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                <span className="text-sm">{project}</span>
              </div>
            );
          })}
        </div>

        {/* Allocation Details Sheet */}
        <Sheet open={!!selectedAllocation} onOpenChange={() => setSelectedAllocation(null)}>
          <SheetContent className="w-[400px] sm:w-[450px]">
            <SheetHeader>
              <SheetTitle>Allocation Details</SheetTitle>
            </SheetHeader>
            
            {selectedAllocation && (
              <div className="mt-6 space-y-6">
                <p className="text-muted-foreground">
                  View and manage allocation for {selectedAllocation.employee.name}
                </p>

                {/* Total Allocated */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Allocated</span>
                    <span className={`font-semibold ${overAllocation > 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {selectedAllocation.totalHours}h / {capacity}h
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${overAllocation > 0 ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ width: `${Math.min((selectedAllocation.totalHours / capacity) * 100, 100)}%` }}
                    />
                  </div>
                  {overAllocation > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-destructive bg-destructive/10 rounded-full">
                      <AlertTriangle className="h-3 w-3" />
                      Over-allocated by {overAllocation}h
                    </span>
                  )}
                </div>

                {/* Project Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-medium">Project Breakdown</h4>
                  <div className="space-y-2">
                    {selectedAllocation.allocations.map((allocation, index) => {
                      const color = getProjectColor(allocation.project);
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                            <span className="text-sm">{allocation.project}</span>
                          </div>
                          <span className="text-sm font-medium">{allocation.hours}h</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Edit Button */}
                <Button className="w-full gap-2">
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
