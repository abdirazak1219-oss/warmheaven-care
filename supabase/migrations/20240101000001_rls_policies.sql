-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_administrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to check if user is assigned to client
CREATE OR REPLACE FUNCTION public.user_assigned_to_client(client_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.schedule_shifts 
    WHERE client_id = client_uuid 
    AND caregiver_id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (get_user_role() = 'admin');

-- Houses policies
CREATE POLICY "All authenticated users can view houses" ON public.houses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins and house managers can manage houses" ON public.houses FOR ALL USING (get_user_role() IN ('admin', 'house_manager'));

-- Clients policies
CREATE POLICY "Admins, nurses, supervisors, house managers can view all clients" ON public.clients FOR SELECT 
  USING (get_user_role() IN ('admin', 'nurse', 'supervisor', 'house_manager'));
CREATE POLICY "Caregivers can view assigned clients" ON public.clients FOR SELECT 
  USING (get_user_role() = 'caregiver' AND user_assigned_to_client(id));
CREATE POLICY "Admins, house managers, supervisors can manage clients" ON public.clients FOR ALL 
  USING (get_user_role() IN ('admin', 'house_manager', 'supervisor'));

-- Care Plans policies
CREATE POLICY "Authorized users can view care plans" ON public.care_plans FOR SELECT 
  USING (get_user_role() IN ('admin', 'nurse', 'supervisor', 'house_manager') 
    OR (get_user_role() = 'caregiver' AND user_assigned_to_client(client_id)));
CREATE POLICY "Admins and nurses can manage care plans" ON public.care_plans FOR ALL 
  USING (get_user_role() IN ('admin', 'nurse'));

-- Care Plan Tasks policies
CREATE POLICY "Users can view tasks for viewable care plans" ON public.care_plan_tasks FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.care_plans 
    WHERE id = care_plan_id 
    AND (get_user_role() IN ('admin', 'nurse', 'supervisor', 'house_manager')
      OR (get_user_role() = 'caregiver' AND user_assigned_to_client(client_id)))
  ));
CREATE POLICY "Admins and nurses can manage tasks" ON public.care_plan_tasks FOR ALL 
  USING (get_user_role() IN ('admin', 'nurse'));

-- Schedule Shifts policies
CREATE POLICY "Admins, house managers, supervisors can view all shifts" ON public.schedule_shifts FOR SELECT 
  USING (get_user_role() IN ('admin', 'house_manager', 'supervisor'));
CREATE POLICY "Caregivers can view own shifts" ON public.schedule_shifts FOR SELECT 
  USING (get_user_role() = 'caregiver' AND caregiver_id = auth.uid());
CREATE POLICY "Admins, house managers, supervisors can manage shifts" ON public.schedule_shifts FOR ALL 
  USING (get_user_role() IN ('admin', 'house_manager', 'supervisor'));

-- Daily Reports policies
CREATE POLICY "Caregivers can create own reports" ON public.daily_reports FOR INSERT 
  WITH CHECK (caregiver_id = auth.uid());
CREATE POLICY "Caregivers can view/edit own reports" ON public.daily_reports FOR ALL 
  USING (caregiver_id = auth.uid());
CREATE POLICY "Admins, nurses, supervisors, house managers can view all reports" ON public.daily_reports FOR SELECT 
  USING (get_user_role() IN ('admin', 'nurse', 'supervisor', 'house_manager'));

-- Vitals Records policies
CREATE POLICY "Authorized users can view vitals" ON public.vitals_records FOR SELECT 
  USING (get_user_role() IN ('admin', 'nurse', 'supervisor', 'house_manager'));
CREATE POLICY "Admins and nurses can manage vitals" ON public.vitals_records FOR ALL 
  USING (get_user_role() IN ('admin', 'nurse'));

-- Medication Profiles policies
CREATE POLICY "Authorized users can view medication profiles" ON public.medication_profiles FOR SELECT 
  USING (get_user_role() IN ('admin', 'nurse', 'supervisor', 'house_manager')
    OR (get_user_role() = 'caregiver' AND user_assigned_to_client(client_id)));
CREATE POLICY "Admins and nurses can manage medication profiles" ON public.medication_profiles FOR ALL 
  USING (get_user_role() IN ('admin', 'nurse'));

-- Medication Administrations policies
CREATE POLICY "Authorized users can view medication administrations" ON public.medication_administrations FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.medication_profiles mp
    WHERE mp.id = medication_profile_id
    AND (get_user_role() IN ('admin', 'nurse', 'supervisor', 'house_manager')
      OR (get_user_role() = 'caregiver' AND user_assigned_to_client(mp.client_id)))
  ));
CREATE POLICY "Caregivers can record administrations for assigned clients" ON public.medication_administrations FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.medication_profiles mp
    WHERE mp.id = medication_profile_id
    AND user_assigned_to_client(mp.client_id)
  ));
CREATE POLICY "Admins and nurses can manage all administrations" ON public.medication_administrations FOR ALL 
  USING (get_user_role() IN ('admin', 'nurse'));

-- Billing Rates policies
CREATE POLICY "All authenticated users can view billing rates" ON public.billing_rates FOR SELECT 
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage billing rates" ON public.billing_rates FOR ALL 
  USING (get_user_role() = 'admin');

-- Timesheets policies
CREATE POLICY "Caregivers can manage own timesheets" ON public.timesheets FOR ALL 
  USING (caregiver_id = auth.uid());
CREATE POLICY "Admins, house managers, supervisors can view all timesheets" ON public.timesheets FOR SELECT 
  USING (get_user_role() IN ('admin', 'house_manager', 'supervisor'));
CREATE POLICY "Admins, house managers, supervisors can approve timesheets" ON public.timesheets FOR UPDATE 
  USING (get_user_role() IN ('admin', 'house_manager', 'supervisor'));

-- Timesheet Entries policies
CREATE POLICY "Users can manage entries for their timesheets" ON public.timesheet_entries FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.timesheets t
    WHERE t.id = timesheet_id
    AND (t.caregiver_id = auth.uid() OR get_user_role() IN ('admin', 'house_manager', 'supervisor'))
  ));

-- Invoices policies
CREATE POLICY "Admins and billing can view all invoices" ON public.invoices FOR SELECT 
  USING (get_user_role() IN ('admin', 'billing'));
CREATE POLICY "Admins can manage invoices" ON public.invoices FOR ALL 
  USING (get_user_role() = 'admin');

-- Invoice Lines policies
CREATE POLICY "Users can view invoice lines for viewable invoices" ON public.invoice_lines FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.invoices inv
    WHERE inv.id = invoice_id
    AND get_user_role() IN ('admin', 'billing')
  ));
CREATE POLICY "Admins can manage invoice lines" ON public.invoice_lines FOR ALL 
  USING (get_user_role() = 'admin');

-- Audit Logs policies
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT 
  USING (get_user_role() = 'admin');
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT 
  WITH CHECK (true);
