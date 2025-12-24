import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_CATEGORY_LABELS,
  MAX_TASK_DEPTH,
  wouldCreateCircularReference,
  canHaveChildren,
} from "@/types/project";

interface TaskFormProps {
  projectId: number;
  allTasks: Task[];
  initialData?: Partial<Task>;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  mode?: "create" | "edit";
}

export interface TaskFormData {
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  parentTaskId: number | null;
  isBillable: boolean;
  estimatedHours: number | null;
  dueDate: string;
  primaryAssigneeId: string;
}

// Get the depth of a task (for display purposes)
const getTaskPath = (taskId: number, tasks: Task[]): string[] => {
  const path: string[] = [];
  let currentTask = tasks.find(t => t.id === taskId);
  
  while (currentTask) {
    path.unshift(currentTask.name);
    currentTask = currentTask.parentTaskId 
      ? tasks.find(t => t.id === currentTask?.parentTaskId)
      : undefined;
  }
  
  return path;
};

export const TaskForm = ({
  projectId,
  allTasks,
  initialData,
  onSubmit,
  onCancel,
  mode = "create",
}: TaskFormProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    status: initialData?.status ?? "open",
    priority: initialData?.priority ?? "medium",
    category: initialData?.category ?? "development",
    parentTaskId: initialData?.parentTaskId ?? null,
    isBillable: initialData?.isBillable ?? true,
    estimatedHours: initialData?.estimatedHours ?? null,
    dueDate: initialData?.dueDate ?? "",
    primaryAssigneeId: initialData?.primaryAssigneeId ?? "",
  });

  // Filter valid parent tasks:
  // 1. Same project
  // 2. Depth < MAX_TASK_DEPTH (can have children)
  // 3. Not self (for edit mode)
  // 4. Would not create circular reference (for edit mode)
  const validParentTasks = useMemo(() => {
    const projectTasks = allTasks.filter(t => t.projectId === projectId);
    
    return projectTasks.filter(task => {
      // Must be able to have children (depth check)
      if (!canHaveChildren(task)) return false;
      
      // In edit mode, additional checks
      if (mode === "edit" && initialData?.id) {
        // Can't be self
        if (task.id === initialData.id) return false;
        
        // Can't create circular reference
        if (wouldCreateCircularReference(initialData.id, task.id, allTasks)) {
          return false;
        }
      }
      
      return true;
    });
  }, [allTasks, projectId, mode, initialData?.id]);

  // Group parent tasks by their own parent for visual hierarchy
  const groupedParentTasks = useMemo(() => {
    const rootTasks = validParentTasks.filter(t => !t.parentTaskId);
    const result: { task: Task; path: string[] }[] = [];
    
    rootTasks.forEach(root => {
      result.push({ task: root, path: [root.name] });
      
      // Add direct children (depth 1)
      const children = validParentTasks.filter(t => t.parentTaskId === root.id);
      children.forEach(child => {
        result.push({ task: child, path: [root.name, child.name] });
      });
    });
    
    return result;
  }, [validParentTasks]);

  const handleChange = (field: keyof TaskFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Calculate what depth the new task will be
  const newTaskDepth = useMemo(() => {
    if (!formData.parentTaskId) return 0;
    const parent = allTasks.find(t => t.id === formData.parentTaskId);
    return parent ? parent.depth + 1 : 0;
  }, [formData.parentTaskId, allTasks]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Task Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Task Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter task name"
          required
        />
      </div>

      {/* Parent Task Selection */}
      <div className="space-y-2">
        <Label htmlFor="parentTask">Parent Task (Optional)</Label>
        <Select
          value={formData.parentTaskId?.toString() ?? "none"}
          onValueChange={(value) => 
            handleChange("parentTaskId", value === "none" ? null : parseInt(value))
          }
        >
          <SelectTrigger id="parentTask">
            <SelectValue placeholder="No parent (root task)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground">No parent (root task)</span>
            </SelectItem>
            {groupedParentTasks.map(({ task, path }) => (
              <SelectItem key={task.id} value={task.id.toString()}>
                <div className="flex items-center gap-1">
                  {path.map((segment, idx) => (
                    <span key={idx} className="flex items-center">
                      {idx > 0 && (
                        <ChevronRight className="h-3 w-3 text-muted-foreground mx-1" />
                      )}
                      <span className={idx === path.length - 1 ? "font-medium" : "text-muted-foreground text-sm"}>
                        {segment}
                      </span>
                    </span>
                  ))}
                  <Badge variant="outline" className="ml-2 text-xs">
                    Depth {task.depth}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formData.parentTaskId && (
          <p className="text-xs text-muted-foreground">
            This task will be at depth {newTaskDepth}
            {newTaskDepth === MAX_TASK_DEPTH && " (maximum depth - cannot have children)"}
          </p>
        )}
        {validParentTasks.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No tasks available as parents (all at maximum depth)
          </p>
        )}
      </div>

      {/* Status & Priority */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange("status", value as TaskStatus)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleChange("priority", value as TaskPriority)}
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {TASK_PRIORITY_LABELS[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleChange("category", value as TaskCategory)}
        >
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TASK_CATEGORY_LABELS) as TaskCategory[]).map((category) => (
              <SelectItem key={category} value={category}>
                {TASK_CATEGORY_LABELS[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Billing & Hours */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="estimatedHours">Estimated Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            min="0"
            step="0.5"
            value={formData.estimatedHours ?? ""}
            onChange={(e) => 
              handleChange("estimatedHours", e.target.value ? parseFloat(e.target.value) : null)
            }
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
          />
        </div>
      </div>

      {/* Billable Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isBillable"
          checked={formData.isBillable}
          onCheckedChange={(checked) => handleChange("isBillable", checked as boolean)}
        />
        <Label htmlFor="isBillable" className="cursor-pointer">
          Billable task (include in client invoicing)
        </Label>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the task..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {mode === "create" ? "Create Task" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
