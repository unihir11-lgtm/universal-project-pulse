import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCheck, Download, Filter, Search } from "lucide-react";
import { toast } from "sonner";

interface CheckinEntry {
  id: number;
  empId: string;
  name: string;
  department: string;
  checkIn: string;
  checkOut: string;
  device: string;
  location: string;
}

const EmployeeCheckin = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const checkinData: CheckinEntry[] = [
    { id: 1, empId: "EMP001", name: "Rahul Sharma", department: "Engineering", checkIn: "09:05 AM", checkOut: "06:10 PM", device: "Biometric", location: "Main Office" },
    { id: 2, empId: "EMP002", name: "Priya Patel", department: "Design", checkIn: "09:15 AM", checkOut: "06:00 PM", device: "Mobile App", location: "Remote" },
    { id: 3, empId: "EMP003", name: "Amit Kumar", department: "Engineering", checkIn: "08:50 AM", checkOut: "05:45 PM", device: "Biometric", location: "Main Office" },
    { id: 4, empId: "EMP004", name: "Sneha Gupta", department: "HR", checkIn: "09:00 AM", checkOut: "06:30 PM", device: "Biometric", location: "Main Office" },
    { id: 5, empId: "EMP005", name: "Vikram Singh", department: "Engineering", checkIn: "09:30 AM", checkOut: "06:15 PM", device: "Mobile App", location: "Remote" },
    { id: 6, empId: "EMP006", name: "Neha Sharma", department: "Marketing", checkIn: "09:10 AM", checkOut: "05:50 PM", device: "Biometric", location: "Main Office" },
    { id: 7, empId: "EMP007", name: "Rajesh Verma", department: "Finance", checkIn: "08:45 AM", checkOut: "06:00 PM", device: "Biometric", location: "Main Office" },
    { id: 8, empId: "EMP008", name: "Anjali Mishra", department: "Engineering", checkIn: "09:20 AM", checkOut: "06:20 PM", device: "Mobile App", location: "Remote" },
    { id: 9, empId: "EMP009", name: "Karan Joshi", department: "Design", checkIn: "09:00 AM", checkOut: "05:30 PM", device: "Biometric", location: "Main Office" },
    { id: 10, empId: "EMP010", name: "Pooja Reddy", department: "Engineering", checkIn: "08:55 AM", checkOut: "06:05 PM", device: "Biometric", location: "Main Office" },
  ];

  const departments = ["all", ...new Set(checkinData.map(item => item.department))];
  const locations = ["all", ...new Set(checkinData.map(item => item.location))];

  const filteredData = checkinData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || item.department === departmentFilter;
    const matchesLocation = locationFilter === "all" || item.location === locationFilter;
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredData.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const isAllSelected = filteredData.length > 0 && selectedIds.length === filteredData.length;

  const exportToCSV = () => {
    const dataToExport = selectedIds.length > 0 
      ? filteredData.filter(item => selectedIds.includes(item.id))
      : filteredData;

    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Emp ID", "Name", "Department", "Check-In", "Check-Out", "Device", "Location"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(item => 
        [item.empId, item.name, item.department, item.checkIn, item.checkOut, item.device, item.location].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `employee-checkin-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${dataToExport.length} records successfully`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employee Check-in</h1>
            <p className="text-sm text-muted-foreground">
              View and manage employee check-in records
            </p>
          </div>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export {selectedIds.length > 0 ? `(${selectedIds.length})` : "All"}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px] h-8 text-sm"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[160px] h-8 text-sm bg-background">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[140px] h-8 text-sm bg-background">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc === "all" ? "All Locations" : loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <UserCheck className="h-4 w-4 text-primary" />
                Check-in Records
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {filteredData.length} Records
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs">Emp ID</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Department</TableHead>
                  <TableHead className="text-xs">Check-In</TableHead>
                  <TableHead className="text-xs">Check-Out</TableHead>
                  <TableHead className="text-xs">Device</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="py-2">
                      <Checkbox 
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectOne(item.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="py-2 text-xs text-primary font-medium">{item.empId}</TableCell>
                    <TableCell className="py-2 text-xs font-medium">{item.name}</TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">{item.department}</TableCell>
                    <TableCell className="py-2 text-xs text-primary">{item.checkIn}</TableCell>
                    <TableCell className="py-2 text-xs text-teal-600 dark:text-teal-400">{item.checkOut}</TableCell>
                    <TableCell className="py-2">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${
                          item.device === 'Biometric' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {item.device}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${
                          item.location === 'Main Office' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {item.location}
                      </Badge>
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

export default EmployeeCheckin;