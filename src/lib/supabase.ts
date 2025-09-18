import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Employee {
  id: string;
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  position: string;
  hire_date: string;
  status: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  author: string;
  pinned: boolean;
  created_at: string;
}

export interface Handbook {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url?: string;
  pages: number;
  size: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  hours: number;
  status: string;
  location: string;
  created_at: string;
}

export interface TimesheetEntry {
  id: string;
  employee_id: string;
  date: string;
  project: string;
  hours: number;
  description?: string;
  status: string;
  created_at: string;
}

export interface ExpenseRecord {
  id: string;
  employee_id: string;
  expense_id: string;
  date: string;
  category: string;
  description: string;
  currency: string;
  amount: number;
  receipt_url?: string;
  status: string;
  created_at: string;
}

export interface SalesLead {
  id: string;
  sales_id: string;
  account: string;
  status: string;
  amount: number;
  probability: number;
  closure_date: string;
  created_by?: string;
  created_at: string;
}

export interface HelpDeskTicket {
  id: string;
  employee_id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Expense interface
export interface Expense {
  expense_id: string;
  date: string;
  category: string;
  description: string;
  currency: string;
  amount: number;
  amount_aed: number;
  receipt?: string;
  created_at: string;
  updated_at: string;
}

// Sales interfaces
export interface Opportunity {
  id: string;
  name: string;
  stage: string;
  value: number;
  created_at: string;
}

export interface SalesReport {
  id: string;
  report_name: string;
  total_sales: number;
  report_date: string;
  created_at: string;
}

// Leads Management interface
export interface LeadsManagement {
  sales_id: string;
  status: string;
  account: string;
  amount: number;
  probability: string;
  closure_date: string;
}

// Auth helper functions
export const signUp = async (email: string, password: string, userData: Partial<Employee>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined,
      data: {
        email_confirm: false
      }
    }
  });

  if (error) throw error;

  // Create employee record
  if (data.user) {
    const { error: employeeError } = await supabase
      .from('employees')
      .insert([{
        id: data.user.id,
        email,
        employee_id: userData.employee_id || `EMP${Date.now().toString().slice(-6)}`,
        first_name: userData.first_name || 'Employee',
        last_name: userData.last_name || 'User',
        department: userData.department || 'General',
        position: userData.position || 'Employee',
        hire_date: userData.hire_date || new Date().toISOString().split('T')[0],
        status: 'active',
        phone: userData.phone || null,
        address: userData.address || null
      }]);

    if (employeeError) throw employeeError;
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  
  console.log('Sign in data:', data);
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('getCurrentUser result:', user?.id);
  return user;
};

export const getEmployeeData = async (userId: string) => {
  console.log('Fetching employee data for:', userId);
  
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Employee data fetch error:', error);
    throw error;
  }
  
  console.log('Employee data fetched:', data);
  return data;
};