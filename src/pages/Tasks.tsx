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
import { Plus, ListTodo, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { mockTasks } from "@/data/mockProjects";
import { 
  Task, 
  MAX_TASK_DEPTH, 
  canHaveChildren,
  wouldCreateCircularReference,
} from "@/types/project";

// Mock data for projects
const projectsData = [
  { id: 1, project: "E-Commerce Platform" },
  { id: 2, project: "Mobile Banking App" },
  { id: 3, project: "CRM System" },
  { id: 4, project: "Analytics Dashboard" },
  { id: 5, project: "Inventory Management" },
  { id: 6, project: "Internal HR Portal" },
  { id: 7, project: "DevOps Infrastructure" },
];

// Mock employees data
const employeesData = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Sarah Smith" },
  { id: "3", name: "Mike Johnson" },
  { id: "4", name: "Emily Brown" },
  { id: "5", name: "David Lee" },
  { id: "6", name: "Lisa Wang" },
  { id: "7", name: "James Wilson" },
  { id: "8", name: "Anna Martinez" },
];

// Task categories
const taskCategories = [
  "Hold",
  "Open",
  "Analysis",
  "Analysis Completed",
  "Analysis Approved",
  "Assign to Development",
  "Unit Testing",
  "BA Review",
  "Assigned to QA",
  "QA Verified",
  "QC Completed",
  "Preproduction deployment",
  "Production deployment",
  "Closed",
];

// Mock sprints data
const sprintsData = [
  { id: 1, name: "Sprint 1", startDate: "01-12-2024", endDate: "15-12-2024", status: "Completed" },
  { id: 2, name: "Sprint 2", startDate: "16-12-2024", endDate: "31-12-2024", status: "Active" },
  { id: 3, name: "Sprint 3", startDate: "01-01-2025", endDate: "15-01-2025", status: "Planned" },
  { id: 4, name: "Sprint 4", startDate: "16-01-2025", endDate: "31-01-2025", status: "Planned" },
];

// Get task path for display
const getTaskPath = (task: Task, allTasks: Task[]): string[] => {
  const path: string[] = [];
  let current: Task | undefined = task;
  
  while (current) {
    path.unshift(current.name);
    current = current.parentTaskId 
      ? allTasks.find(t => t.id === current?.parentTaskId)
      : undefined;
  }
  
  return path;
};

