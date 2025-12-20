-- Projects table for time entry validation
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  project_type TEXT NOT NULL DEFAULT 'external' CHECK (project_type IN ('internal', 'external')),
  client TEXT,
  manager_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Hold', 'Completed', 'Archived')),
  billing_model TEXT CHECK (billing_model IN ('hourly', 'milestone', 'fixed', 'hybrid')),
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Tasks table for time entry linkage
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES public.tasks(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'in_progress', 'in_review', 'blocked', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  primary_assignee_id UUID REFERENCES auth.users(id),
  is_billable BOOLEAN NOT NULL DEFAULT true,
  estimated_hours DECIMAL(8,2),
  depth INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Time Entries table - append-only with correction versioning
-- Each entry is an atomic economic record
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id),
  task_id UUID REFERENCES public.tasks(id),
  
  -- Activity type (required) - Dev, Design, Admin, Meeting
  activity_type TEXT NOT NULL CHECK (activity_type IN ('dev', 'design', 'admin', 'meeting')),
  
  -- Core time data
  entry_date DATE NOT NULL,
  logged_hours DECIMAL(4,2) NOT NULL CHECK (logged_hours > 0 AND logged_hours <= 24),
  billable_hours DECIMAL(4,2) NOT NULL DEFAULT 0 CHECK (billable_hours >= 0 AND billable_hours <= 24),
  is_billable BOOLEAN NOT NULL DEFAULT true,
  
  -- Description
  description TEXT NOT NULL,
  
  -- Append-only correction versioning
  -- NULL = original entry, otherwise points to entry being corrected
  corrects_entry_id UUID REFERENCES public.time_entries(id),
  -- Correction reason (required for corrections)
  correction_reason TEXT,
  -- Soft delete for corrections (original entry marked as corrected)
  is_corrected BOOLEAN NOT NULL DEFAULT false,
  
  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Constraint: correction_reason required when correcting
  CONSTRAINT correction_requires_reason CHECK (
    (corrects_entry_id IS NULL) OR (correction_reason IS NOT NULL AND correction_reason != '')
  )
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Index for efficient lookups
CREATE INDEX idx_time_entries_user_date ON public.time_entries(user_id, entry_date);
CREATE INDEX idx_time_entries_project ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_task ON public.time_entries(task_id);
CREATE INDEX idx_time_entries_corrects ON public.time_entries(corrects_entry_id) WHERE corrects_entry_id IS NOT NULL;

-- Function to check if project is archived (prevent time entry on archived projects)
CREATE OR REPLACE FUNCTION public.is_project_active(_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects
    WHERE id = _project_id
      AND status != 'Archived'
  )
$$;

-- RLS Policies for projects
CREATE POLICY "Users can view all projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can manage projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager') OR
    manager_id = auth.uid()
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view all tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Assignees and managers can manage tasks"
  ON public.tasks FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager') OR
    primary_assignee_id = auth.uid()
  );

-- RLS Policies for time_entries
-- Users can view their own entries, managers/admins can view all
CREATE POLICY "Users can view own entries, managers view all"
  ON public.time_entries FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager') OR
    public.has_role(auth.uid(), 'finance')
  );

-- Users can create their own entries (only on active projects)
CREATE POLICY "Users can create own entries on active projects"
  ON public.time_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    created_by = auth.uid() AND
    public.is_project_active(project_id)
  );

-- Users can update own pending entries, managers can update any
CREATE POLICY "Users can update own pending entries"
  ON public.time_entries FOR UPDATE
  TO authenticated
  USING (
    (user_id = auth.uid() AND status = 'pending') OR
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- No delete - append-only with corrections
-- (RLS implicitly denies DELETE since no policy exists)

-- Trigger to update projects.updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update tasks.updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();