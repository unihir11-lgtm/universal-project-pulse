import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Layers, ArrowRight, CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const DAILY_CAPACITY = 8;

const projectsData = [
  { id: 1, name: "Go Live" },
  { id: 2, name: "Human Resource" },
  { id: 3, name: "Jain Connection Marketing" },
  { id: 4, name: "Jain Marketplace" },
  { id: 5, name: "Product Support" },
  { id: 6, name: "Super App" },
  { id: 7, name: "Universal Software" },
];

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

const getTotalDays = (start: string, end: string): number => {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(0, Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1);
};

const CreateSprint = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState("");
  const [sprintName, setSprintName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  const sprintCalc = useMemo(() => {
    if (!startDate || !endDate) return null;
    const totalDays = getTotalDays(startDate, endDate);
    const workingDays = getWorkingDays(startDate, endDate);
    const workingDayCount = workingDays.length;
    const capacityPerEmployee = workingDayCount * DAILY_CAPACITY;
    return { totalDays, workingDayCount, capacityPerEmployee, workingDays };
  }, [startDate, endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) { toast.error("Please select a project"); return; }
    if (!sprintName.trim()) { toast.error("Please enter sprint name"); return; }
    if (!startDate) { toast.error("Please select start date"); return; }
    if (!endDate) { toast.error("Please select end date"); return; }
    if (!status) { toast.error("Please select status"); return; }
    if (new Date(endDate) < new Date(startDate)) { toast.error("End date must be after start date"); return; }

    toast.success(`Sprint "${sprintName}" created successfully!`);
    // In real app, save to DB and navigate to task allocation
    navigate("/sprint-task-allocation");
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Create Sprint</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define a new sprint with dates, project, and capacity overview
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sprint Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                </div>
                Sprint Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Project *</Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger className="h-9 text-sm bg-background"><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent className="bg-background">
                      {projectsData.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Sprint Name *</Label>
                  <Input placeholder="e.g., Sprint 1" value={sprintName} onChange={e => setSprintName(e.target.value)} className="h-9 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Start Date *</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">End Date *</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Status *</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9 text-sm bg-background"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Description</Label>
                <Textarea placeholder="Sprint goals and description..." value={description} onChange={e => setDescription(e.target.value)} className="text-sm min-h-[80px]" />
              </div>
            </CardContent>
          </Card>

          {/* Capacity Summary Card */}
          {sprintCalc && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Sprint Capacity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-lg border bg-muted/30 p-4 text-center">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Sprint Days</p>
                    <p className="text-2xl font-bold text-foreground">{sprintCalc.totalDays}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">calendar days</p>
                  </div>
                  <div className="rounded-lg border bg-[hsl(var(--success))]/5 border-[hsl(var(--success))]/20 p-4 text-center">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Working Days</p>
                    <p className="text-2xl font-bold text-[hsl(var(--success))]">{sprintCalc.workingDayCount}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">excl. Sat & Sun</p>
                  </div>
                  <div className="rounded-lg border bg-[hsl(var(--info))]/5 border-[hsl(var(--info))]/20 p-4 text-center">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Hours / Employee</p>
                    <p className="text-2xl font-bold text-[hsl(var(--info))]">{sprintCalc.capacityPerEmployee}h</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{sprintCalc.workingDayCount} days × {DAILY_CAPACITY}h</p>
                  </div>
                  <div className="rounded-lg border bg-accent/5 border-accent/20 p-4 text-center">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Daily Capacity</p>
                    <p className="text-2xl font-bold text-accent">{DAILY_CAPACITY}h</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">per employee/day</p>
                  </div>
                </div>

                {/* Working Days List */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Working Days Breakdown</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sprintCalc.workingDays.map(day => {
                      const d = new Date(day);
                      return (
                        <Badge key={day} variant="outline" className="text-[10px] font-mono">
                          {d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" className="gap-1.5">
              <CheckCircle className="h-4 w-4" />
              Create Sprint
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/sprints")}>
              Cancel
            </Button>
            {sprintCalc && (
              <Button type="button" variant="ghost" className="ml-auto gap-1.5 text-primary" onClick={() => navigate("/sprint-task-allocation")}>
                Go to Task Allocation
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateSprint;
