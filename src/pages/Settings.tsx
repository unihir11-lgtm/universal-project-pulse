import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
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
import { formatDate } from "@/lib/utils";

const employees = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Sarah Smith" },
  { id: 3, name: "Mike Johnson" },
  { id: 4, name: "Emily Brown" },
  { id: 5, name: "David Lee" },
];

interface SignupLinkData {
  id: string;
  employeeName: string;
  link: string;
  createdAt: string;
}

const initialSignupLinks: SignupLinkData[] = [
  {
    id: "abc123",
    employeeName: "John Doe",
    link: "https://universal-software.app/signup/abc123",
    createdAt: "10-12-2025",
  },
  {
    id: "def456",
    employeeName: "Sarah Smith",
    link: "https://universal-software.app/signup/def456",
    createdAt: "12-12-2025",
  },
];

const Settings = () => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [signupLinks, setSignupLinks] = useState<SignupLinkData[]>(initialSignupLinks);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Signup link copied to clipboard");
  };

  const handleGenerateLink = () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee first");
      return;
    }

    const employee = employees.find((e) => e.id.toString() === selectedEmployee);
    if (!employee) return;

    const newLink: SignupLinkData = {
      id: Math.random().toString(36).substr(2, 9),
      employeeName: employee.name,
      link: `https://universal-software.app/signup/${Math.random().toString(36).substr(2, 9)}`,
      createdAt: formatDate(new Date().toISOString().split('T')[0]),
    };

    setSignupLinks((prev) => [...prev, newLink]);
    setSelectedEmployee("");
    toast.success("Signup link generated successfully");
  };

  const handleDeleteLink = (id: string) => {
    setSignupLinks((prev) => prev.filter((link) => link.id !== id));
    toast.success("Signup link deleted");
  };

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage system configuration and preferences
          </p>
        </div>

        {/* Generate Signup Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Generate Signup Link
            </CardTitle>
            <CardDescription>
              Create a unique signup link for new employees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <Label htmlFor="employee-select">Select Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger id="employee-select">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateLink}>Generate Link</Button>
            </div>

            {/* Signup Links Table */}
            {signupLinks.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Signup Link</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signupLinks.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.employeeName}</TableCell>
                        <TableCell className="font-mono text-sm max-w-xs truncate">
                          {item.link}
                        </TableCell>
                        <TableCell>{item.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleCopyLink(item.link)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteLink(item.id)}
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
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
