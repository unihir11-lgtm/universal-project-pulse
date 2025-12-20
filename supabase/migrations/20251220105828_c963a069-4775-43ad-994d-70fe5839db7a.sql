-- Drop restrictive policies and create permissive ones for demo
DROP POLICY IF EXISTS "Users can view own entries, managers view all" ON public.time_entries;
DROP POLICY IF EXISTS "Users can create own entries on active projects" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update own pending entries" ON public.time_entries;

-- Create permissive policies for demo (authenticated users can do everything)
CREATE POLICY "Authenticated users can view all time entries"
  ON public.time_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create time entries"
  ON public.time_entries FOR INSERT
  TO authenticated
  WITH CHECK (public.is_project_active(project_id));

CREATE POLICY "Authenticated users can update time entries"
  ON public.time_entries FOR UPDATE
  TO authenticated
  USING (true);

-- Also allow anon to view for demo purposes
CREATE POLICY "Public can view time entries"
  ON public.time_entries FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view projects"
  ON public.projects FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can view tasks"
  ON public.tasks FOR SELECT
  TO anon
  USING (true);