
-- Fix 1: Restrict profiles SELECT to authenticated users only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Fix 2: Restrict time_entries UPDATE to owner, admin, or manager
DROP POLICY IF EXISTS "Authenticated users can update time entries" ON public.time_entries;
CREATE POLICY "Users can update own or managed time entries"
ON public.time_entries
FOR UPDATE
USING (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- Fix 3: Restrict time_entries SELECT to authenticated users (remove duplicate public policy)
DROP POLICY IF EXISTS "Public can view time entries" ON public.time_entries;

-- Fix 4: Restrict tasks SELECT to authenticated users (remove duplicate public policy)  
DROP POLICY IF EXISTS "Public can view tasks" ON public.tasks;

-- Fix 5: Restrict projects SELECT to authenticated users (remove duplicate public policy)
DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
