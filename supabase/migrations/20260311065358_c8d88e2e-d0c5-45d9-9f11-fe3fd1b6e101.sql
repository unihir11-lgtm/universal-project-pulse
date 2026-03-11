
-- Designation Master with monthly salary
CREATE TABLE public.designation_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  designation TEXT NOT NULL UNIQUE,
  monthly_salary NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project Expenses table
CREATE TABLE public.project_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL DEFAULT 'General',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.designation_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_expenses ENABLE ROW LEVEL SECURITY;

-- RLS for designation_rates - admins and finance can manage, all authenticated can view
CREATE POLICY "Authenticated users can view designations" ON public.designation_rates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage designations" ON public.designation_rates
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for project_expenses - admins/managers/finance can manage, all can view
CREATE POLICY "Authenticated users can view expenses" ON public.project_expenses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Managers and admins can manage expenses" ON public.project_expenses
  FOR ALL TO authenticated USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role) OR
    has_role(auth.uid(), 'finance'::app_role)
  );

-- Trigger for updated_at on designation_rates
CREATE TRIGGER update_designation_rates_updated_at
  BEFORE UPDATE ON public.designation_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
