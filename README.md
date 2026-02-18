# Warm Heaven Enterprise

Professional home care agency management platform for Maine healthcare providers.

## Features

- **5 User Roles**: Admin, House Manager, Supervisor, Nurse, Caregiver
- **9 Core Modules**:
  - Dashboard with key metrics
  - Client Management
  - Caregiver Management
  - Care Plans (versioned)
  - Schedule Management
  - Daily Reports
  - Medical Reports (Vitals + MAR)
  - Billing & Invoicing (Maine DHHS rates)
  - Reports & Analytics
  - Audit Logs (Admin only)
- **Maine DHHS Billing**: 104 procedure codes from Sections 20 & 21
- **Row Level Security**: Role-based data access via Supabase RLS
- **Production-Ready**: Built with Next.js 15, TypeScript, Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/abdirazak1219-oss/warmheaven-care.git
cd warmheaven-care
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Run the migrations in order:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240101000001_rls_policies.sql`
   - `supabase/migrations/20240101000002_maine_dhhs_rates.sql`

### 4. Configure environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/abdirazak1219-oss/warmheaven-care)

1. Click the button above or go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Database Schema

- **17 tables** with proper relationships
- **RLS policies** for 5 user roles
- **104 Maine DHHS billing rates** preloaded
- **Indexes** on all key columns for performance

### Core Tables

- `profiles` - User profiles (extends auth.users)
- `clients` - Client records
- `houses` - Facility management
- `care_plans` - Versioned care plans
- `schedule_shifts` - Caregiver scheduling
- `daily_reports` - Daily care reports
- `vitals_records` - Vital signs tracking
- `medication_profiles` - Medication tracking
- `medication_administrations` - MAR
- `timesheets` - Timesheet tracking
- `invoices` - Billing and invoicing
- `billing_rates` - Maine DHHS rates
- `audit_logs` - Security audit trail

## User Roles & Permissions

### Admin
- Full platform access
- User management
- Billing & financial data
- Audit logs

### House Manager
- Facility management
- Schedule management
- Caregiver assignments
- Timesheet approval

### Supervisor
- Team oversight
- Care plan review
- Quality assurance
- Timesheet approval

### Nurse
- Care plan management
- Medical reports (vitals + MAR)
- Client clinical data

### Caregiver
- View assigned clients
- Submit daily reports
- Record medication administration
- Clock in/out (timesheet tracking)

## Maine DHHS Billing Integration

104 procedure codes loaded with:
- **Section 20**: Adults with Other Related Conditions (43 codes)
- **Section 21**: Adults with Intellectual Disabilities/Autism (61 codes)
- Fixed-rate and variable-rate ("Per Invoice") billing
- Effective date: July 1, 2025

## License

Proprietary - © 2026 Warm Heaven Enterprise

## Support

For issues or questions, contact: [support email]
