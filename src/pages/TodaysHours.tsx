import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  TableFooter,
} from "@/components/ui/table";
import { Download, Clock, LogOut, LogIn, Filter, Coffee, Calendar, Target, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const TodaysHours = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleExport = () => {
    toast.success("Exporting attendance data to Excel...");
  };

  const TARGET_HOURS = 9;

  const attendanceData = {
    inTime: "09:05 AM",
    outTime: "06:10 PM",
    totalHours: 8.3,
    breakDuration: 0.75,
    productiveHours: 7.55,
  };

  const breakSessions = [
    { id: 1, breakIn: "10:30 AM", breakOut: "10:45 AM", duration: 0.25, type: "Tea" },
    { id: 2, breakIn: "12:30 PM", breakOut: "01:15 PM", duration: 0.75, type: "Lunch" },
    { id: 3, breakIn: "04:00 PM", breakOut: "04:15 PM", duration: 0.25, type: "Tea" },
  ];

  const totalBreakDuration = breakSessions.reduce((sum, b) => sum + b.duration, 0);

  const monthlyData = {
    workingDays: 22,
    expectedHours: 22 * 9, // 198
    actualHours: 185.5,
    difference: 185.5 - (22 * 9), // -12.5
  };

  // Spent hours calculation
  const spentPercentage = Math.min((attendanceData.productiveHours / TARGET_HOURS) * 100, 100);
  const extraHours = Math.max(attendanceData.productiveHours - TARGET_HOURS, 0);
  const remainingHours = Math.max(TARGET_HOURS - attendanceData.productiveHours, 0);

  const getProgressColor = () => {
    if (attendanceData.productiveHours >= TARGET_HOURS) return "bg-blue-500";
    if (attendanceData.productiveHours >= TARGET_HOURS * 0.8) return "bg-success";
    return "bg-destructive";
  };

  const getStatusBadge = () => {
    if (extraHours > 0) {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Extra Hours</Badge>;
    }
    if (attendanceData.productiveHours >= TARGET_HOURS * 0.8) {
      return <Badge className="bg-success/10 text-success border-success/20">On Track</Badge>;
    }
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Under Target</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Today's Hours</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Real-time attendance tracking and biometric data
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export to Excel</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>

        {/* Filters - Inline */}
        <Card>
          <CardContent className="py-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-full sm:w-[180px] h-9">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="john-doe">John Doe (EMP001)</SelectItem>
                  <SelectItem value="sarah-smith">Sarah Smith (EMP002)</SelectItem>
                  <SelectItem value="mike-johnson">Mike Johnson (EMP003)</SelectItem>
                  <SelectItem value="emily-brown">Emily Brown (EMP004)</SelectItem>
                  <SelectItem value="david-lee">David Lee (EMP005)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-[160px] h-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Combined Daily Overview Card */}
        <Card>
          <CardContent className="py-4 space-y-4">
            {/* Top Row: Daily Summary & Spent Hours Tracker */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Daily Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Daily Summary</h3>
                </div>
                <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                  <div className="text-center px-4 py-2 bg-primary rounded-full">
                    <p className="text-[9px] text-primary-foreground/80 uppercase tracking-wide">Total Hours</p>
                    <p className="text-lg font-bold text-primary-foreground">{attendanceData.totalHours}h</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <p className="text-[9px] text-amber-700 dark:text-amber-400 uppercase tracking-wide">Break</p>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{totalBreakDuration}h</p>
                  </div>
                  <div className="text-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                    <p className="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Productive</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{attendanceData.productiveHours}h</p>
                  </div>
                  <div className={`text-center px-4 py-2 rounded-full ${monthlyData.difference >= 0 ? 'bg-success/20' : 'bg-destructive/20'}`}>
                    <p className={`text-[9px] uppercase tracking-wide ${monthlyData.difference >= 0 ? 'text-success/80' : 'text-destructive/80'}`}>Monthly Diff</p>
                    <p className={`text-lg font-bold ${monthlyData.difference >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {monthlyData.difference >= 0 ? '+' : ''}{monthlyData.difference}h
                    </p>
                  </div>
                </div>
              </div>

              {/* Spent Hours Tracker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Spent Hours Tracker</h3>
                  </div>
                  {getStatusBadge()}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{attendanceData.productiveHours}h / {TARGET_HOURS}h</span>
                  </div>
                  <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all ${getProgressColor()}`}
                      style={{ width: `${spentPercentage}%` }}
                    />
                  </div>
                  <div className="flex gap-2">
                    {remainingHours > 0 && (
                      <div className="inline-block px-3 py-1.5 bg-destructive/5 rounded-md border border-destructive/10">
                        <p className="text-[10px] text-muted-foreground">Remaining</p>
                        <p className="text-sm font-bold text-destructive">{remainingHours.toFixed(2)}h</p>
                      </div>
                    )}
                    {extraHours > 0 && (
                      <div className="inline-block px-3 py-1.5 bg-blue-500/5 rounded-md border border-blue-500/10">
                        <p className="text-[10px] text-muted-foreground">Extra</p>
                        <p className="text-sm font-bold text-blue-600">+{extraHours.toFixed(2)}h</p>
                      </div>
                    )}
                    {remainingHours === 0 && extraHours === 0 && (
                      <div className="inline-block px-3 py-1.5 bg-success/5 rounded-md border border-success/10">
                        <p className="text-[10px] text-muted-foreground">Target Met</p>
                        <p className="text-sm font-bold text-success">✓ Complete</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Bottom Row: Check-In / Check-Out */}
            <div className="grid gap-3 md:grid-cols-2">
              {/* Check-In */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <LogIn className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-medium text-muted-foreground">First Check-In</h4>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px] px-1.5 py-0">
                      On Time
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-foreground">{attendanceData.inTime}</p>
                  <p className="text-[10px] text-muted-foreground">Biometric ID: EMP001 verified</p>
                </div>
              </div>

              {/* Check-Out */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <LogOut className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Final Check-Out</h4>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] px-1.5 py-0">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-foreground">{attendanceData.outTime}</p>
                  <p className="text-[10px] text-muted-foreground">Biometric ID: EMP001 verified</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Break Sessions */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Coffee className="h-4 w-4 text-accent" />
              Break Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-sm">Break #</TableHead>
                  <TableHead className="text-sm">
                    <div className="flex items-center gap-1.5">
                      <Pause className="h-3 w-3" />
                      Break-In
                    </div>
                  </TableHead>
                  <TableHead className="text-sm">
                    <div className="flex items-center gap-1.5">
                      <Play className="h-3 w-3" />
                      Break-Out
                    </div>
                  </TableHead>
                  <TableHead className="text-sm">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium py-2 text-sm">{session.id}</TableCell>
                    <TableCell className="py-2 text-sm">{session.breakIn}</TableCell>
                    <TableCell className="py-2 text-sm">{session.breakOut}</TableCell>
                    <TableCell className="py-2 text-sm">{session.duration}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-semibold text-sm py-2">Total Break Duration</TableCell>
                  <TableCell className="font-bold text-accent py-2 text-sm">{totalBreakDuration}h</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default TodaysHours;
