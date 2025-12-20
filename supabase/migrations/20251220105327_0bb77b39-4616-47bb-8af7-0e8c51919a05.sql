-- Create app_role enum for role-based visibility
CREATE TYPE public.app_role AS ENUM ('admin', 'finance', 'manager', 'contributor');

-- Profiles table for basic employee info
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT,
  designation TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Employee rates table with time-effective history
-- Rates are per-employee, NOT per activity type (to avoid wrong economics)
CREATE TABLE public.employee_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cost_rate DECIMAL(10,2) NOT NULL,           -- Internal cost rate (for margin calculation)
  bill_rate DECIMAL(10,2) NOT NULL,           -- External billing rate (for invoicing)
  currency TEXT NOT NULL DEFAULT 'USD',
  effective_from DATE NOT NULL,               -- Rate effective start date
  effective_to DATE,                          -- NULL = currently active rate
  notes TEXT,                                 -- Reason for rate change
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_rates ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if user can view rates (admin, finance, manager only)
CREATE OR REPLACE FUNCTION public.can_view_rates(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'finance', 'manager')
  )
$$;

-- Helper function to check if user can manage rates (admin, finance only)
CREATE OR REPLACE FUNCTION public.can_manage_rates(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'finance')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for employee_rates (role-based visibility)
-- Contributors should NOT see rates/margin
CREATE POLICY "Rate viewers can see rates"
  ON public.employee_rates FOR SELECT
  TO authenticated
  USING (public.can_view_rates(auth.uid()));

CREATE POLICY "Rate managers can insert rates"
  ON public.employee_rates FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_rates(auth.uid()));

CREATE POLICY "Rate managers can update rates"
  ON public.employee_rates FOR UPDATE
  TO authenticated
  USING (public.can_manage_rates(auth.uid()));

-- Function to get current rate for an employee
CREATE OR REPLACE FUNCTION public.get_current_employee_rate(_user_id UUID)
RETURNS TABLE(cost_rate DECIMAL, bill_rate DECIMAL, currency TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT er.cost_rate, er.bill_rate, er.currency
  FROM public.employee_rates er
  WHERE er.user_id = _user_id
    AND er.effective_from <= CURRENT_DATE
    AND (er.effective_to IS NULL OR er.effective_to >= CURRENT_DATE)
  ORDER BY er.effective_from DESC
  LIMIT 1
$$;

-- Function to get rate for an employee on a specific date
CREATE OR REPLACE FUNCTION public.get_employee_rate_on_date(_user_id UUID, _date DATE)
RETURNS TABLE(cost_rate DECIMAL, bill_rate DECIMAL, currency TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT er.cost_rate, er.bill_rate, er.currency
  FROM public.employee_rates er
  WHERE er.user_id = _user_id
    AND er.effective_from <= _date
    AND (er.effective_to IS NULL OR er.effective_to >= _date)
  ORDER BY er.effective_from DESC
  LIMIT 1
$$;

-- Trigger to update profiles.updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email
  );
  
  -- Default role: contributor
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'contributor');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();