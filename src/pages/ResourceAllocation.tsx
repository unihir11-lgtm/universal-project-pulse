import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Search, 
  Download, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Filter
} from "lucide-react";

// Mock resource allocation data with 10 employees
const mockResourceData = [
  {
    id: "1",
    employeeName: "John Smith",
    email: "john.smith@company.com",
    department: "Engineering",
    designation: "Senior Developer",
    weeklyCapacity: 40,
    allocatedHours: 45,
    activeTasks: 8,
    projects: ["Project Alpha", "Mobile App"],
    skills: ["React", "Node.js", "TypeScript"],
    bookingType: "hard",
    availableFrom: null,
  },
  {
    id: "2",
    employeeName: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    department: "Design",
    designation: "UI/UX Designer",
    weeklyCapacity: 40,
    allocatedHours: 32,
    activeTasks: 5,
    projects: ["Website Redesign"],
    skills: ["Figma", "Adobe XD", "CSS"],
    bookingType: "hard",
    availableFrom: null,
  },
  {
    id: "3",
    employeeName: "Mike Chen",
    email: "mike.chen@company.com",
    department: "Engineering",
    designation: "Backend Developer",
    weeklyCapacity: 40,
    allocatedHours: 38,
    activeTasks: 6,
    projects: ["API Integration", "Project Alpha"],
    skills: ["Python", "PostgreSQL", "AWS"],
    bookingType: "soft",
    availableFrom: null,
  },
  {
    id: "4",
    employeeName: "Emily Davis",
    email: "emily.davis@company.com",
    department: "Marketing",
    designation: "Marketing Manager",
    weeklyCapacity: 40,
    allocatedHours: 15,
    activeTasks: 3,
    projects: ["Q4 Campaign"],
    skills: ["SEO", "Analytics", "Content"],
    bookingType: "soft",
    availableFrom: "2024-01-20",
  },
  {
    id: "5",
    employeeName: "David Wilson",
    email: "david.wilson@company.com",
    department: "Engineering",
    designation: "DevOps Engineer",
    weeklyCapacity: 40,
    allocatedHours: 42,
    activeTasks: 7,
    projects: ["Infrastructure", "CI/CD Pipeline"],
    skills: ["Docker", "Kubernetes", "Terraform"],
    bookingType: "hard",
    availableFrom: null,
  },
  {
    id: "6",
    employeeName: "Lisa Brown",
    email: "lisa.brown@company.com",
    department: "QA",
    designation: "QA Lead",
    weeklyCapacity: 40,
    allocatedHours: 28,
    activeTasks: 4,
    projects: ["Mobile App", "Website Redesign"],
    skills: ["Selenium", "Jest", "Cypress"],
    bookingType: "hard",
    availableFrom: null,
  },
  {
    id: "7",
    employeeName: "James Taylor",
    email: "james.taylor@company.com",
    department: "Engineering",
    designation: "Full Stack Developer",
    weeklyCapacity: 40,
    allocatedHours: 20,
    activeTasks: 3,
    projects: ["Internal Tools"],
    skills: ["React", "Node.js", "MongoDB"],
    bookingType: "soft",
    availableFrom: "2024-01-18",
  },
  {
    id: "8",
    employeeName: "Amanda Martinez",
    email: "amanda.martinez@company.com",
    department: "Design",
    designation: "Product Designer",
    weeklyCapacity: 40,
    allocatedHours: 48,
    activeTasks: 9,
    projects: ["Project Alpha", "Mobile App", "Dashboard"],
    skills: ["Figma", "Prototyping", "User Research"],
    bookingType: "hard",
    availableFrom: null,
  },
  {
    id: "9",
    employeeName: "Robert Garcia",
    email: "robert.garcia@company.com",
    department: "Engineering",
    designation: "Tech Lead",
    weeklyCapacity: 40,
    allocatedHours: 36,
    activeTasks: 5,
    projects: ["Project Alpha", "Architecture Review"],
    skills: ["System Design", "Java", "Microservices"],
    bookingType: "hard",
    availableFrom: null,
  },
  {
    id: "10",
    employeeName: "Jennifer Lee",
    email: "jennifer.lee@company.com",
    department: "HR",
    designation: "HR Specialist",
    weeklyCapacity: 40,
    allocatedHours: 10,
    activeTasks: 2,
    projects: ["Onboarding Program"],
    skills: ["Recruitment", "Training", "Compliance"],
    bookingType: "soft",
    availableFrom: "2024-01-15",
  },
];

type TimeWindow = "today" | "week" | "month";

const getTimeWindowLabel = (window: TimeWindow) => {
  switch (window) {
    case "today": return "Today";
    case "week": return "This Week";
    case "month": return "This Month";
  }
};

