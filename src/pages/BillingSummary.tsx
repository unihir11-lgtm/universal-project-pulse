import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Download, RotateCcw, ChevronRight, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type Project = Tables<"projects">;
type Profile = Tables<"profiles">;

interface BillingEntry {
  id: string;
  client: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  billableHours: number;
  nonBillableHours: number;
  billableValue: number;
  cost: number;
  margin: number;
}

const BillingSummary = () => {
  const { hasPermission } = useAuth();
  const canViewCostData = hasPermission(["admin", "finance"]);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [expandedClients, setExpandedClients] = useState<string[]>([]);

  // Fetch projects and profiles
  useEffect(() => {
    const fetchData = async () => {
      const [projectsRes, profilesRes] = await Promise.all([
        supabase.from("projects").select("*").order("name"),
        supabase.from("profiles").select("*").order("full_name"),
      ]);
      
      if (projectsRes.data) setProjects(projectsRes.data);
      if (profilesRes.data) setProfiles(profilesRes.data);
    };
    fetchData();
  }, []);

  // Mock billing data grouped by client
  const mockBillingData: BillingEntry[] = useMemo(() => [
    {
      id: "1",
      client: "Acme Corp",
      projectId: "p1",
      projectName: "Enterprise Platform",
      employeeId: "e1",
      employeeName: "Sarah Chen",
      billableHours: 42,
      nonBillableHours: 8,
      billableValue: 8400,
      cost: 3150,
      margin: 62.5,
    },
    {
      id: "2",
      client: "Acme Corp",
      projectId: "p1",
      projectName: "Enterprise Platform",
      employeeId: "e2",
      employeeName: "Mike Johnson",
      billableHours: 38,
      nonBillableHours: 4,
      billableValue: 6840,
      cost: 2660,
      margin: 61.1,
    },
    {
      id: "3",
      client: "Acme Corp",
      projectId: "p2",
      projectName: "Data Analytics",
      employeeId: "e3",
      employeeName: "Lisa Wang",
      billableHours: 32,
      nonBillableHours: 6,
      billableValue: 6400,
      cost: 2400,
      margin: 62.5,
    },
    {
      id: "4",
      client: "TechStart Inc",
      projectId: "p3",
      projectName: "Mobile App",
      employeeId: "e1",
      employeeName: "Sarah Chen",
      billableHours: 45,
      nonBillableHours: 5,
      billableValue: 9000,
      cost: 3375,
      margin: 62.5,
    },
    {
      id: "5",
      client: "TechStart Inc",
      projectId: "p4",
      projectName: "API Development",
      employeeId: "e4",
      employeeName: "David Lee",
      billableHours: 28,
      nonBillableHours: 2,
      billableValue: 5040,
      cost: 1960,
      margin: 61.1,
    },
    {
      id: "6",
      client: "GlobalBank",
      projectId: "p5",
      projectName: "Banking Portal",
      employeeId: "e2",
      employeeName: "Mike Johnson",
      billableHours: 52,
      nonBillableHours: 8,
      billableValue: 9360,
      cost: 3640,
      margin: 61.1,
    },
    {
      id: "7",
      client: "GlobalBank",
      projectId: "p5",
      projectName: "Banking Portal",
      employeeId: "e5",
      employeeName: "Emily Brown",
      billableHours: 35,
      nonBillableHours: 5,
      billableValue: 6300,
      cost: 2450,
      margin: 61.1,
    },
    {
      id: "8",
      client: "RetailMax",
      projectId: "p6",
      projectName: "E-Commerce Platform",
      employeeId: "e3",
      employeeName: "Lisa Wang",
      billableHours: 18,
      nonBillableHours: 2,
      billableValue: 3200,
      cost: 1035,
      margin: 67.7,
    },
  ], []);

  // Filter data
  const filteredData = useMemo(() => {
    return mockBillingData.filter(entry => {
      const matchesSearch = searchQuery === "" || 
        entry.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClient = filterClient === "all" || entry.client === filterClient;
      const matchesProject = filterProject === "all" || entry.projectId === filterProject;
      return matchesSearch && matchesClient && matchesProject;
    });
  }, [mockBillingData, searchQuery, filterClient, filterProject]);

  // Group by client
  const groupedByClient = useMemo(() => {
    const groups: Record<string, BillingEntry[]> = {};
    filteredData.forEach(entry => {
      if (!groups[entry.client]) {
        groups[entry.client] = [];
      }
      groups[entry.client].push(entry);
    });
    return groups;
  }, [filteredData]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredData.reduce((acc, entry) => ({
      billableHours: acc.billableHours + entry.billableHours,
      billableValue: acc.billableValue + entry.billableValue,
      cost: acc.cost + entry.cost,
    }), {
      billableHours: 0,
      billableValue: 0,
      cost: 0,
    });
  }, [filteredData]);

  const avgMargin = totals.billableValue > 0 
    ? ((totals.billableValue - totals.cost) / totals.billableValue * 100).toFixed(1)
    : "0";

  // Get unique clients for filter
  const uniqueClients = useMemo(() => {
    return [...new Set(mockBillingData.map(e => e.client))];
  }, [mockBillingData]);

  // Get unique projects for filter
  const uniqueProjects = useMemo(() => {
    const projects = new Map<string, string>();
    mockBillingData.forEach(e => projects.set(e.projectId, e.projectName));
    return Array.from(projects.entries()).map(([id, name]) => ({ id, name }));
  }, [mockBillingData]);

  const toggleClient = (client: string) => {
    setExpandedClients(prev => 
      prev.includes(client) 
        ? prev.filter(c => c !== client)
        : [...prev, client]
    );
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilterPeriod("all");
    setFilterClient("all");
    setFilterProject("all");
  };

  const handleExportCSV = () => {
    const headers = canViewCostData
      ? ["Client", "Project", "Employee", "Billable Hrs", "Non-Billable", "Billable Value", "Cost", "Margin"]
      : ["Client", "Project", "Employee", "Billable Hrs", "Non-Billable", "Billable Value"];
    
    const rows = filteredData.map(entry => {
      const baseRow = [
        entry.client,
        entry.projectName,
        entry.employeeName,
        `${entry.billableHours}h`,
        `${entry.nonBillableHours}h`,
        `$${entry.billableValue.toLocaleString()}`,
      ];
      if (canViewCostData) {
        baseRow.push(`$${entry.cost.toLocaleString()}`, `${entry.margin}%`);
      }
      return baseRow;
    });

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-summary-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Billing summary exported to CSV");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing Summary</h1>
            <p className="text-muted-foreground mt-1">
              Billing readiness and transparency view
            </p>
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees, projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All clients</SelectItem>
                  {uniqueClients.map(client => (
                    <SelectItem key={client} value={client}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All projects</SelectItem>
                  {uniqueProjects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-primary">Total Billable Hours</p>
              <p className="text-3xl font-bold mt-1">{totals.billableHours}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-success">Total Billable Value</p>
              <p className="text-3xl font-bold mt-1 text-success">${totals.billableValue.toLocaleString()}</p>
            </CardContent>
          </Card>
          {canViewCostData && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-warning">Total Cost</p>
                  <p className="text-3xl font-bold mt-1">${totals.cost.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Average Margin</p>
                  <p className="text-3xl font-bold mt-1 text-success">{avgMargin}%</p>
                </CardContent>
              </Card>
            </>
          )}
          {!canViewCostData && (
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="text-xl font-medium mt-1">
                  {filterPeriod === "all" ? "All Time" : filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Billing Details Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Billing Details</CardTitle>
                <p className="text-sm text-muted-foreground">Grouped by client and project</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Billable Hrs</TableHead>
                  <TableHead className="text-right">Non-Billable</TableHead>
                  <TableHead className="text-right">Billable Value</TableHead>
                  {canViewCostData && (
                    <>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedByClient).map(([client, entries]) => (
                  <Collapsible 
                    key={client} 
                    open={expandedClients.includes(client)}
                    onOpenChange={() => toggleClient(client)}
                    asChild
                  >
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow 
                          className="cursor-pointer hover:bg-muted/50 font-medium"
                          onClick={() => toggleClient(client)}
                        >
                          <TableCell>
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${
                                expandedClients.includes(client) ? "rotate-90" : ""
                              }`}
                            />
                          </TableCell>
                          <TableCell colSpan={canViewCostData ? 7 : 5}>
                            {client} ({entries.length})
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>
                      <CollapsibleContent asChild>
                        <>
                          {entries.map(entry => (
                            <TableRow key={entry.id} className="bg-muted/20">
                              <TableCell></TableCell>
                              <TableCell className="text-primary">{entry.projectName}</TableCell>
                              <TableCell className="text-primary">{entry.employeeName}</TableCell>
                              <TableCell className="text-right font-medium">{entry.billableHours}h</TableCell>
                              <TableCell className="text-right text-muted-foreground">{entry.nonBillableHours}h</TableCell>
                              <TableCell className="text-right text-success font-medium">${entry.billableValue.toLocaleString()}</TableCell>
                              {canViewCostData && (
                                <>
                                  <TableCell className="text-right">${entry.cost.toLocaleString()}</TableCell>
                                  <TableCell className="text-right text-success font-medium">{entry.margin}%</TableCell>
                                </>
                              )}
                            </TableRow>
                          ))}
                        </>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BillingSummary;
