import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { format, startOfWeek, addWeeks, isSameWeek } from "date-fns";

// Project colors for allocation bars
const projectColors: Record<string, { bg: string; text: string }> = {
  "Enterprise Platform": { bg: "bg-blue-500", text: "text-white" },
  "Mobile App v3": { bg: "bg-green-500", text: "text-white" },
  "Data Migration": { bg: "bg-orange-400", text: "text-white" },
  "API Integration": { bg: "bg-purple-500", text: "text-white" },
  "Website Redesign": { bg: "bg-pink-500", text: "text-white" },
  "Internal Tools": { bg: "bg-teal-500", text: "text-white" },
};

// Helper to create week date
const createWeekDate = (year: number, month: number, day: number) => {
  return startOfWeek(new Date(year, month, day), { weekStartsOn: 1 });
};

// Mock employee data with weekly allocations by specific weeks
const mockEmployees = [
  {
    id: "1",
    name: "Sarah Chen",
    designation: "Senior Engineer",
    department: "Engineering",
    initials: "SC",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Enterprise Platform", hours: 32 }, { project: "Mobile App v3", hours: 16 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Enterprise Platform", hours: 28 }, { project: "Mobile App v3", hours: 12 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Mobile App v3", hours: 40 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "Enterprise Platform", hours: 20 }] },
    ],
    isOverAllocated: true,
  },
  {
    id: "2",
    name: "Mike Johnson",
    designation: "Tech Lead",
    department: "Engineering",
    initials: "MJ",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Enterprise Platform", hours: 40 }, { project: "Data Migration", hours: 8 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Enterprise Platform", hours: 36 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Data Migration", hours: 24 }, { project: "API Integration", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "Enterprise Platform", hours: 32 }] },
    ],
    isOverAllocated: true,
  },
  {
    id: "3",
    name: "Lisa Wang",
    designation: "Designer",
    department: "Design",
    initials: "LW",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Mobile App v3", hours: 36 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Mobile App v3", hours: 32 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Enterprise Platform", hours: 20 }, { project: "Mobile App v3", hours: 16 }] },
    ],
    isOverAllocated: false,
  },
  {
    id: "4",
    name: "John Davis",
    designation: "Engineer",
    department: "Engineering",
    initials: "JD",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Enterprise Platform", hours: 28 }, { project: "API Integration", hours: 12 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "API Integration", hours: 40 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "Enterprise Platform", hours: 24 }, { project: "API Integration", hours: 8 }] },
    ],
    isOverAllocated: false,
  },
  {
    id: "5",
    name: "Emma Wilson",
    designation: "PM",
    department: "Management",
    initials: "EW",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Mobile App v3", hours: 20 }, { project: "Data Migration", hours: 20 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Data Migration", hours: 30 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "Mobile App v3", hours: 16 }, { project: "Data Migration", hours: 16 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "Enterprise Platform", hours: 20 }] },
    ],
    isOverAllocated: false,
  },
  {
    id: "6",
    name: "Alex Thompson",
    designation: "Senior Engineer",
    department: "Engineering",
    initials: "AT",
    weeklyAllocations: [
      { weekStart: createWeekDate(2025, 0, 13), allocations: [{ project: "Data Migration", hours: 44 }, { project: "API Integration", hours: 8 }] },
      { weekStart: createWeekDate(2025, 0, 20), allocations: [{ project: "Data Migration", hours: 40 }] },
      { weekStart: createWeekDate(2025, 0, 27), allocations: [{ project: "API Integration", hours: 32 }] },
      { weekStart: createWeekDate(2025, 1, 3), allocations: [{ project: "Data Migration", hours: 28 }, { project: "API Integration", hours: 12 }] },
    ],
    isOverAllocated: true,
  },
];

// Get unique departments
const departments = [...new Set(mockEmployees.map(e => e.department))];

// Get unique projects for legend
const allProjects = [...new Set(mockEmployees.flatMap(e => 
  e.weeklyAllocations.flatMap(w => w.allocations.map(a => a.project))
))];

const ResourceAllocation = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(2025, 0, 13), { weekStartsOn: 1 })
  );
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

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
                            <div className="space-y-1">
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
      </div>
    </DashboardLayout>
  );
};

export default ResourceAllocation;
