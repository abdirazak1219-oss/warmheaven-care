-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'house_manager', 'supervisor', 'nurse', 'caregiver', 'billing');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE client_status AS ENUM ('active', 'pending', 'inactive', 'discharged');
CREATE TYPE care_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE shift_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'conflict');
CREATE TYPE timesheet_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE care_plan_status AS ENUM ('draft', 'published', 'archived');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'caregiver',
    status user_status NOT NULL DEFAULT 'active',
    phone TEXT,
    hourly_rate DECIMAL(10,2),
    hire_date DATE,
    skills TEXT[],
    certifications JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Houses table
CREATE TABLE public.houses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    manager_id UUID REFERENCES public.profiles(id),
    capacity INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    primary_diagnosis TEXT,
    care_level care_level DEFAULT 'medium',
    status client_status NOT NULL DEFAULT 'active',
    admission_date DATE,
    assigned_house_id UUID REFERENCES public.houses(id),
    assigned_coordinator_id UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Care Plans table
CREATE TABLE public.care_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status care_plan_status NOT NULL DEFAULT 'draft',
    version INTEGER NOT NULL DEFAULT 1,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Care Plan Tasks table
CREATE TABLE public.care_plan_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_plan_id UUID NOT NULL REFERENCES public.care_plans(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    frequency TEXT,
    assigned_role user_role,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schedule Shifts table
CREATE TABLE public.schedule_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    caregiver_id UUID NOT NULL REFERENCES public.profiles(id),
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(4,2),
    status shift_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily Reports table
CREATE TABLE public.daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    caregiver_id UUID NOT NULL REFERENCES public.profiles(id),
    report_date DATE NOT NULL,
    mood TEXT,
    appetite TEXT,
    sleep_quality TEXT,
    activities TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vitals Records table
CREATE TABLE public.vitals_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    recorded_by UUID NOT NULL REFERENCES public.profiles(id),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    temperature DECIMAL(4,1),
    oxygen_saturation INTEGER,
    blood_glucose INTEGER,
    weight DECIMAL(5,1),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Medication Profiles table
CREATE TABLE public.medication_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    route TEXT,
    frequency TEXT,
    prescriber TEXT,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Medication Administrations table (MAR)
CREATE TABLE public.medication_administrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_profile_id UUID NOT NULL REFERENCES public.medication_profiles(id) ON DELETE CASCADE,
    administered_by UUID NOT NULL REFERENCES public.profiles(id),
    administered_at TIMESTAMPTZ NOT NULL,
    was_administered BOOLEAN NOT NULL DEFAULT true,
    reason_not_given TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Billing Rates table (Maine DHHS)
CREATE TABLE public.billing_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    procedure_code TEXT UNIQUE NOT NULL,
    code_description TEXT NOT NULL,
    unit_of_service TEXT NOT NULL,
    unit_price DECIMAL(10,2),
    section TEXT,
    effective_from DATE DEFAULT '2025-07-01',
    effective_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timesheets table
CREATE TABLE public.timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caregiver_id UUID NOT NULL REFERENCES public.profiles(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status timesheet_status NOT NULL DEFAULT 'draft',
    total_hours DECIMAL(10,2) DEFAULT 0,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timesheet Entries table
CREATE TABLE public.timesheet_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timesheet_id UUID NOT NULL REFERENCES public.timesheets(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id),
    entry_date DATE NOT NULL,
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    hours_worked DECIMAL(4,2),
    gps_location_in JSONB,
    gps_location_out JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices table
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'draft',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_date DATE,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice Lines table
CREATE TABLE public.invoice_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    billing_rate_id UUID REFERENCES public.billing_rates(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    changes JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_house ON public.clients(assigned_house_id);
CREATE INDEX idx_care_plans_client ON public.care_plans(client_id);
CREATE INDEX idx_care_plans_status ON public.care_plans(status);
CREATE INDEX idx_shifts_date ON public.schedule_shifts(shift_date);
CREATE INDEX idx_shifts_caregiver ON public.schedule_shifts(caregiver_id);
CREATE INDEX idx_shifts_client ON public.schedule_shifts(client_id);
CREATE INDEX idx_daily_reports_date ON public.daily_reports(report_date);
CREATE INDEX idx_daily_reports_client ON public.daily_reports(client_id);
CREATE INDEX idx_vitals_client ON public.vitals_records(client_id);
CREATE INDEX idx_vitals_recorded_at ON public.vitals_records(recorded_at);
CREATE INDEX idx_medications_client ON public.medication_profiles(client_id);
CREATE INDEX idx_medication_admin_profile ON public.medication_administrations(medication_profile_id);
CREATE INDEX idx_billing_rates_procedure ON public.billing_rates(procedure_code);
CREATE INDEX idx_billing_rates_active ON public.billing_rates(is_active);
CREATE INDEX idx_timesheets_caregiver ON public.timesheets(caregiver_id);
CREATE INDEX idx_timesheets_status ON public.timesheets(status);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at);
