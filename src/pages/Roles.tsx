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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Plus, Edit, Trash2, Briefcase } from "lucide-react";
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

const designations = [
  { id: 1, name: "Super Admin", description: "Full system administrator with all privileges", isActive: true },
  { id: 2, name: "HR", description: "Human Resources manager", isActive: true },
  { id: 3, name: "Project Manager", description: "Manages projects and team members", isActive: true },
  { id: 4, name: "Accountant", description: "Financial management and reporting", isActive: true },
  { id: 5, name: "Business Analyst", description: "Business requirements and analysis", isActive: true },
  { id: 6, name: "Team Lead", description: "Team leadership and coordination", isActive: true },
  { id: 7, name: "Developer", description: "Software development and coding", isActive: true },
  { id: 8, name: "QA Engineer", description: "Quality assurance and testing", isActive: false },
  { id: 9, name: "Designer", description: "UI/UX design and graphics", isActive: true },
  { id: 10, name: "Support Executive", description: "Customer support and assistance", isActive: false },
];

const Roles = () => {
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");
  const [designationDialogOpen, setDesignationDialogOpen] = useState(false);
  const [designationsList, setDesignationsList] = useState(designations);
  const [rolesList, setRolesList] = useState(roles);
  const [editingRole, setEditingRole] = useState<{ id: number; name: string; description: string } | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");

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

  const handleOpenRoleDialog = (role?: { id: number; name: string; description: string }) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      setRoleDescription(role.description);
    } else {
      setEditingRole(null);
      setRoleName("");
      setRoleDescription("");
    }
    setDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (editingRole) {
      setRolesList(prev =>
        prev.map(r => r.id === editingRole.id ? { ...r, name: roleName, description: roleDescription } : r)
      );
      toast.success("Role updated successfully");
    } else {
      toast.success("Role created successfully");
    }
    setDialogOpen(false);
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions({});
  };

  const handleDeleteRole = (id: number) => {
    setRolesList(prev => prev.filter(r => r.id !== id));
    toast.success("Role deleted successfully");
  };

  const handleSaveDesignation = () => {
    toast.success("Designation saved successfully");
    setDesignationDialogOpen(false);
  };

  const handleToggleDesignation = (id: number) => {
    setDesignationsList(prev =>
      prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d)
    );
    toast.success("Designation status updated");
  };

  const handleDeleteDesignation = (id: number) => {
    setDesignationsList(prev => prev.filter(d => d.id !== id));
    toast.success("Designation deleted");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Roles & Permissions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage user roles and designations
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="designation" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Designation
            </TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setEditingRole(null);
                  setRoleName("");
                  setRoleDescription("");
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto" onClick={() => handleOpenRoleDialog()}>
                    <Plus className="h-4 w-4" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
                    <DialogDescription>
                      {editingRole ? "Modify role details" : "Define permissions for this role"}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="role-name">Role Name</Label>
                      <Input 
                        id="role-name" 
                        placeholder="e.g., Project Manager" 
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role-description">Description</Label>
                      <Input 
                        id="role-description" 
                        placeholder="Brief description of the role" 
                        value={roleDescription}
                        onChange={(e) => setRoleDescription(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveRole}>
                        {editingRole ? "Save Changes" : "Create Role"}
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
                      {rolesList.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell className="text-muted-foreground">{role.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{role.users} users</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleOpenRoleDialog(role)}
                              >
                                <Edit className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* Designation Tab */}
          <TabsContent value="designation" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={designationDialogOpen} onOpenChange={setDesignationDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Add Designation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Designation</DialogTitle>
                    <DialogDescription>
                      Create a new designation
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="designation-name" className="text-destructive">
                        * Name
                      </Label>
                      <Input id="designation-name" placeholder="Enter designation name" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="designation-description">Description</Label>
                      <Textarea 
                        id="designation-description" 
                        placeholder="Enter description" 
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setDesignationDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveDesignation}>
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Designation List */}
            <Card>
              <CardHeader className="py-3 md:py-6">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <Briefcase className="h-4 w-4 md:h-5 md:w-5" />
                  Designation List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Designation Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Is Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {designationsList.map((designation) => (
                        <TableRow key={designation.id}>
                          <TableCell className="font-medium">{designation.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {designation.description || "-"}
                          </TableCell>
                          <TableCell>
                            <Switch 
                              checked={designation.isActive}
                              onCheckedChange={() => handleToggleDesignation(designation.id)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toast.info(`Edit ${designation.name}`)}
                              >
                                <Edit className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteDesignation(designation.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4 text-sm text-muted-foreground">
                  <span>1-{designationsList.length} of {designationsList.length}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Roles;
