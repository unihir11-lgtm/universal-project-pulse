import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Calendar, UserCheck, Search } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const Attendance = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const attendanceData = [
    {
      id: 1,
      name: "John Doe",
      employeeId: "EMP001",
      inTime: "09:05 AM",
      breakIn: "12:30 PM",
      breakOut: "01:15 PM",
      outTime: "06:10 PM",
      totalHours: "8.3",
      status: "Present",
    },
    {
      id: 2,
      name: "Sarah Smith",
      employeeId: "EMP002",
      inTime: "08:55 AM",
      breakIn: "12:00 PM",
      breakOut: "01:00 PM",
      outTime: "06:05 PM",
      totalHours: "8.2",
      status: "Present",
    },
    {
      id: 3,
      name: "Mike Johnson",
      employeeId: "EMP003",
      inTime: "09:15 AM",
      breakIn: "01:00 PM",
      breakOut: "01:45 PM",
      outTime: "06:20 PM",
      totalHours: "8.3",
      status: "Present",
    },
    {
      id: 4,
      name: "Emily Brown",
      employeeId: "EMP004",
      inTime: "09:00 AM",
      breakIn: "12:45 PM",
      breakOut: "01:30 PM",
      outTime: "06:00 PM",
      totalHours: "8.3",
      status: "Present",
    },
    {
      id: 5,
      name: "David Lee",
      employeeId: "EMP005",
      inTime: "-",
      breakIn: "-",
      breakOut: "-",
      outTime: "-",
      totalHours: "0",
      status: "Absent",
    },
    {
      id: 6,
      name: "Lisa Wang",
      employeeId: "EMP006",
      inTime: "09:10 AM",
      breakIn: "12:15 PM",
      breakOut: "01:00 PM",
      outTime: "In Progress",
      totalHours: "4.5",
      status: "In Progress",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <Badge className="bg-success text-success-foreground">Present</Badge>;
      case "Absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "In Progress":
        return <Badge className="bg-info text-info-foreground">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAttendance = attendanceData.filter((record) =>
    record.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    record.employeeId.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredAttendance.map((record) => record.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, id]);
    } else {
      setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id));
    }
  };

  const handleExport = () => {
    if (selectedEmployees.length > 0) {
      toast.success(`Exporting ${selectedEmployees.length} selected employee(s) to Excel...`);
    } else {
      toast.success("Exporting attendance report to Excel...");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Attendance Report</h1>
          <Button onClick={handleExport} size="sm" className="gap-1.5 h-8 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>

        {/* Inline Filters */}
        <Card>
          <CardContent className="py-3">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-5 items-end">
              <div className="space-y-1">
                <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end-date" className="text-xs">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1 col-span-2 md:col-span-2">
                <Label htmlFor="employee-search" className="text-xs">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="employee-search"
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Compact Summary Cards */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Employees</p>
                  <p className="text-xl font-bold text-foreground">156</p>
                </div>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-4">
              <p className="text-xs text-muted-foreground">Present</p>
              <p className="text-xl font-bold text-success">148</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-4">
              <p className="text-xs text-muted-foreground">Absent</p>
              <p className="text-xl font-bold text-destructive">8</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-4">
              <p className="text-xs text-muted-foreground">Attendance Rate</p>
              <p className="text-xl font-bold text-accent">94.9%</p>
            </CardContent>
          </Card>
        </div>

        {/* Compact Table */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Daily Attendance Report</CardTitle>
              <Button onClick={handleExport} variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                <Download className="h-3 w-3" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 py-2">
                    <Checkbox
                      checked={selectedEmployees.length === filteredAttendance.length && filteredAttendance.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-sm py-2">Emp ID</TableHead>
                  <TableHead className="text-sm py-2">Name</TableHead>
                  <TableHead className="text-sm py-2">In</TableHead>
                  <TableHead className="text-sm py-2">Break In</TableHead>
                  <TableHead className="text-sm py-2">Break Out</TableHead>
                  <TableHead className="text-sm py-2">Out</TableHead>
                  <TableHead className="text-sm py-2">Hours</TableHead>
                  <TableHead className="text-sm py-2">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="py-2">
                      <Checkbox
                        checked={selectedEmployees.includes(record.id)}
                        onCheckedChange={(checked) => handleSelectEmployee(record.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="text-sm py-2 font-medium">{record.employeeId}</TableCell>
                    <TableCell className="text-sm py-2">{record.name}</TableCell>
                    <TableCell className="text-sm py-2">{record.inTime}</TableCell>
                    <TableCell className="text-sm py-2">{record.breakIn}</TableCell>
                    <TableCell className="text-sm py-2">{record.breakOut}</TableCell>
                    <TableCell className="text-sm py-2">{record.outTime}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="outline" className="text-xs px-1.5 py-0">{record.totalHours}h</Badge>
                    </TableCell>
                    <TableCell className="py-2">{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