const Tasks = () => {
  // All tasks state (using mock data)
  const [allTasks] = useState<Task[]>(mockTasks);

  // Task form state
  const [taskProject, setTaskProject] = useState<string>("");
  const [taskSprint, setTaskSprint] = useState<string>("");
  const [taskName, setTaskName] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [taskCategory, setTaskCategory] = useState<string>("");
  const [parentTaskId, setParentTaskId] = useState<string>("none");
  const [filterSprint, setFilterSprint] = useState<string>("all");
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

  // Get project ID from project name
  const selectedProjectId = useMemo(() => {
    const project = projectsData.find(p => p.project === taskProject);
    return project?.id;
  }, [taskProject]);

  // Filter valid parent tasks for selected project
  const validParentTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    
    return allTasks.filter(task => {
      // Must be same project
      if (task.projectId !== selectedProjectId) return false;
      // Must be able to have children (depth check)
      if (!canHaveChildren(task)) return false;
      return true;
    });
  }, [allTasks, selectedProjectId]);

  // Group parent tasks by hierarchy for display
  const groupedParentTasks = useMemo(() => {
    const rootTasks = validParentTasks.filter(t => !t.parentTaskId);
    const result: { task: Task; path: string[] }[] = [];
    
    rootTasks.forEach(root => {
      result.push({ task: root, path: [root.name] });
      
      // Add direct children (depth 1) that can still have children
      const children = validParentTasks.filter(t => t.parentTaskId === root.id);
      children.forEach(child => {
        result.push({ task: child, path: [root.name, child.name] });
      });
    });
    
    return result;
  }, [validParentTasks]);

  // Calculate new task depth
  const newTaskDepth = useMemo(() => {
    if (parentTaskId === "none") return 0;
    const parent = allTasks.find(t => t.id === parseInt(parentTaskId));
    return parent ? parent.depth + 1 : 0;
  }, [parentTaskId, allTasks]);

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleProjectChange = (value: string) => {
    setTaskProject(value);
    // Reset parent task when project changes
    setParentTaskId("none");
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskProject) {
      toast.error("Please select a project");
      return;
    }
    if (!taskSprint) {
      toast.error("Please select a sprint");
      return;
    }
    if (!taskName.trim()) {
      toast.error("Please enter task name");
      return;
    }
    if (!estimatedHours || parseFloat(estimatedHours) <= 0) {
      toast.error("Please enter valid estimated hours");
      return;
    }
    if (selectedEmployees.length === 0) {
      toast.error("Please assign at least one employee");
      return;
    }
    if (!taskCategory) {
      toast.error("Please select a task category");
      return;
    }

    const assignedNames = employeesData
      .filter((emp) => selectedEmployees.includes(emp.id))
      .map((emp) => emp.name)
      .join(", ");

    const parentInfo = parentTaskId !== "none" 
      ? ` (subtask of "${allTasks.find(t => t.id === parseInt(parentTaskId))?.name}")`
      : "";

    toast.success(`Task "${taskName}"${parentInfo} created in ${taskSprint}! Assigned to: ${assignedNames}`);
    
    // Reset form
    setTaskProject("");
    setTaskSprint("");
    setTaskName("");
    setEstimatedHours("");
    setSelectedEmployees([]);
    setTaskCategory("");
    setParentTaskId("none");
  };

  const filteredTasks = useMemo(() => {
    // Filter root tasks only for list view, then we'll show hierarchy
    const rootTasks = allTasks.filter(t => !t.parentTaskId);
    return rootTasks;
  }, [allTasks]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-700 text-xs">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500/20 text-blue-700 text-xs">In Progress</Badge>;
      case "in_review":
        return <Badge className="bg-purple-500/20 text-purple-700 text-xs">In Review</Badge>;
      case "assigned":
        return <Badge className="bg-amber-500/20 text-amber-700 text-xs">Assigned</Badge>;
      case "new":
        return <Badge className="bg-gray-500/20 text-gray-700 text-xs">New</Badge>;
      case "blocked":
        return <Badge className="bg-red-500/20 text-red-700 text-xs">Blocked</Badge>;
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

  const getSprintStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500/20 text-green-700 text-xs">{status}</Badge>;
      case "Active":
        return <Badge className="bg-accent/20 text-accent text-xs">{status}</Badge>;
      case "Planned":
        return <Badge className="bg-muted text-muted-foreground text-xs">{status}</Badge>;
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage tasks and sprint assignments
          </p>
        </div>

        {/* Create Task Form */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Plus className="h-4 w-4" />
              Create New Task
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Project Selection */}
                <div className="space-y-1">
                  <Label htmlFor="task-project" className="text-xs">Project *</Label>
                  <Select value={taskProject} onValueChange={handleProjectChange}>
                    <SelectTrigger id="task-project" className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {projectsData.map((project) => (
                        <SelectItem key={project.id} value={project.project}>
                          {project.project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Parent Task Selection */}
                <div className="space-y-1">
                  <Label htmlFor="parent-task" className="text-xs">Parent Task</Label>
                  <Select 
                    value={parentTaskId} 
                    onValueChange={setParentTaskId}
                    disabled={!taskProject}
                  >
                    <SelectTrigger id="parent-task" className="h-8 text-xs bg-background">
                      <SelectValue placeholder={taskProject ? "Select parent (optional)" : "Select project first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="none">
                        <span className="text-muted-foreground">No parent (root task)</span>
                      </SelectItem>
                      {groupedParentTasks.map(({ task, path }) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          <div className="flex items-center gap-1">
                            {path.map((segment, idx) => (
                              <span key={idx} className="flex items-center">
                                {idx > 0 && (
                                  <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                                )}
                                <span className={idx === path.length - 1 ? "font-medium" : "text-muted-foreground"}>
                                  {segment.length > 20 ? segment.substring(0, 20) + "..." : segment}
                                </span>
                              </span>
                            ))}
                            <Badge variant="outline" className="ml-1 text-[10px] px-1">
                              L{task.depth}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {parentTaskId !== "none" && (
                    <p className="text-[10px] text-muted-foreground">
                      Depth: {newTaskDepth}{newTaskDepth === MAX_TASK_DEPTH && " (max)"}
                    </p>
                  )}
                </div>

                {/* Sprint Selection */}
                <div className="space-y-1">
                  <Label htmlFor="task-sprint" className="text-xs">Sprint *</Label>
                  <Select value={taskSprint} onValueChange={setTaskSprint}>
                    <SelectTrigger id="task-sprint" className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {sprintsData.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.name}>
                          {sprint.name} ({sprint.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Task Category */}
                <div className="space-y-1">
                  <Label htmlFor="task-category" className="text-xs">Category *</Label>
                  <Select value={taskCategory} onValueChange={setTaskCategory}>
                    <SelectTrigger id="task-category" className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {taskCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Task Name */}
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="task-name" className="text-xs">Task Name *</Label>
                  <Input
                    id="task-name"
                    placeholder="Enter task name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Estimated Hours */}
                <div className="space-y-1">
                  <Label htmlFor="estimated-hours" className="text-xs">Est. Hours *</Label>
                  <Input
                    id="estimated-hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="Hours"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Employee Assignment */}
              <div className="space-y-2">
                <Label className="text-xs">Assign Employees *</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 p-3 border rounded-md bg-muted/30">
                  {employeesData.map((employee) => (
                    <div key={employee.id} className="flex items-center space-x-1.5">
                      <Checkbox
                        id={`employee-${employee.id}`}
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => handleEmployeeToggle(employee.id)}
                        className="h-3.5 w-3.5"
                      />
                      <label
                        htmlFor={`employee-${employee.id}`}
                        className="text-xs font-medium leading-none cursor-pointer"
                      >
                        {employee.name}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedEmployees.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedEmployees.length} employee(s) selected
                  </p>
                )}
              </div>

              <Button type="submit" size="sm" className="gap-1.5 h-8 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Create Task
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Task List by Sprint */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <ListTodo className="h-4 w-4" />
                Tasks by Sprint
              </CardTitle>
              <Select value={filterSprint} onValueChange={setFilterSprint}>
                <SelectTrigger className="h-8 text-xs w-40 bg-background">
                  <SelectValue placeholder="Filter by sprint" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Sprints</SelectItem>
                  {sprintsData.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.name}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-2">Task Name</TableHead>
                    <TableHead className="text-xs py-2">Project</TableHead>
                    <TableHead className="text-xs py-2">Category</TableHead>
                    <TableHead className="text-xs py-2 text-center">Est. Hours</TableHead>
                    <TableHead className="text-xs py-2 text-center">Logged</TableHead>
                    <TableHead className="text-xs py-2">Assignee</TableHead>
                    <TableHead className="text-xs py-2">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => {
                    const projectName = projectsData.find(p => p.id === task.projectId)?.project ?? "Unknown";
                    const subtasks = allTasks.filter(t => t.parentTaskId === task.id);
                    const subtaskCount = subtasks.length;
                    const isExpanded = expandedTasks.has(task.id);

                    const toggleExpand = () => {
                      setExpandedTasks(prev => {
                        const next = new Set(prev);
                        if (next.has(task.id)) {
                          next.delete(task.id);
                        } else {
                          next.add(task.id);
                        }
                        return next;
                      });
                    };

                    return (
                      <>
                        <TableRow 
                          key={task.id} 
                          className="cursor-pointer hover:bg-muted/50" 
                          onClick={() => {
                            if (subtaskCount > 0) {
                              toggleExpand();
                            } else {
                              toast.info(`Viewing task: ${task.name}`);
                            }
                          }}
                        >
                          <TableCell className="text-sm py-2">
                            <div className="flex items-center gap-2">
                              {subtaskCount > 0 && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
                                  className="p-0.5 hover:bg-muted rounded"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                              )}
                              {subtaskCount === 0 && <div className="w-5" />}
                              <span className="font-medium">{task.name}</span>
                              {subtaskCount > 0 && (
                                <Badge 
                                  variant="outline" 
                                  className="text-[10px] cursor-pointer hover:bg-muted"
                                  onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
                                >
                                  {subtaskCount} subtask{subtaskCount > 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm py-2">{projectName}</TableCell>
                          <TableCell className="text-sm py-2">{task.category}</TableCell>
                          <TableCell className="text-sm py-2 text-center">{task.estimatedHours ?? "-"}</TableCell>
                          <TableCell className="text-sm py-2 text-center">{task.loggedHours}h</TableCell>
                          <TableCell className="text-sm py-2">{task.primaryAssigneeName}</TableCell>
                          <TableCell className="text-sm py-2">{getStatusBadge(task.status)}</TableCell>
                        </TableRow>
                        
                        {/* Subtask rows */}
                        {isExpanded && subtasks.map((subtask) => {
                          const subSubtasks = allTasks.filter(t => t.parentTaskId === subtask.id);
                          const subSubtaskCount = subSubtasks.length;
                          const isSubExpanded = expandedTasks.has(subtask.id);

                          const toggleSubExpand = () => {
                            setExpandedTasks(prev => {
                              const next = new Set(prev);
                              if (next.has(subtask.id)) {
                                next.delete(subtask.id);
                              } else {
                                next.add(subtask.id);
                              }
                              return next;
                            });
                          };

                          return (
                            <>
                              <TableRow 
                                key={subtask.id} 
                                className={`bg-muted/30 ${subSubtaskCount > 0 ? "cursor-pointer" : ""}`}
                                onClick={subSubtaskCount > 0 ? toggleSubExpand : undefined}
                              >
                                <TableCell className="text-sm py-2">
                                  <div className="flex items-center gap-2 pl-6">
                                    {subSubtaskCount > 0 ? (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); toggleSubExpand(); }}
                                        className="p-0.5 hover:bg-muted rounded"
                                      >
                                        {isSubExpanded ? (
                                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                      </button>
                                    ) : (
                                      <div className="w-4" />
                                    )}
                                    <span className="text-muted-foreground">└</span>
                                    <span>{subtask.name}</span>
                                    {subSubtaskCount > 0 && (
                                      <Badge variant="outline" className="text-[10px]">
                                        {subSubtaskCount}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm py-2 text-muted-foreground">{projectName}</TableCell>
                                <TableCell className="text-sm py-2">{subtask.category}</TableCell>
                                <TableCell className="text-sm py-2 text-center">{subtask.estimatedHours ?? "-"}</TableCell>
                                <TableCell className="text-sm py-2 text-center">{subtask.loggedHours}h</TableCell>
                                <TableCell className="text-sm py-2">{subtask.primaryAssigneeName}</TableCell>
                                <TableCell className="text-sm py-2">{getStatusBadge(subtask.status)}</TableCell>
                              </TableRow>

                              {/* Level 2 subtasks */}
                              {isSubExpanded && subSubtasks.map((subSubtask) => (
                                <TableRow key={subSubtask.id} className="bg-muted/50">
                                  <TableCell className="text-sm py-2">
                                    <div className="flex items-center gap-2 pl-12">
                                      <div className="w-4" />
                                      <span className="text-muted-foreground">└</span>
                                      <span className="text-sm">{subSubtask.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm py-2 text-muted-foreground">{projectName}</TableCell>
                                  <TableCell className="text-sm py-2">{subSubtask.category}</TableCell>
                                  <TableCell className="text-sm py-2 text-center">{subSubtask.estimatedHours ?? "-"}</TableCell>
                                  <TableCell className="text-sm py-2 text-center">{subSubtask.loggedHours}h</TableCell>
                                  <TableCell className="text-sm py-2">{subSubtask.primaryAssigneeName}</TableCell>
                                  <TableCell className="text-sm py-2">{getStatusBadge(subSubtask.status)}</TableCell>
                                </TableRow>
                              ))}
                            </>
                          );
                        })}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
