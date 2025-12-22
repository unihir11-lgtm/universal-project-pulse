import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  TableFooter,
} from "@/components/ui/table";
import { Download, Clock, LogOut, LogIn, Filter, Coffee, Target, Pause, Play } from "lucide-react";
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
    expectedHours: 22 * 9,
    actualHours: 185.5,
    difference: 185.5 - (22 * 9),
  };

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
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] px-2 py-0">Extra Hours</Badge>;
    }
    if (attendanceData.productiveHours >= TARGET_HOURS * 0.8) {
      return <Badge className="bg-success/10 text-success border-success/20 text-[10px] px-2 py-0">On Track</Badge>;
    }
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] px-2 py-0">Under Target</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-2">
        {/* Header + Filters inline */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-lg font-bold text-foreground">Today's Hours</h1>
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[150px] h-7 text-xs">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="john-doe">John Doe</SelectItem>
                  <SelectItem value="sarah-smith">Sarah Smith</SelectItem>
                  <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[130px] h-7 text-xs"
              />
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            <Download className="h-3 w-3" />
            Export
          </Button>
        </div>

        {/* Combined Daily Overview Card - Compact */}
        <Card>
          <CardContent className="py-3 space-y-3">
            {/* Top Row: Daily Summary & Spent Hours Tracker */}
            <div className="grid gap-3 lg:grid-cols-2">
              {/* Daily Summary */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-xs font-semibold text-foreground">Daily Summary</h3>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <div className="text-center px-3 py-1.5 bg-primary rounded-full">
                    <p className="text-[8px] text-primary-foreground/80 uppercase tracking-wide">Total Hours</p>
                    <p className="text-sm font-bold text-primary-foreground">{attendanceData.totalHours}h</p>
                  </div>
                  <div className="text-center px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <p className="text-[8px] text-amber-700 dark:text-amber-400 uppercase tracking-wide">Break</p>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{totalBreakDuration}h</p>
                  </div>
                  <div className="text-center px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                    <p className="text-[8px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Productive</p>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{attendanceData.productiveHours}h</p>
                  </div>
                  <div className={`text-center px-3 py-1.5 rounded-full ${monthlyData.difference >= 0 ? 'bg-success/20' : 'bg-destructive/20'}`}>
                    <p className={`text-[8px] uppercase tracking-wide ${monthlyData.difference >= 0 ? 'text-success/80' : 'text-destructive/80'}`}>Monthly Diff</p>
                    <p className={`text-sm font-bold ${monthlyData.difference >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {monthlyData.difference >= 0 ? '+' : ''}{monthlyData.difference}h
                    </p>
                  </div>
                </div>
              </div>

              {/* Spent Hours Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-xs font-semibold text-foreground">Spent Hours Tracker</h3>
                  </div>
                  {getStatusBadge()}
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{attendanceData.productiveHours}h / {TARGET_HOURS}h</span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full transition-all ${getProgressColor()}`}
                      style={{ width: `${spentPercentage}%` }}
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {remainingHours > 0 && (
                      <div className="inline-block px-2 py-1 bg-destructive/5 rounded border border-destructive/10">
                        <p className="text-[8px] text-muted-foreground">Remaining</p>
                        <p className="text-xs font-bold text-destructive">{remainingHours.toFixed(2)}h</p>
                      </div>
                    )}
                    {extraHours > 0 && (
                      <div className="inline-block px-2 py-1 bg-blue-500/5 rounded border border-blue-500/10">
                        <p className="text-[8px] text-muted-foreground">Extra</p>
                        <p className="text-xs font-bold text-blue-600">+{extraHours.toFixed(2)}h</p>
                      </div>
                    )}
                    {remainingHours === 0 && extraHours === 0 && (
                      <div className="inline-block px-2 py-1 bg-success/5 rounded border border-success/10">
                        <p className="text-[8px] text-muted-foreground">Target Met</p>
                        <p className="text-xs font-bold text-success">✓ Complete</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Bottom Row: Check-In / Check-Out - Inline */}
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <LogIn className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[10px] text-muted-foreground">First Check-In</h4>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[8px] px-1 py-0">On Time</Badge>
                  </div>
                  <p className="text-sm font-bold text-foreground">{attendanceData.inTime}</p>
                  <p className="text-[8px] text-muted-foreground">Biometric ID: EMP001 verified</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <LogOut className="h-3.5 w-3.5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[10px] text-muted-foreground">Final Check-Out</h4>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[8px] px-1 py-0">Completed</Badge>
                  </div>
                  <p className="text-sm font-bold text-foreground">{attendanceData.outTime}</p>
                  <p className="text-[8px] text-muted-foreground">Biometric ID: EMP001 verified</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Break Sessions - Compact */}
        <Card>
          <CardHeader className="py-2 px-4">
            <CardTitle className="flex items-center gap-1.5 text-xs">
              <Coffee className="h-3.5 w-3.5 text-accent" />
              Break Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-xs py-1.5">Break #</TableHead>
                  <TableHead className="text-xs py-1.5">
                    <div className="flex items-center gap-1">
                      <Pause className="h-2.5 w-2.5" />
                      Break-In
                    </div>
                  </TableHead>
                  <TableHead className="text-xs py-1.5">
                    <div className="flex items-center gap-1">
                      <Play className="h-2.5 w-2.5" />
                      Break-Out
                    </div>
                  </TableHead>
                  <TableHead className="text-xs py-1.5">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breakSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium py-1.5 text-xs">{session.id}</TableCell>
                    <TableCell className="py-1.5 text-xs">{session.breakIn}</TableCell>
                    <TableCell className="py-1.5 text-xs">{session.breakOut}</TableCell>
                    <TableCell className="py-1.5 text-xs">{session.duration}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-semibold text-xs py-1.5">Total Break Duration</TableCell>
                  <TableCell className="font-bold text-accent py-1.5 text-xs">{totalBreakDuration}h</TableCell>
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
