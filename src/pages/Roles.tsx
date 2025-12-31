import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const roles = [
  { id: 1, name: "Admin", users: 3, description: "Full system access" },
  { id: 2, name: "Manager", users: 8, description: "Project and team management" },
  { id: 3, name: "Employee", users: 145, description: "Standard user access" },
  { id: 4, name: "HR", users: 4, description: "Human resources management" },
];

const modules = [
  {
    name: "Dashboard",
    permissions: ["View", "Add", "Edit", "Delete"],
  },
  {
    name: "Projects",
    permissions: ["View", "Add", "Edit", "Delete"],
  },
  {
    name: "Employees",
    permissions: ["View", "Add", "Edit", "Delete"],
  },
  {
    name: "Reports",
    permissions: ["View", "Add", "Edit", "Delete"],
  },
  {
    name: "Attendance",
    permissions: ["View", "Add", "Edit", "Delete"],
  },
  {
    name: "Settings",
    permissions: ["View", "Add", "Edit", "Delete"],
  },
];

const Roles = () => {
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePermissionToggle = (module: string, permission: string) => {
    setSelectedPermissions((prev) => {
      const modulePerms = prev[module] || [];
      const isSelected = modulePerms.includes(permission);
      
      return {
        ...prev,
        [module]: isSelected
          ? modulePerms.filter((p) => p !== permission)
          : [...modulePerms, permission],
      };
    });
  };

  const handleSaveRole = () => {
    toast.success("Role permissions saved successfully");
    setDialogOpen(false);
    setSelectedPermissions({});
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Roles & Permissions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage user roles and access control
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Define permissions for this role
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input id="role-name" placeholder="e.g., Project Manager" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role-description">Description</Label>
                  <Input id="role-description" placeholder="Brief description of the role" />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Module Permissions</Label>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Module</TableHead>
                          <TableHead>View</TableHead>
                          <TableHead>Add</TableHead>
                          <TableHead>Edit</TableHead>
                          <TableHead>Delete</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modules.map((module) => (
                          <TableRow key={module.name}>
                            <TableCell className="font-medium">{module.name}</TableCell>
                            {module.permissions.map((permission) => (
                              <TableCell key={permission}>
                                <Checkbox
                                  checked={selectedPermissions[module.name]?.includes(permission)}
                                  onCheckedChange={() =>
                                    handlePermissionToggle(module.name, permission)
                                  }
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRole}>
                    Create Role
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Roles List */}
        <Card>
          <CardHeader className="py-3 md:py-6">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Shield className="h-4 w-4 md:h-5 md:w-5" />
              Existing Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Users Assigned</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-muted-foreground">{role.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.users} users</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="h-3 w-3" />
                            Edit Permissions
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Role: {role.name}</DialogTitle>
                            <DialogDescription>
                              Modify permissions for this role
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[200px]">Module</TableHead>
                                    <TableHead>View</TableHead>
                                    <TableHead>Add</TableHead>
                                    <TableHead>Edit</TableHead>
                                    <TableHead>Delete</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {modules.map((module) => (
                                    <TableRow key={module.name}>
                                      <TableCell className="font-medium">{module.name}</TableCell>
                                      {module.permissions.map((permission) => (
                                        <TableCell key={permission}>
                                          <Checkbox
                                            defaultChecked={role.name === "Admin"}
                                          />
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline">Cancel</Button>
                              <Button onClick={() => toast.success("Permissions updated")}>
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        {/* Permission Matrix Overview */}
        <Card>
          <CardHeader className="py-3 md:py-6">
            <CardTitle className="text-sm md:text-base">Quick Permission Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-semibold text-foreground">Admin</h4>
                  <p className="text-sm text-muted-foreground">
                    Full access to all modules and features
                  </p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {modules.map((module) => (
                      <Badge key={module.name} variant="default">
                        {module.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-semibold text-foreground">Manager</h4>
                  <p className="text-sm text-muted-foreground">
                    Project and employee management access
                  </p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    <Badge variant="default">Dashboard</Badge>
                    <Badge variant="default">Projects</Badge>
                    <Badge variant="default">Employees</Badge>
                    <Badge variant="default">Reports</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-semibold text-foreground">Employee</h4>
                  <p className="text-sm text-muted-foreground">
                    Limited access to personal features
                  </p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    <Badge variant="secondary">Dashboard</Badge>
                    <Badge variant="secondary">Projects</Badge>
                    <Badge variant="secondary">Attendance</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-semibold text-foreground">HR</h4>
                  <p className="text-sm text-muted-foreground">
                    Employee and attendance management
                  </p>
                  <div className="flex flex-wrap gap-1 pt-2">
                    <Badge variant="outline">Dashboard</Badge>
                    <Badge variant="outline">Employees</Badge>
                    <Badge variant="outline">Attendance</Badge>
                    <Badge variant="outline">Reports</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Roles;
