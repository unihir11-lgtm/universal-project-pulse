import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Download, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown, 
  Search,
  TrendingUp,
  Clock,
  DollarSign,
  Percent,
  Building2,
  Receipt,
  Calculator,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type Project = Tables<"projects">;
type Profile = Tables<"profiles">;

const STANDARD_HOURS = 198;

interface BillingEntry {
  id: string;
  client: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  billableHours: number;
  nonBillableHours: number;
  agreementRate: number; // client agreed bill_rate
  billableValue: number; // billableHours * agreementRate
  actualCostRate: number; // designation salary / 198
  actualCost: number; // billableHours * actualCostRate
  expenseCost: number; // from project_expenses
  margin: number;
  status: "ready" | "pending" | "review";
}

const BillingSummary = () => {
  const { hasPermission } = useAuth();
  const canViewCostData = hasPermission(["admin", "finance"]);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [filterClient, setFilterClient] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [expandedClients, setExpandedClients] = useState<string[]>([]);

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

  // Mock billing data with new costing fields
  const mockBillingData: BillingEntry[] = useMemo(() => [
    {
      id: "1", client: "Acme Corp", projectId: "p1", projectName: "Enterprise Platform",
      employeeId: "e1", employeeName: "Sarah Chen", designation: "Senior Developer",
      billableHours: 42, nonBillableHours: 8,
      agreementRate: 200, billableValue: 8400,
      actualCostRate: 50000 / STANDARD_HOURS, actualCost: 42 * (50000 / STANDARD_HOURS),
      expenseCost: 500, margin: 0, status: "ready",
    },
    {
      id: "2", client: "Acme Corp", projectId: "p1", projectName: "Enterprise Platform",
      employeeId: "e2", employeeName: "Mike Johnson", designation: "Developer",
      billableHours: 38, nonBillableHours: 4,
      agreementRate: 180, billableValue: 6840,
      actualCostRate: 40000 / STANDARD_HOURS, actualCost: 38 * (40000 / STANDARD_HOURS),
      expenseCost: 200, margin: 0, status: "ready",
    },
    {
      id: "3", client: "Acme Corp", projectId: "p2", projectName: "Data Analytics",
      employeeId: "e3", employeeName: "Lisa Wang", designation: "Business Analyst",
      billableHours: 32, nonBillableHours: 6,
      agreementRate: 200, billableValue: 6400,
      actualCostRate: 45000 / STANDARD_HOURS, actualCost: 32 * (45000 / STANDARD_HOURS),
      expenseCost: 300, margin: 0, status: "pending",
    },
    {
      id: "4", client: "TechStart Inc", projectId: "p3", projectName: "Mobile App",
      employeeId: "e1", employeeName: "Sarah Chen", designation: "Senior Developer",
      billableHours: 45, nonBillableHours: 5,
      agreementRate: 200, billableValue: 9000,
      actualCostRate: 50000 / STANDARD_HOURS, actualCost: 45 * (50000 / STANDARD_HOURS),
      expenseCost: 800, margin: 0, status: "ready",
    },
    {
      id: "5", client: "TechStart Inc", projectId: "p4", projectName: "API Development",
      employeeId: "e4", employeeName: "David Lee", designation: "Team Lead",
      billableHours: 28, nonBillableHours: 2,
      agreementRate: 180, billableValue: 5040,
      actualCostRate: 55000 / STANDARD_HOURS, actualCost: 28 * (55000 / STANDARD_HOURS),
      expenseCost: 150, margin: 0, status: "review",
    },
    {
      id: "6", client: "GlobalBank", projectId: "p5", projectName: "Banking Portal",
      employeeId: "e2", employeeName: "Mike Johnson", designation: "Developer",
      billableHours: 52, nonBillableHours: 8,
      agreementRate: 180, billableValue: 9360,
      actualCostRate: 40000 / STANDARD_HOURS, actualCost: 52 * (40000 / STANDARD_HOURS),
      expenseCost: 600, margin: 0, status: "ready",
    },
    {
      id: "7", client: "GlobalBank", projectId: "p5", projectName: "Banking Portal",
      employeeId: "e5", employeeName: "Emily Brown", designation: "QA Engineer",
      billableHours: 35, nonBillableHours: 5,
      agreementRate: 180, billableValue: 6300,
      actualCostRate: 35000 / STANDARD_HOURS, actualCost: 35 * (35000 / STANDARD_HOURS),
      expenseCost: 250, margin: 0, status: "pending",
    },
    {
      id: "8", client: "RetailMax", projectId: "p6", projectName: "E-Commerce Platform",
      employeeId: "e3", employeeName: "Lisa Wang", designation: "Business Analyst",
      billableHours: 18, nonBillableHours: 2,
      agreementRate: 200, billableValue: 3600,
      actualCostRate: 45000 / STANDARD_HOURS, actualCost: 18 * (45000 / STANDARD_HOURS),
      expenseCost: 100, margin: 0, status: "ready",
    },
  ].map(e => ({ ...e, margin: e.billableValue > 0 ? ((e.billableValue - e.actualCost - e.expenseCost) / e.billableValue * 100) : 0 })) as BillingEntry[], []);

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

  const groupedByClient = useMemo(() => {
    const groups: Record<string, BillingEntry[]> = {};
    filteredData.forEach(entry => {
      if (!groups[entry.client]) groups[entry.client] = [];
      groups[entry.client].push(entry);
    });
    return groups;
  }, [filteredData]);

  const totals = useMemo(() => {
    return filteredData.reduce((acc, entry) => ({
      billableHours: acc.billableHours + entry.billableHours,
      billableValue: acc.billableValue + entry.billableValue,
      actualCost: acc.actualCost + entry.actualCost,
      expenseCost: acc.expenseCost + entry.expenseCost,
    }), { billableHours: 0, billableValue: 0, actualCost: 0, expenseCost: 0 });
  }, [filteredData]);

  const avgMargin = totals.billableValue > 0 
    ? ((totals.billableValue - totals.actualCost - totals.expenseCost) / totals.billableValue * 100).toFixed(1)
    : "0";

  const clientTotals = useMemo(() => {
    const t: Record<string, { hours: number; billableValue: number; actualCost: number; expenseCost: number; agreementValue: number }> = {};
    Object.entries(groupedByClient).forEach(([client, entries]) => {
      t[client] = entries.reduce((acc, e) => ({
        hours: acc.hours + e.billableHours,
        billableValue: acc.billableValue + e.billableValue,
        actualCost: acc.actualCost + e.actualCost,
        expenseCost: acc.expenseCost + e.expenseCost,
        agreementValue: acc.agreementValue + e.billableValue, // agreement = hours × agreed rate
      }), { hours: 0, billableValue: 0, actualCost: 0, expenseCost: 0, agreementValue: 0 });
    });
    return t;
  }, [groupedByClient]);

  const uniqueClients = useMemo(() => [...new Set(mockBillingData.map(e => e.client))], [mockBillingData]);
  const uniqueProjects = useMemo(() => {
    const p = new Map<string, string>();
    mockBillingData.forEach(e => p.set(e.projectId, e.projectName));
    return Array.from(p.entries()).map(([id, name]) => ({ id, name }));
  }, [mockBillingData]);

  const toggleClient = (client: string) => {
    setExpandedClients(prev => prev.includes(client) ? prev.filter(c => c !== client) : [...prev, client]);
  };

  const handleReset = () => {
    setSearchQuery(""); setFilterPeriod("month"); setFilterClient("all"); setFilterProject("all");
  };

  const handleExportCSV = () => {
    const headers = canViewCostData
      ? ["Client", "Project", "Employee", "Designation", "Billable Hrs", "Agreement Rate", "Billable Value", "Actual Cost", "Expense Cost", "Margin"]
      : ["Client", "Project", "Employee", "Billable Hrs", "Billable Value"];
    const rows = filteredData.map(entry => {
      const base = [entry.client, entry.projectName, entry.employeeName];
      if (canViewCostData) {
        base.push(entry.designation, `${entry.billableHours}h`, `$${entry.agreementRate}`, `$${entry.billableValue.toLocaleString()}`, `$${entry.actualCost.toFixed(0)}`, `$${entry.expenseCost}`, `${entry.margin.toFixed(1)}%`);
      } else {
        base.push(`${entry.billableHours}h`, `$${entry.billableValue.toLocaleString()}`);
      }
      return base;
    });
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `billing-summary-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Billing summary exported to CSV");
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      ready: { label: "Ready", className: "bg-success/10 text-success border-success/20" },
      pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
      review: { label: "Review", className: "bg-info/10 text-info border-info/20" },
    };
    return configs[status] || configs.ready;
  };

  const readyCount = filteredData.filter(e => e.status === "ready").length;
  const pendingCount = filteredData.filter(e => e.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing Summary</h1>
            <p className="text-muted-foreground mt-1">
              Review agreement, actual, expense, and billable costing across clients and projects
            </p>
          </div>
          <Button onClick={handleExportCSV} className="gap-2 bg-primary text-primary-foreground">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-info/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Agreement Costing</p>
                  <p className="text-2xl font-bold mt-2 text-foreground">${totals.billableValue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Client agreed rates × hours</p>
                </div>
                <div className="p-3 bg-info/10 rounded-xl">
                  <FileCheck className="h-5 w-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-warning/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expense Costing</p>
                  <p className="text-2xl font-bold mt-2 text-warning">${totals.expenseCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Project expenses</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-xl">
                  <Receipt className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          {canViewCostData && (
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-destructive/20 to-transparent rounded-bl-full" />
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Actual Costing</p>
                    <p className="text-2xl font-bold mt-2 text-foreground">${Math.round(totals.actualCost).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Salary ÷ {STANDARD_HOURS}h × hours</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-xl">
                    <Calculator className="h-5 w-5 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-success/20 to-transparent rounded-bl-full" />
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Billable Costing</p>
                  <p className="text-2xl font-bold mt-2 text-success">${totals.billableValue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{totals.billableHours}h billable</p>
                </div>
                <div className="p-3 bg-success/10 rounded-xl">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          {canViewCostData && (
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent/20 to-transparent rounded-bl-full" />
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Margin</p>
                    <p className="text-2xl font-bold mt-2 text-foreground">{avgMargin}%</p>
                    <p className="text-xs text-success mt-1">After actual + expenses</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <Percent className="h-5 w-5 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!canViewCostData && (
            <>
              <Card className="relative overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ready to Bill</p>
                      <p className="text-2xl font-bold mt-2 text-success">{readyCount}</p>
                    </div>
                    <div className="p-3 bg-success/10 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold mt-2 text-warning">{pendingCount}</p>
                    </div>
                    <div className="p-3 bg-warning/10 rounded-xl">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search employees, projects, clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Period" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterClient} onValueChange={setFilterClient}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Clients" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Clients</SelectItem>
                    {uniqueClients.map(client => <SelectItem key={client} value={client}>{client}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterProject} onValueChange={setFilterProject}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Projects" /></SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    {uniqueProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={handleReset} className="shrink-0">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Details Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Billing by Client</CardTitle>
                  <p className="text-sm text-muted-foreground">{Object.keys(groupedByClient).length} clients • {filteredData.length} entries</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="font-semibold">Project / Employee</TableHead>
                    <TableHead className="font-semibold text-right">Billable Hrs</TableHead>
                    <TableHead className="font-semibold text-right">Agreement</TableHead>
                    {canViewCostData && (
                      <>
                        <TableHead className="font-semibold text-right">Actual Cost</TableHead>
                        <TableHead className="font-semibold text-right">Expenses</TableHead>
                      </>
                    )}
                    <TableHead className="font-semibold text-right">Billable Value</TableHead>
                    {canViewCostData && (
                      <TableHead className="font-semibold text-right">Margin</TableHead>
                    )}
                    <TableHead className="font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedByClient).map(([client, entries]) => {
                    const isExpanded = expandedClients.includes(client);
                    const ct = clientTotals[client];
                    const clientMargin = ct ? ((ct.billableValue - ct.actualCost - ct.expenseCost) / ct.billableValue * 100).toFixed(1) : "0";
                    
                    return (
                      <>
                        <TableRow 
                          key={`client-${client}`}
                          className="cursor-pointer hover:bg-muted/50 bg-muted/30"
                          onClick={() => toggleClient(client)}
                        >
                          <TableCell className="py-4">
                            <div className="p-1 rounded hover:bg-muted transition-colors">
                              {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">{client}</span>
                                <p className="text-xs text-muted-foreground">{entries.length} entries</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold py-4">{ct?.hours}h</TableCell>
                          <TableCell className="text-right font-semibold text-info py-4">${ct?.billableValue.toLocaleString()}</TableCell>
                          {canViewCostData && (
                            <>
                              <TableCell className="text-right py-4">${Math.round(ct?.actualCost || 0).toLocaleString()}</TableCell>
                              <TableCell className="text-right text-warning py-4">${ct?.expenseCost.toLocaleString()}</TableCell>
                            </>
                          )}
                          <TableCell className="text-right font-semibold text-success py-4">${ct?.billableValue.toLocaleString()}</TableCell>
                          {canViewCostData && (
                            <TableCell className="text-right font-semibold text-success py-4">{clientMargin}%</TableCell>
                          )}
                          <TableCell className="py-4"></TableCell>
                        </TableRow>
                        {isExpanded && entries.map(entry => {
                          const statusConfig = getStatusBadge(entry.status);
                          return (
                            <TableRow key={entry.id} className="hover:bg-muted/20">
                              <TableCell></TableCell>
                              <TableCell>
                                <div className="pl-8">
                                  <p className="font-medium text-foreground">{entry.projectName}</p>
                                  <p className="text-sm text-muted-foreground">{entry.employeeName} • {entry.designation}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">{entry.billableHours}h</TableCell>
                              <TableCell className="text-right text-info">
                                <div>
                                  <p className="font-medium">${entry.billableValue.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">@${entry.agreementRate}/hr</p>
                                </div>
                              </TableCell>
                              {canViewCostData && (
                                <>
                                  <TableCell className="text-right">
                                    <div>
                                      <p className="font-medium">${Math.round(entry.actualCost).toLocaleString()}</p>
                                      <p className="text-xs text-muted-foreground">@${entry.actualCostRate.toFixed(0)}/hr</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right text-warning">${entry.expenseCost.toLocaleString()}</TableCell>
                                </>
                              )}
                              <TableCell className="text-right font-medium text-success">${entry.billableValue.toLocaleString()}</TableCell>
                              {canViewCostData && (
                                <TableCell className="text-right font-medium">
                                  <span className={entry.margin >= 50 ? "text-success" : entry.margin >= 30 ? "text-warning" : "text-destructive"}>
                                    {entry.margin.toFixed(1)}%
                                  </span>
                                </TableCell>
                              )}
                              <TableCell className="text-center">
                                <Badge variant="outline" className={statusConfig.className}>{statusConfig.label}</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BillingSummary;
