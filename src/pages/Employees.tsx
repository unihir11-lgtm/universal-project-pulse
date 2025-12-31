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
import { Search, UserPlus, Filter, MoreVertical, Pencil, Clock, User, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { toast } from "sonner";

interface Employee {
  id: number;
  name: string;
  designation: string;
  department: string;
  biometricId: string;
  status: string;
  joinedDate: string;
  editedBy?: string;
  editedAt?: string;
  editedVia?: string;
}

const employees: Employee[] = [
  {
    id: 1,
    name: "John Doe",
    designation: "Senior Developer",
    department: "Engineering",
    biometricId: "EMP001",
    status: "Active",
    joinedDate: "2023-01-15",
    editedBy: "Admin User",
    editedAt: "Dec 28, 10:30 AM",
    editedVia: "Web Portal",
  },
  {
    id: 2,
    name: "Sarah Smith",
    designation: "Project Manager",
    department: "Management",
    biometricId: "EMP002",
    status: "Active",
    joinedDate: "2022-08-20",
    editedBy: "HR Manager",
    editedAt: "Dec 27, 03:15 PM",
    editedVia: "Mobile App",
  },
  {
    id: 3,
    name: "Mike Johnson",
    designation: "UI/UX Designer",
    department: "Design",
    biometricId: "EMP003",
    status: "Active",
    joinedDate: "2023-03-10",
    editedBy: "System Auto",
    editedAt: "Dec 26, 09:00 AM",
    editedVia: "Biometric Sync",
  },
  {
    id: 4,
    name: "Emily Brown",
    designation: "QA Engineer",
    department: "Quality Assurance",
    biometricId: "EMP004",
    status: "Active",
    joinedDate: "2022-11-05",
    editedBy: "Team Lead",
    editedAt: "Dec 25, 11:45 AM",
    editedVia: "Web Portal",
  },
  {
    id: 5,
    name: "David Lee",
    designation: "DevOps Engineer",
    department: "Engineering",
    biometricId: "EMP005",
    status: "On Leave",
    joinedDate: "2023-02-28",
    editedBy: "Admin User",
    editedAt: "Dec 24, 02:00 PM",
    editedVia: "Manual Entry",
  },
];

const Employees = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    reportingManager: "",
    role: "",
    biometricId: "",
    dateOfJoining: "",
    address: "",
    emergencyContact: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.email || !formData.designation) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Employee added successfully");
    setDialogOpen(false);
    // Reset form
    setProfileImage(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      designation: "",
      department: "",
      reportingManager: "",
      role: "",
      biometricId: "",
      dateOfJoining: "",
      address: "",
      emergencyContact: "",
    });
  };
  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Employee Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your team members and their details
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <UserPlus className="h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Fill in the employee details below
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Details</h3>
                  
                  {/* Profile Image Upload */}
                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-20 w-20 border-2 border-dashed border-muted-foreground/50">
                          <AvatarImage src={profileImage || ""} alt="Profile preview" />
                          <AvatarFallback className="bg-muted">
                            <User className="h-8 w-8 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        {profileImage && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={removeImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex-1">
                        <Label
                          htmlFor="profileImage"
                          className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-muted-foreground/50 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">Upload Photo</span>
                        </Label>
                        <Input
                          id="profileImage"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG or GIF. Max 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Contact Details</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="john.doe@company.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Street address, City, State, ZIP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      placeholder="Name and phone number"
                    />
                  </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Employment Details</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation *</Label>
                      <Select
                        value={formData.designation}
                        onValueChange={(value) => handleInputChange("designation", value)}
                      >
                        <SelectTrigger id="designation">
                          <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="senior-developer">Senior Developer</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="junior-developer">Junior Developer</SelectItem>
                          <SelectItem value="project-manager">Project Manager</SelectItem>
                          <SelectItem value="qa-engineer">QA Engineer</SelectItem>
                          <SelectItem value="ui-designer">UI/UX Designer</SelectItem>
                          <SelectItem value="devops">DevOps Engineer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleInputChange("department", value)}
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="qa">Quality Assurance</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="reportingManager">Reporting Manager</Label>
                      <Select
                        value={formData.reportingManager}
                        onValueChange={(value) => handleInputChange("reportingManager", value)}
                      >
                        <SelectTrigger id="reportingManager">
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sarah-smith">Sarah Smith</SelectItem>
                          <SelectItem value="john-doe">John Doe</SelectItem>
                          <SelectItem value="emily-brown">Emily Brown</SelectItem>
                          <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfJoining">Date of Joining *</Label>
                      <Input
                        id="dateOfJoining"
                        type="date"
                        value={formData.dateOfJoining}
                        onChange={(e) => handleInputChange("dateOfJoining", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Role & Access */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Role & Access</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role Assignment *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleInputChange("role", value)}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="biometricId">Biometric ID *</Label>
                      <Input
                        id="biometricId"
                        value={formData.biometricId}
                        onChange={(e) => handleInputChange("biometricId", e.target.value)}
                        placeholder="EMP001"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Unique identifier for biometric attendance
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Employee
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-2 md:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base md:text-lg">All Employees</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search employees..." className="pl-9 w-full sm:w-64 h-9" />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs md:text-sm">Name</TableHead>
                      <TableHead className="text-xs md:text-sm hidden sm:table-cell">Designation</TableHead>
                      <TableHead className="text-xs md:text-sm hidden md:table-cell">Department</TableHead>
                      <TableHead className="text-xs md:text-sm hidden lg:table-cell">Biometric ID</TableHead>
                      <TableHead className="text-xs md:text-sm">Status</TableHead>
                      <TableHead className="text-xs md:text-sm hidden md:table-cell">Joined Date</TableHead>
                      <TableHead className="text-xs md:text-sm text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow 
                        key={employee.id} 
                        className={`cursor-pointer hover:bg-muted/50 ${employee.editedBy ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                        onClick={() => toast.info(`Viewing ${employee.name}'s profile`)}
                      >
                        <TableCell className="font-medium text-xs md:text-sm py-2 md:py-4">
                          <div className="flex flex-col">
                            <span>{employee.name}</span>
                            <span className="block text-xs text-muted-foreground sm:hidden">{employee.designation}</span>
                            {employee.editedBy && (
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
                                        <span>{employee.editedBy}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />
                                        <span>{employee.editedAt}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-muted-foreground">Via: {employee.editedVia}</span>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm hidden sm:table-cell">{employee.designation}</TableCell>
                        <TableCell className="text-xs md:text-sm hidden md:table-cell">{employee.department}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="text-xs">{employee.biometricId}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={employee.status === "Active" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs md:text-sm hidden md:table-cell">{employee.joinedDate}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuItem onClick={() => toast.info(`Viewing ${employee.name}'s details`)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info(`Editing ${employee.name}`)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => toast.warning(`Deactivating ${employee.name}`)}
                              >
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Employees;