const getCapacityMultiplier = (window: TimeWindow) => {
  switch (window) {
    case "today": return 1 / 5; // 8h per day from 40h week
    case "week": return 1;
    case "month": return 4; // ~4 weeks
  }
};

const ResourceAllocation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("heatmap");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("week");

  // Get unique departments
  const departments = [...new Set(mockResourceData.map(r => r.department))];

  // Calculate capacity and allocation based on time window
  const multiplier = getCapacityMultiplier(timeWindow);
  
  // Calculate availability for each resource
  const resourcesWithAvailability = mockResourceData.map(resource => {
    const adjustedCapacity = Math.round(resource.weeklyCapacity * multiplier);
    const adjustedAllocated = Math.round(resource.allocatedHours * multiplier);
    const availability = adjustedCapacity - adjustedAllocated;
    const utilizationPercent = (adjustedAllocated / adjustedCapacity) * 100;
    let status: "overloaded" | "optimal" | "available" | "free";
    
    if (utilizationPercent > 100) {
      status = "overloaded";
    } else if (utilizationPercent >= 80) {
      status = "optimal";
    } else if (utilizationPercent >= 50) {
      status = "available";
    } else {
      status = "free";
    }

    return {
      ...resource,
      weeklyCapacity: adjustedCapacity,
      allocatedHours: adjustedAllocated,
      availability,
      utilizationPercent,
      status,
    };
  });

  // Apply filters
  const filteredResources = resourcesWithAvailability.filter(resource => {
    const matchesSearch = 
      resource.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDepartment = departmentFilter === "all" || resource.department === departmentFilter;
    
    const matchesStatus = statusFilter === "all" || resource.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Calculate summary stats
  const totalCapacity = filteredResources.reduce((sum, r) => sum + r.weeklyCapacity, 0);
  const totalAllocated = filteredResources.reduce((sum, r) => sum + r.allocatedHours, 0);
  const totalAvailable = filteredResources.reduce((sum, r) => sum + Math.max(0, r.availability), 0);
  const overloadedCount = filteredResources.filter(r => r.status === "overloaded").length;
  const freeCount = filteredResources.filter(r => r.status === "free" || r.status === "available").length;
  const avgUtilization = totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0;

  // Department breakdown
  const departmentBreakdown = departments.map(dept => {
    const deptResources = filteredResources.filter(r => r.department === dept);
    const deptCapacity = deptResources.reduce((sum, r) => sum + r.weeklyCapacity, 0);
    const deptAllocated = deptResources.reduce((sum, r) => sum + r.allocatedHours, 0);
    const deptUtilization = deptCapacity > 0 ? (deptAllocated / deptCapacity) * 100 : 0;
    
    return {
      department: dept,
      headcount: deptResources.length,
      capacity: deptCapacity,
      allocated: deptAllocated,
      available: deptCapacity - deptAllocated,
      utilization: deptUtilization,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overloaded":
        return "bg-destructive text-destructive-foreground";
      case "optimal":
        return "bg-amber-500 text-white";
      case "available":
        return "bg-primary text-primary-foreground";
      case "free":
        return "bg-green-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getHeatmapColor = (utilizationPercent: number) => {
    if (utilizationPercent > 100) return "bg-red-500";
    if (utilizationPercent >= 90) return "bg-orange-500";
    if (utilizationPercent >= 80) return "bg-amber-500";
    if (utilizationPercent >= 60) return "bg-yellow-400";
    if (utilizationPercent >= 40) return "bg-green-400";
    return "bg-green-500";
  };

  const handleExport = () => {
    const headers = ["Employee", "Department", "Designation", "Capacity", "Allocated", "Available", "Utilization", "Status", "Active Tasks", "Projects"];
    const csvContent = [
      headers.join(","),
      ...filteredResources.map(r => [
        r.employeeName,
        r.department,
        r.designation,
        r.weeklyCapacity,
        r.allocatedHours,
        r.availability,
        `${r.utilizationPercent.toFixed(1)}%`,
        r.status,
        r.activeTasks,
        `"${r.projects.join(", ")}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resource-allocation.csv";
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resource Allocation</h1>
            <p className="text-muted-foreground">
              Track capacity and see who is available for new work
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeWindow} onValueChange={(v) => setTimeWindow(v as TimeWindow)}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>


        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="overloaded">Overloaded</SelectItem>
                  <SelectItem value="optimal">Optimal</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="heatmap">Capacity Heatmap</TabsTrigger>
            <TabsTrigger value="table">Detailed View</TabsTrigger>
            <TabsTrigger value="department">By Department</TabsTrigger>
          </TabsList>

          {/* Heatmap View */}
          <TabsContent value="heatmap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Who is Free? - Capacity Heatmap
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Visual representation of resource availability. Green = available, Red = overloaded.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {filteredResources.map(resource => (
                    <Card 
                      key={resource.id} 
                      className={`relative overflow-hidden border-2 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all ${
                        resource.status === "overloaded" ? "border-destructive" :
                        resource.status === "free" ? "border-green-500" :
                        "border-border"
                      }`}
                      onClick={() => {
                        toast.info(`${resource.employeeName}: ${resource.allocatedHours}h allocated, ${resource.availability}h available`);
                      }}
                    >
                      <div 
                        className={`absolute inset-0 opacity-10 ${getHeatmapColor(resource.utilizationPercent)}`}
                      />
                      <CardContent className="relative p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-sm">{resource.employeeName}</h3>
                            <p className="text-xs text-muted-foreground">{resource.designation}</p>
                          </div>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(resource.status)}`}>
                            {resource.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Utilization</span>
                            <span className="font-medium">{resource.utilizationPercent.toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={Math.min(resource.utilizationPercent, 100)} 
                            className={`h-2 ${resource.utilizationPercent > 100 ? "[&>div]:bg-destructive" : ""}`}
                          />
                          
                          <div className="flex justify-between text-xs pt-2">
                            <span className="text-muted-foreground">Available</span>
                            <span className={`font-bold ${resource.availability < 0 ? "text-destructive" : "text-green-600"}`}>
                              {resource.availability}h
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Tasks</span>
                            <span>{resource.activeTasks} active</span>
                          </div>

                          {resource.bookingType === "soft" && (
                            <Badge variant="secondary" className="text-xs mt-2">
                              Soft Booking
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                  <span className="text-sm font-medium">Legend:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <span className="text-xs">Free (&lt;50%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-400" />
                    <span className="text-xs">Available (50-80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500" />
                    <span className="text-xs">Optimal (80-90%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500" />
                    <span className="text-xs">Overloaded (&gt;100%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Table View */}
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Resource Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-center">Capacity</TableHead>
                      <TableHead className="text-center">Allocated</TableHead>
                      <TableHead className="text-center">Available</TableHead>
                      <TableHead className="text-center">Utilization</TableHead>
                      <TableHead className="text-center">Tasks</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResources.map(resource => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{resource.employeeName}</div>
                            <div className="text-xs text-muted-foreground">{resource.designation}</div>
                          </div>
                        </TableCell>
                        <TableCell>{resource.department}</TableCell>
                        <TableCell className="text-center">{resource.weeklyCapacity}h</TableCell>
                        <TableCell className="text-center">{resource.allocatedHours}h</TableCell>
                        <TableCell className={`text-center font-medium ${resource.availability < 0 ? "text-destructive" : "text-green-600"}`}>
                          {resource.availability}h
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={Math.min(resource.utilizationPercent, 100)} 
                              className={`h-2 w-16 ${resource.utilizationPercent > 100 ? "[&>div]:bg-destructive" : ""}`}
                            />
                            <span className="text-xs">{resource.utilizationPercent.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{resource.activeTasks}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {resource.projects.slice(0, 2).map(project => (
                              <Badge key={project} variant="outline" className="text-xs">
                                {project}
                              </Badge>
                            ))}
                            {resource.projects.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{resource.projects.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(resource.status)}>
                            {resource.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Department Breakdown */}
          <TabsContent value="department">
            <div className="grid gap-4 md:grid-cols-2">
              {departmentBreakdown.map(dept => (
                <Card key={dept.department}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{dept.department}</span>
                      <Badge variant="outline">{dept.headcount} people</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{dept.capacity}h</div>
                        <div className="text-xs text-muted-foreground">Capacity</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{dept.allocated}h</div>
                        <div className="text-xs text-muted-foreground">Allocated</div>
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${dept.available < 0 ? "text-destructive" : "text-green-600"}`}>
                          {dept.available}h
                        </div>
                        <div className="text-xs text-muted-foreground">Available</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Team Utilization</span>
                        <span className="font-medium">{dept.utilization.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={Math.min(dept.utilization, 100)} 
                        className={dept.utilization > 100 ? "[&>div]:bg-destructive" : ""}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Free Resources Quick List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Available for New Work
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Team members with significant availability (&lt;80% utilized)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {filteredResources
                .filter(r => r.utilizationPercent < 80)
                .sort((a, b) => a.utilizationPercent - b.utilizationPercent)
                .map(resource => (
                  <Card key={resource.id} className="p-3 border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
                        {resource.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{resource.employeeName}</div>
                        <div className="text-xs text-muted-foreground">
                          {resource.availability}h free • {resource.department}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              
              {filteredResources.filter(r => r.utilizationPercent < 80).length === 0 && (
                <p className="text-muted-foreground text-sm">No team members with significant availability.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ResourceAllocation;
