import { useState } from "react";
import { Trash2, KeyRound } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface PermissionRule {
  id: string;
  documentType: string;
  role: string;
  level: number;
  onlyIfCreator: boolean;
  permissions: {
    select: boolean;
    read: boolean;
    write: boolean;
    create: boolean;
    delete: boolean;
    print: boolean;
    email: boolean;
    report: boolean;
    import: boolean;
    export: boolean;
    share: boolean;
  };
}

const documentTypes = [
  "Project",
  "Task",
  "Employee",
  "Time Entry",
  "Report",
];

const designations = [
  "Super Admin",
  "HR",
  "Project Manager",
  "Accountant",
  "Business Analyst",
  "Team Lead",
  "Developer",
  "QA Engineer",
  "Designer",
  "Support Executive",
];

const initialRules: PermissionRule[] = [
  {
    id: "1",
    documentType: "Project",
    role: "Employee",
    level: 0,
    onlyIfCreator: false,
    permissions: {
      select: false,
      read: true,
      write: false,
      create: false,
      delete: false,
      print: false,
      email: false,
      report: false,
      import: false,
      export: false,
      share: false,
    },
  },
  {
    id: "2",
    documentType: "Task",
    role: "Employee",
    level: 0,
    onlyIfCreator: false,
    permissions: {
      select: false,
      read: true,
      write: true,
      create: true,
      delete: true,
      print: true,
      email: true,
      report: true,
      import: false,
      export: true,
      share: true,
    },
  },
  {
    id: "3",
    documentType: "Employee",
    role: "Employee",
    level: 0,
    onlyIfCreator: false,
    permissions: {
      select: false,
      read: true,
      write: false,
      create: false,
      delete: false,
      print: false,
      email: false,
      report: false,
      import: false,
      export: false,
      share: false,
    },
  },
];

const RolePermissions = () => {
  const [rules, setRules] = useState<PermissionRule[]>(initialRules);
  const [filterDocType, setFilterDocType] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    documentType: "",
    role: "Employee",
    level: "0",
  });

  const handlePermissionChange = (
    ruleId: string,
    permission: keyof PermissionRule["permissions"]
  ) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              permissions: {
                ...rule.permissions,
                [permission]: !rule.permissions[permission],
              },
            }
          : rule
      )
    );
    toast({
      title: "Permission updated",
      description: "The permission has been updated successfully.",
    });
  };

  const handleOnlyIfCreatorChange = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? { ...rule, onlyIfCreator: !rule.onlyIfCreator }
          : rule
      )
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    toast({
      title: "Rule deleted",
      description: "The permission rule has been deleted.",
    });
  };

  const handleAddRule = () => {
    if (!newRule.documentType || !newRule.role || !newRule.level) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const rule: PermissionRule = {
      id: Date.now().toString(),
      documentType: newRule.documentType,
      role: newRule.role,
      level: parseInt(newRule.level),
      onlyIfCreator: false,
      permissions: {
        select: false,
        read: true,
        write: false,
        create: false,
        delete: false,
        print: false,
        email: false,
        report: false,
        import: false,
        export: false,
        share: false,
      },
    };

    setRules((prev) => [...prev, rule]);
    setNewRule({ documentType: "", role: "Employee", level: "0" });
    setIsDialogOpen(false);
    toast({
      title: "Rule added",
      description: "New permission rule has been added successfully.",
    });
  };

  const filteredRules = rules.filter((rule) => {
    const matchesDocType = filterDocType === "all" || rule.documentType === filterDocType;
    const matchesRole = filterRole === "all" || rule.role === filterRole;
    return matchesDocType && matchesRole;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            Role Permissions Manager
          </h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <KeyRound className="h-4 w-4 mr-2" />
              Set User Permissions
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>+ Add A New Rule</Button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
          <Select value={filterDocType} onValueChange={setFilterDocType}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">Document Type</SelectItem>
              {documentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Roles" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">Roles</SelectItem>
              {designations.map((designation) => (
                <SelectItem key={designation} value={designation}>
                  {designation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Permissions Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Document Type</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold text-center">Level</TableHead>
                <TableHead className="font-semibold" colSpan={4}>
                  Permissions
                </TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map((rule) => (
                <TableRow key={rule.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-primary">
                    {rule.documentType}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <span className="text-primary font-medium">
                        {rule.role}
                      </span>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`creator-${rule.id}`}
                          checked={rule.onlyIfCreator}
                          onCheckedChange={() =>
                            handleOnlyIfCreatorChange(rule.id)
                          }
                        />
                        <label
                          htmlFor={`creator-${rule.id}`}
                          className="text-sm text-muted-foreground"
                        >
                          Only If Creator
                        </label>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {rule.level}
                  </TableCell>
                  <TableCell colSpan={4}>
                    <div className="grid grid-cols-4 gap-x-8 gap-y-2">
                      {(
                        Object.entries(rule.permissions) as [
                          keyof PermissionRule["permissions"],
                          boolean
                        ][]
                      ).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            id={`${rule.id}-${key}`}
                            checked={value}
                            onCheckedChange={() =>
                              handlePermissionChange(rule.id, key)
                            }
                          />
                          <label
                            htmlFor={`${rule.id}-${key}`}
                            className="text-sm capitalize cursor-pointer"
                          >
                            {key}
                          </label>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRules.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No permission rules found. Add a new rule to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add New Rule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Permission Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Document Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={newRule.documentType}
                onValueChange={(value) =>
                  setNewRule((prev) => ({ ...prev, documentType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={newRule.role}
                onValueChange={(value) =>
                  setNewRule((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((designation) => (
                    <SelectItem key={designation} value={designation}>
                      {designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Permission Level <span className="text-destructive">*</span>
              </Label>
              <Select
                value={newRule.level}
                onValueChange={(value) =>
                  setNewRule((prev) => ({ ...prev, level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Level 0 is for document level permissions, higher levels for field level permissions.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddRule}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RolePermissions;
