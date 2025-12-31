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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Calendar, UserCheck, Search, Pencil, X, Check, Clock, User, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AttendanceRecord {
  id: number;
  name: string;
  employeeId: string;
  date: string;
  inTime: string;
  breakIn: string;
  breakOut: string;
  outTime: string;
  totalHours: string;
  status: string;
  editedBy?: string;
  editedAt?: string;
  editedVia?: string;
}

const Attendance = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<AttendanceRecord | null>(null);
  const [isAddManualOpen, setIsAddManualOpen] = useState(false);
  const [manualEmployee, setManualEmployee] = useState("");
  const [manualDate, setManualDate] = useState<Date | undefined>(new Date());

  const employeeList = [
    { id: "EMP001", name: "John Doe" },
    { id: "EMP002", name: "Sarah Smith" },
    { id: "EMP003", name: "Mike Johnson" },
    { id: "EMP004", name: "Emily Brown" },
    { id: "EMP005", name: "David Lee" },
    { id: "EMP006", name: "Lisa Wang" },
  ];

  const handleAddManual = () => {
    if (!manualEmployee || !manualDate) {
      toast.error("Please select employee and date");
      return;
    }
    const selectedEmp = employeeList.find(emp => emp.id === manualEmployee);
    toast.success(`Manual attendance added for ${selectedEmp?.name} on ${format(manualDate, "PPP")}`);
    setIsAddManualOpen(false);
    setManualEmployee("");
    setManualDate(new Date());
  };

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([
    {
      id: 1,
      name: "John Doe",
      employeeId: "EMP001",
      date: "2024-12-31",
      inTime: "09:05 AM",
      breakIn: "12:30 PM",
      breakOut: "01:15 PM",
      outTime: "06:10 PM",
      totalHours: "8.3",
      status: "Present",
      editedBy: "Admin User",
      editedAt: "Dec 28, 10:30 AM",
      editedVia: "Web Portal",
    },
    {
      id: 2,
      name: "Sarah Smith",
      employeeId: "EMP002",
      date: "2024-12-31",
      inTime: "08:55 AM",
      breakIn: "12:00 PM",
      breakOut: "01:00 PM",
      outTime: "06:05 PM",
      totalHours: "8.2",
      status: "Present",
      editedBy: "HR Manager",
      editedAt: "Dec 27, 03:15 PM",
      editedVia: "Mobile App",
    },
    {
      id: 3,
      name: "Mike Johnson",
      employeeId: "EMP003",
      date: "2024-12-30",
      inTime: "09:15 AM",
      breakIn: "01:00 PM",
      breakOut: "01:45 PM",
      outTime: "06:20 PM",
      totalHours: "8.3",
      status: "Present",
      editedBy: "System Auto",
      editedAt: "Dec 26, 09:00 AM",
      editedVia: "Biometric Sync",
    },
    {
      id: 4,
      name: "Emily Brown",
      employeeId: "EMP004",
      date: "2024-12-30",
      inTime: "09:00 AM",
      breakIn: "12:45 PM",
      breakOut: "01:30 PM",
      outTime: "06:00 PM",
      totalHours: "8.3",
      status: "Present",
      editedBy: "Team Lead",
      editedAt: "Dec 25, 11:45 AM",
      editedVia: "Web Portal",
    },
    {
      id: 5,
      name: "David Lee",
      employeeId: "EMP005",
      date: "2024-12-29",
      inTime: "-",
      breakIn: "-",
      breakOut: "-",
      outTime: "-",
      totalHours: "0",
      status: "Absent",
      editedBy: "Admin User",
      editedAt: "Dec 24, 02:00 PM",
      editedVia: "Manual Entry",
    },
    {
      id: 6,
      name: "Lisa Wang",
      employeeId: "EMP006",
      date: "2024-12-31",
      inTime: "09:10 AM",
      breakIn: "12:15 PM",
      breakOut: "01:00 PM",
      outTime: "In Progress",
      totalHours: "4.5",
      status: "In Progress",
    },
  ]);

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

  const handleEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditData({ ...record });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleSaveEdit = () => {
    if (!editData) return;
    
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const updatedRecord = {
      ...editData,
      editedBy: "Admin User",
      editedAt: formattedDate,
      editedVia: "Web Portal"
    };
    
    setAttendanceData(prev => 
      prev.map(record => 
        record.id === editData.id ? updatedRecord : record
      )
    );
    setEditingId(null);
    setEditData(null);
    toast.success("Attendance record updated successfully");
  };

  const handleEditChange = (field: keyof AttendanceRecord, value: string) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Attendance Report</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddManualOpen(true)} size="sm" className="gap-1.5 h-8 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Manual
            </Button>
            <Button onClick={handleExport} size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Add Manual Dialog */}
        <Dialog open={isAddManualOpen} onOpenChange={setIsAddManualOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Manual Attendance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select value={manualEmployee} onValueChange={setManualEmployee}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {employeeList.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !manualDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {manualDate ? format(manualDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={manualDate}
                      onSelect={setManualDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddManualOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddManual}>
                Add Attendance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                  <TableHead className="text-sm py-2">Date</TableHead>
                  <TableHead className="text-sm py-2">In</TableHead>
                  <TableHead className="text-sm py-2">Break In</TableHead>
                  <TableHead className="text-sm py-2">Break Out</TableHead>
                  <TableHead className="text-sm py-2">Out</TableHead>
                  <TableHead className="text-sm py-2">Hours</TableHead>
                  <TableHead className="text-sm py-2">Status</TableHead>
                  <TableHead className="text-sm py-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record.id} className={record.editedBy ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}>
                    <TableCell className="py-2">
                      <Checkbox
                        checked={selectedEmployees.includes(record.id)}
                        onCheckedChange={(checked) => handleSelectEmployee(record.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="text-sm py-2 font-medium">{record.employeeId}</TableCell>
                    <TableCell className="text-sm py-2">
                      <div className="flex flex-col">
                        <span>{record.name}</span>
                        {record.editedBy && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                  <Pencil className="h-2.5 w-2.5" />
                                  <span>Edited</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-background border">
                                <div className="text-xs space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <User className="h-3 w-3" />
                                    <span>{record.editedBy}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    <span>{record.editedAt}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground">Via: {record.editedVia}</span>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm py-2">{format(new Date(record.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-sm py-2">
                      {editingId === record.id ? (
                        <Input
                          value={editData?.inTime || ""}
                          onChange={(e) => handleEditChange("inTime", e.target.value)}
                          className="h-7 w-24 text-xs"
                        />
                      ) : (
                        record.inTime
                      )}
                    </TableCell>
                    <TableCell className="text-sm py-2">
                      {editingId === record.id ? (
                        <Input
                          value={editData?.breakIn || ""}
                          onChange={(e) => handleEditChange("breakIn", e.target.value)}
                          className="h-7 w-24 text-xs"
                        />
                      ) : (
                        record.breakIn
                      )}
                    </TableCell>
                    <TableCell className="text-sm py-2">
                      {editingId === record.id ? (
                        <Input
                          value={editData?.breakOut || ""}
                          onChange={(e) => handleEditChange("breakOut", e.target.value)}
                          className="h-7 w-24 text-xs"
                        />
                      ) : (
                        record.breakOut
                      )}
                    </TableCell>
                    <TableCell className="text-sm py-2">
                      {editingId === record.id ? (
                        <Input
                          value={editData?.outTime || ""}
                          onChange={(e) => handleEditChange("outTime", e.target.value)}
                          className="h-7 w-24 text-xs"
                        />
                      ) : (
                        record.outTime
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {editingId === record.id ? (
                        <Input
                          value={editData?.totalHours || ""}
                          onChange={(e) => handleEditChange("totalHours", e.target.value)}
                          className="h-7 w-16 text-xs"
                        />
                      ) : (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">{record.totalHours}h</Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {editingId === record.id ? (
                        <Select
                          value={editData?.status || ""}
                          onValueChange={(value) => handleEditChange("status", value)}
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getStatusBadge(record.status)
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {editingId === record.id ? (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveEdit}>
                            <Check className="h-3.5 w-3.5 text-success" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(record)}>
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </TableCell>
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
