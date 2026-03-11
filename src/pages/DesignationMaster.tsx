import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const STANDARD_HOURS = 198;

interface DesignationRate {
  id: string;
  designation: string;
  monthly_salary: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DesignationMaster = () => {
  const [designations, setDesignations] = useState<DesignationRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ designation: "", hourly_rate: "", currency: "USD" });

  const fetchDesignations = async () => {
    const { data, error } = await supabase
      .from("designation_rates")
      .select("*")
      .order("designation");
    if (error) {
      toast.error("Failed to load designations");
    } else {
      setDesignations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDesignations(); }, []);

  const handleSubmit = async () => {
    if (!form.designation.trim() || !form.hourly_rate) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      designation: form.designation.trim(),
      monthly_salary: parseFloat(form.monthly_salary),
      currency: form.currency,
    };

    if (editingId) {
      const { error } = await supabase
        .from("designation_rates")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        toast.error("Failed to update: " + error.message);
        return;
      }
      toast.success("Designation updated");
    } else {
      const { error } = await supabase
        .from("designation_rates")
        .insert(payload);
      if (error) {
        toast.error("Failed to create: " + error.message);
        return;
      }
      toast.success("Designation created");
    }

    setDialogOpen(false);
    setEditingId(null);
    setForm({ designation: "", monthly_salary: "", currency: "USD" });
    fetchDesignations();
  };

  const handleEdit = (d: DesignationRate) => {
    setEditingId(d.id);
    setForm({
      designation: d.designation,
      monthly_salary: d.monthly_salary.toString(),
      currency: d.currency,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("designation_rates")
      .update({ is_active: false })
      .eq("id", id);
    if (error) {
      toast.error("Failed to deactivate");
    } else {
      toast.success("Designation deactivated");
      fetchDesignations();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Designation Master</h1>
            <p className="text-muted-foreground mt-1">
              Manage designations and their monthly salary rates (Hourly = Salary ÷ {STANDARD_HOURS}h)
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) { setEditingId(null); setForm({ designation: "", monthly_salary: "", currency: "USD" }); }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground">
                <Plus className="h-4 w-4" />
                Add Designation
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "Add"} Designation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Designation Name *</Label>
                  <Input
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    placeholder="e.g. Senior Developer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Salary *</Label>
                  <Input
                    type="number"
                    value={form.monthly_salary}
                    onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })}
                    placeholder="e.g. 50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.monthly_salary && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Computed Hourly Rate</p>
                    <p className="text-lg font-bold text-foreground">
                      {form.currency} {(parseFloat(form.monthly_salary) / STANDARD_HOURS).toFixed(2)}/hr
                    </p>
                    <p className="text-xs text-muted-foreground">Monthly Salary ÷ {STANDARD_HOURS} standard hours</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingId ? "Update" : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Designations & Rates</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {designations.filter(d => d.is_active).length} active designations
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-right">Monthly Salary</TableHead>
                  <TableHead className="text-right">Hourly Rate (÷{STANDARD_HOURS})</TableHead>
                  <TableHead className="text-center">Currency</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell>
                  </TableRow>
                ) : designations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No designations found. Add your first designation above.
                    </TableCell>
                  </TableRow>
                ) : (
                  designations.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.designation}</TableCell>
                      <TableCell className="text-right">{d.monthly_salary.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {(d.monthly_salary / STANDARD_HOURS).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">{d.currency}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={d.is_active ? "default" : "secondary"}>
                          {d.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(d)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {d.is_active && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DesignationMaster;
