import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Label } from "@/components/ui/label";

// Mock data for project summary
const projectSummaryData = [
  {
    id: 1,
    project: "Go Live",
    hold: 0,
    open: 2,
    analysis: 0,
    analysisCompleted: 0,
    analysisApproved: 0,
    assignToDevelopment: 1,
    unitTesting: 0,
    baReview: 0,
    assignedToQA: 9,
    qaVerified: 1,
    qcCompleted: 9,
    preproductionDeployment: 0,
    productionDeployment: 378,
    closed: 493,
  },
  {
    id: 2,
    project: "Human Resource",
    hold: 0,
    open: 20,
    analysis: 0,
    analysisCompleted: 0,
    analysisApproved: 0,
    assignToDevelopment: 0,
    unitTesting: 0,
    baReview: 0,
    assignedToQA: 0,
    qaVerified: 0,
    qcCompleted: 0,
    preproductionDeployment: 0,
    productionDeployment: 0,
    closed: 588,
  },
  {
    id: 3,
    project: "Jain Connection Marketing",
    hold: 19,
    open: 0,
    analysis: 0,
    analysisCompleted: 0,
    analysisApproved: 0,
    assignToDevelopment: 0,
    unitTesting: 0,
    baReview: 0,
    assignedToQA: 2,
    qaVerified: 0,
    qcCompleted: 0,
    preproductionDeployment: 73,
    productionDeployment: 73,
    closed: 299,
  },
  {
    id: 4,
    project: "Jain Marketplace",
    hold: 18,
    open: 0,
    analysis: 0,
    analysisCompleted: 0,
    analysisApproved: 0,
    assignToDevelopment: 0,
    unitTesting: 0,
    baReview: 0,
    assignedToQA: 0,
    qaVerified: 0,
    qcCompleted: 0,
    preproductionDeployment: 1,
    productionDeployment: 671,
    closed: 490,
  },
  {
    id: 5,
    project: "Product Support",
    hold: 2,
    open: 5,
    analysis: 0,
    analysisCompleted: 0,
    analysisApproved: 0,
    assignToDevelopment: 0,
    unitTesting: 0,
    baReview: 0,
    assignedToQA: 0,
    qaVerified: 0,
    qcCompleted: 0,
    preproductionDeployment: 0,
    productionDeployment: 0,
    closed: 2530,
  },
  {
    id: 6,
    project: "Super App",
    hold: 213,
    open: 7,
    analysis: 0,
    analysisCompleted: 0,
    analysisApproved: 0,
    assignToDevelopment: 1,
    unitTesting: 0,
    baReview: 0,
    assignedToQA: 18,
    qaVerified: 0,
    qcCompleted: 0,
    preproductionDeployment: 0,
    productionDeployment: 627,
    closed: 505,
  },
  {
    id: 7,
    project: "Universal Software",
    hold: 12,
    open: 47,
    analysis: 1,
    analysisCompleted: 0,
    analysisApproved: 0,
    assignToDevelopment: 40,
    unitTesting: 0,
    baReview: 1,
    assignedToQA: 19,
    qaVerified: 0,
    qcCompleted: 0,
    preproductionDeployment: 1,
    productionDeployment: 0,
    closed: 64,
  },
];

const ProjectSummary = () => {
  const [selectedProject, setSelectedProject] = useState<string>("all");

  const handleExport = () => {
    toast.success("Exporting project summary to Excel...");
  };

  const filteredData =
    selectedProject === "all"
      ? projectSummaryData
      : projectSummaryData.filter((p) => p.project === selectedProject);

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Project Summary</h1>
          <Button onClick={handleExport} size="sm" className="gap-1.5 h-8 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>

        {/* Inline Filter */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-end gap-3">
              <div className="space-y-1 flex-1 max-w-xs">
                <Label className="text-xs">Select Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectSummaryData.map((project) => (
                      <SelectItem key={project.id} value={project.project}>
                        {project.project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compact Project Summary Table */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">
              {selectedProject === "all"
                ? "Project Summary (Universal)"
                : `Project Summary (${selectedProject})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px] bg-primary text-primary-foreground text-xs py-2 font-semibold sticky left-0 z-10">
                      Project/Status
                    </TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[60px]">Hold</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[60px]">Open</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[70px]">Analysis</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[90px]">Anlys Comp</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[90px]">Anlys Appr</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[80px]">Assign Dev</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[80px]">Unit Test</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[80px]">BA Review</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[80px]">Assign QA</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[80px]">QA Verified</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[80px]">QC Comp</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[80px]">Pre-Prod</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[80px]">Prod</TableHead>
                    <TableHead className="text-center text-xs py-2 min-w-[60px]">Closed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="text-xs py-2 font-semibold bg-primary/5 sticky left-0 z-10">
                        {project.project}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.hold > 0 && <span className="font-medium">{project.hold}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.open > 0 && <span className="font-medium">{project.open}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.analysis > 0 && <span className="font-medium">{project.analysis}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.analysisCompleted > 0 && <span className="font-medium">{project.analysisCompleted}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.analysisApproved > 0 && <span className="font-medium">{project.analysisApproved}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.assignToDevelopment > 0 && <span className="font-medium">{project.assignToDevelopment}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.unitTesting > 0 && <span className="font-medium">{project.unitTesting}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.baReview > 0 && <span className="font-medium">{project.baReview}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.assignedToQA > 0 && <span className="font-medium">{project.assignedToQA}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.qaVerified > 0 && <span className="font-medium">{project.qaVerified}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.qcCompleted > 0 && <span className="font-medium">{project.qcCompleted}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.preproductionDeployment > 0 && <span className="font-medium">{project.preproductionDeployment}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.productionDeployment > 0 && <span className="font-medium">{project.productionDeployment}</span>}
                      </TableCell>
                      <TableCell className="text-center text-xs py-2">
                        {project.closed > 0 && <span className="font-medium">{project.closed}</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProjectSummary;
