import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Plus, Pencil, History, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { CURRENCY_SYMBOLS } from "@/types/project";

type Profile = Tables<"profiles">;
type EmployeeRate = Tables<"employee_rates">;

interface EmployeeWithRate extends Profile {
  currentRate?: EmployeeRate;
  rateHistory: EmployeeRate[];
}

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

const EmployeeRates = () => {
  const { user, hasPermission } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rates, setRates] = useState<EmployeeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithRate | null>(null);
  const [filterDepartment, setFilterDepartment] = useState("all");
  
  // Form state
  const [formData, setFormData] = useState({
    userId: "",
    costRate: "",
    billRate: "",
    currency: "USD",
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
    notes: "",
  });

  const canManageRates = hasPermission(["admin", "finance"]);
  const canViewRates = hasPermission(["admin", "finance", "manager"]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [profilesRes, ratesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("is_active", true).order("full_name"),
        supabase.from("employee_rates").select("*").order("effective_from", { ascending: false }),
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data);
      if (ratesRes.data) setRates(ratesRes.data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Build employees with current rates
  const employeesWithRates = useMemo((): EmployeeWithRate[] => {
    const today = new Date().toISOString().split("T")[0];
    
    return profiles.map(profile => {
      const employeeRates = rates.filter(r => r.user_id === profile.id);
      
      // Find current effective rate
      const currentRate = employeeRates.find(r => 
        r.effective_from <= today && 
        (r.effective_to === null || r.effective_to >= today)
      );
      
      return {
        ...profile,
        currentRate,
        rateHistory: employeeRates,
      };
    });
  }, [profiles, rates]);

  // Filter by department
  const filteredEmployees = useMemo(() => {
    if (filterDepartment === "all") return employeesWithRates;
    return employeesWithRates.filter(e => e.department === filterDepartment);
  }, [employeesWithRates, filterDepartment]);

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(profiles.map(p => p.department).filter(Boolean));
    return Array.from(depts);
  }, [profiles]);

  // Summary stats
  const stats = useMemo(() => {
    const withRates = employeesWithRates.filter(e => e.currentRate);
    const withoutRates = employeesWithRates.filter(e => !e.currentRate);
    const avgBillRate = withRates.length > 0 
      ? withRates.reduce((sum, e) => sum + (e.currentRate?.bill_rate || 0), 0) / withRates.length
      : 0;
    const avgCostRate = withRates.length > 0
      ? withRates.reduce((sum, e) => sum + (e.currentRate?.cost_rate || 0), 0) / withRates.length
      : 0;
    
    return {
      totalEmployees: employeesWithRates.length,
      withRates: withRates.length,
      withoutRates: withoutRates.length,
      avgBillRate,
      avgCostRate,
      avgMargin: avgBillRate > 0 ? ((avgBillRate - avgCostRate) / avgBillRate * 100) : 0,
    };
  }, [employeesWithRates]);

  const handleOpenAddDialog = (employee?: EmployeeWithRate) => {
    if (employee) {
      setFormData({
        userId: employee.id,
        costRate: employee.currentRate?.cost_rate.toString() || "",
        billRate: employee.currentRate?.bill_rate.toString() || "",
        currency: employee.currentRate?.currency || "USD",
        effectiveFrom: new Date().toISOString().split("T")[0],
        effectiveTo: "",
        notes: "",
      });
    } else {
      setFormData({
        userId: "",
        costRate: "",
        billRate: "",
        currency: "USD",
        effectiveFrom: new Date().toISOString().split("T")[0],
        effectiveTo: "",
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleViewHistory = (employee: EmployeeWithRate) => {
    setSelectedEmployee(employee);
    setIsHistoryOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.costRate || !formData.billRate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const costRate = parseFloat(formData.costRate);
    const billRate = parseFloat(formData.billRate);

    if (costRate < 0 || billRate < 0) {
      toast.error("Rates must be positive numbers");
      return;
    }

    if (costRate > billRate) {
      toast.error("Cost rate should not exceed bill rate");
      return;
    }

    // Close previous rate if exists
    const existingRate = rates.find(r => 
      r.user_id === formData.userId && 
      r.effective_to === null
    );

    if (existingRate) {
      const previousDay = new Date(formData.effectiveFrom);
      previousDay.setDate(previousDay.getDate() - 1);
      
      await supabase
        .from("employee_rates")
        .update({ effective_to: previousDay.toISOString().split("T")[0] })
        .eq("id", existingRate.id);
    }

    // Insert new rate
    const { error } = await supabase.from("employee_rates").insert({
      user_id: formData.userId,
      cost_rate: costRate,
      bill_rate: billRate,
      currency: formData.currency,
      effective_from: formData.effectiveFrom,
      effective_to: formData.effectiveTo || null,
      notes: formData.notes || null,
      created_by: user?.id,
    });

    if (error) {
      toast.error("Failed to save rate: " + error.message);
      return;
    }

    toast.success("Rate saved successfully");
    setIsDialogOpen(false);
    
    // Refresh rates
    const { data } = await supabase
      .from("employee_rates")
      .select("*")
      .order("effective_from", { ascending: false });
    if (data) setRates(data);
  };

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || "$";
  };

  const formatRate = (rate: number, currency: string) => {
    return `${getCurrencySymbol(currency)}${rate.toFixed(2)}`;
  };

  const getMarginBadge = (costRate: number, billRate: number) => {
    const margin = billRate > 0 ? ((billRate - costRate) / billRate * 100) : 0;
    if (margin >= 40) {
      return <Badge className="bg-success text-success-foreground">{margin.toFixed(0)}%</Badge>;
    } else if (margin >= 20) {
      return <Badge variant="secondary">{margin.toFixed(0)}%</Badge>;
    } else {
      return <Badge variant="destructive">{margin.toFixed(0)}%</Badge>;
    }
  };

  // Mock data for demo when no real data exists
  const mockEmployeesWithRates: EmployeeWithRate[] = useMemo(() => {
    if (profiles.length > 0) return [];
    
    return [
      {
        id: "1",
        full_name: "John Doe",
        email: "john.doe@company.com",
        department: "Engineering",
        designation: "Senior Developer",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currentRate: {
          id: "r1",
          user_id: "1",
          cost_rate: 75,
          bill_rate: 150,
          currency: "USD",
          effective_from: "2024-01-01",
          effective_to: null,
          notes: null,
          created_by: null,
          created_at: new Date().toISOString(),
        },
        rateHistory: [],
      },
      {
        id: "2",
        full_name: "Sarah Smith",
        email: "sarah.smith@company.com",
        department: "Engineering",
        designation: "Tech Lead",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currentRate: {
          id: "r2",
          user_id: "2",
          cost_rate: 85,
          bill_rate: 175,
          currency: "USD",
          effective_from: "2024-01-01",
          effective_to: null,
          notes: null,
          created_by: null,
          created_at: new Date().toISOString(),
        },
        rateHistory: [],
      },
      {
        id: "3",
        full_name: "Mike Johnson",
        email: "mike.johnson@company.com",
        department: "Design",
        designation: "UI/UX Designer",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currentRate: {
          id: "r3",
          user_id: "3",
          cost_rate: 65,
          bill_rate: 125,
          currency: "USD",
          effective_from: "2024-01-01",
          effective_to: null,
          notes: null,
          created_by: null,
          created_at: new Date().toISOString(),
        },
        rateHistory: [],
      },
      {
        id: "4",
        full_name: "Emily Brown",
        email: "emily.brown@company.com",
        department: "Engineering",
        designation: "Developer",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currentRate: {
          id: "r4",
          user_id: "4",
          cost_rate: 60,
          bill_rate: 120,
          currency: "USD",
          effective_from: "2024-01-01",
          effective_to: null,
          notes: null,
          created_by: null,
          created_at: new Date().toISOString(),
        },
        rateHistory: [],
      },
      {
        id: "5",
        full_name: "David Lee",
        email: "david.lee@company.com",
        department: "QA",
        designation: "QA Engineer",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currentRate: undefined,
        rateHistory: [],
      },
      {
        id: "6",
        full_name: "Lisa Wang",
        email: "lisa.wang@company.com",
        department: "Engineering",
        designation: "Senior Developer",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currentRate: {
          id: "r6",
          user_id: "6",
          cost_rate: 80,
          bill_rate: 160,
          currency: "USD",
          effective_from: "2024-06-01",
          effective_to: null,
          notes: "Promoted from Developer",
          created_by: null,
          created_at: new Date().toISOString(),
        },
        rateHistory: [],
      },
      {
        id: "7",
        full_name: "James Wilson",
        email: "james.wilson@company.com",
        department: "Engineering",
        designation: "Junior Developer",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currentRate: {
          id: "r7",
          user_id: "7",
          cost_rate: 45,
          bill_rate: 95,
          currency: "USD",
          effective_from: "2024-03-01",
          effective_to: null,
          notes: null,
          created_by: null,
          created_at: new Date().toISOString(),
        },
        rateHistory: [],
      },
      {
        id: "8",
        full_name: "Anna Martinez",
        email: "anna.martinez@company.com",
        department: "Design",
        designation: "Design Lead",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currentRate: {
          id: "r8",
          user_id: "8",
          cost_rate: 90,
          bill_rate: 180,
          currency: "USD",
          effective_from: "2024-01-01",
          effective_to: null,
          notes: null,
          created_by: null,
          created_at: new Date().toISOString(),
        },
        rateHistory: [],
      },
      {
        id: "9",
        full_name: "Robert Taylor",
        email: "robert.taylor@company.com",
        department: "QA",
        designation: "QA Lead",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currentRate: {
          id: "r9",
          user_id: "9",
          cost_rate: 70,
          bill_rate: 140,
          currency: "USD",
          effective_from: "2024-01-01",
          effective_to: null,
          notes: null,
          created_by: null,
          created_at: new Date().toISOString(),
        },
        rateHistory: [],
      },
      {
        id: "10",
        full_name: "Jennifer Garcia",
        email: "jennifer.garcia@company.com",
        department: "Engineering",
        designation: "DevOps Engineer",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currentRate: {
          id: "r10",
          user_id: "10",
          cost_rate: 85,
          bill_rate: 170,
          currency: "USD",
          effective_from: "2024-01-01",
          effective_to: null,
          notes: null,
          created_by: null,
          created_at: new Date().toISOString(),
        },
        rateHistory: [],
      },
    ];
  }, [profiles]);

  const displayEmployees = filteredEmployees.length > 0 ? filteredEmployees : mockEmployeesWithRates;

  // Calculate stats for display
  const displayStats = useMemo(() => {
    const data = displayEmployees;
    const withRates = data.filter(e => e.currentRate);
    const withoutRates = data.filter(e => !e.currentRate);
    const avgBillRate = withRates.length > 0 
      ? withRates.reduce((sum, e) => sum + (e.currentRate?.bill_rate || 0), 0) / withRates.length
      : 0;
    const avgCostRate = withRates.length > 0
      ? withRates.reduce((sum, e) => sum + (e.currentRate?.cost_rate || 0), 0) / withRates.length
      : 0;
    
    return {
      totalEmployees: data.length,
      withRates: withRates.length,
      withoutRates: withoutRates.length,
      avgBillRate,
      avgCostRate,
      avgMargin: avgBillRate > 0 ? ((avgBillRate - avgCostRate) / avgBillRate * 100) : 0,
    };
  }, [displayEmployees]);

  if (!canViewRates) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground mt-2">
              You don't have permission to view employee rates.
            </p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Rates</h1>
            <p className="text-muted-foreground mt-1">
              Manage billing and cost rates for employees
            </p>
          </div>
          {canManageRates && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenAddDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Rate
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background">
                <DialogHeader>
                  <DialogTitle>Add Employee Rate</DialogTitle>
                  <DialogDescription>
                    Set billing and cost rates with effective dates for rate history tracking.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Employee *</Label>
                    <Select 
                      value={formData.userId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        {(profiles.length > 0 ? profiles : mockEmployeesWithRates).map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.full_name} - {p.designation || "No designation"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select 
                        value={formData.currency} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          {CURRENCIES.map(c => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.symbol} {c.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cost Rate (per hour) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="75.00"
                        value={formData.costRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, costRate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bill Rate (per hour) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="150.00"
                        value={formData.billRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, billRate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Effective From *</Label>
                      <Input
                        type="date"
                        value={formData.effectiveFrom}
                        onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Effective To (optional)</Label>
                      <Input
                        type="date"
                        value={formData.effectiveTo}
                        onChange={(e) => setFormData(prev => ({ ...prev, effectiveTo: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Reason for rate change, promotion, etc."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  {formData.costRate && formData.billRate && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Margin: <span className="font-semibold text-foreground">
                          {((parseFloat(formData.billRate) - parseFloat(formData.costRate)) / parseFloat(formData.billRate) * 100).toFixed(1)}%
                        </span>
                      </p>
                    </div>
                  )}

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Rate</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {displayStats.totalEmployees}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">With Rates</p>
              <p className="text-3xl font-bold text-success mt-2">
                {displayStats.withRates}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Missing Rates</p>
              <p className="text-3xl font-bold text-destructive mt-2">
                {displayStats.withoutRates}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Avg Bill Rate</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ${displayStats.avgBillRate.toFixed(0)}/h
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Avg Margin</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {displayStats.avgMargin.toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="space-y-2 w-64">
                <Label>Department</Label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(d => (
                      <SelectItem key={d} value={d!}>{d}</SelectItem>
                    ))}
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="QA">QA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rates Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Employee Rate Configuration</CardTitle>
              <Badge variant="secondary">{displayEmployees.length} Employees</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-right">Cost Rate</TableHead>
                  <TableHead className="text-right">Bill Rate</TableHead>
                  <TableHead className="text-center">Margin</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.full_name}</p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department || "-"}</TableCell>
                    <TableCell>{employee.designation || "-"}</TableCell>
                    <TableCell className="text-right">
                      {employee.currentRate ? (
                        formatRate(employee.currentRate.cost_rate, employee.currentRate.currency)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {employee.currentRate ? (
                        formatRate(employee.currentRate.bill_rate, employee.currentRate.currency)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {employee.currentRate ? (
                        getMarginBadge(employee.currentRate.cost_rate, employee.currentRate.bill_rate)
                      ) : (
                        <Badge variant="outline">No rate</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.currentRate?.effective_from || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canManageRates && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenAddDialog(employee)}
                            title="Edit Rate"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewHistory(employee)}
                          title="View History"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Rate History Dialog */}
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="bg-background max-w-2xl">
            <DialogHeader>
              <DialogTitle>Rate History - {selectedEmployee?.full_name}</DialogTitle>
              <DialogDescription>
                Historical billing and cost rates for this employee
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-auto">
              {selectedEmployee?.rateHistory && selectedEmployee.rateHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Effective From</TableHead>
                      <TableHead>Effective To</TableHead>
                      <TableHead className="text-right">Cost Rate</TableHead>
                      <TableHead className="text-right">Bill Rate</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEmployee.rateHistory.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell>{rate.effective_from}</TableCell>
                        <TableCell>{rate.effective_to || "Current"}</TableCell>
                        <TableCell className="text-right">
                          {formatRate(rate.cost_rate, rate.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRate(rate.bill_rate, rate.currency)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {rate.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No rate history available for this employee.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeRates;
