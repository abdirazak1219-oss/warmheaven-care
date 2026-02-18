export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
}

export type AuditLog = {
  id: string;
  created_at: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  ip_address: string;
  user?: Partial<Profile>;
}

export type Client = {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
}

export type Shift = {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
  client?: Partial<Client>;
  caregiver?: Partial<Profile>;
}

export type CarePlan = {
  id: string;
  client_id: string;
  version: number;
  status: string;
  created_at: string;
  client?: Partial<Client>;
}

export type DailyReport = {
  id: string;
  client_id: string;
  caregiver_id: string;
  report_date: string;
  status: string;
  created_at: string;
  client?: Partial<Client>;
  caregiver?: Partial<Profile>;
}
