/*
  # Remove User-Specific Data Restrictions

  This migration removes Row Level Security policies that restrict data access to specific users,
  allowing all authenticated users to access all data across the application.

  ## Changes Made
  1. Drop existing restrictive RLS policies
  2. Create new policies that allow all authenticated users to access all data
  3. Update policies for all tables: employees, attendance_records, timesheet_entries, expenses, leads_management, help_desk_tickets

  ## Security Note
  This removes data isolation between users - all authenticated users can now see and modify all records.
*/

-- Drop existing restrictive policies for employees table
DROP POLICY IF EXISTS "Users can read own employee data" ON employees;
DROP POLICY IF EXISTS "Users can update own employee data" ON employees;
DROP POLICY IF EXISTS "Users can create own employee record" ON employees;

-- Create new open policies for employees table
CREATE POLICY "All authenticated users can read employee data"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can update employee data"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All authenticated users can insert employee data"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Drop existing restrictive policies for attendance_records table
DROP POLICY IF EXISTS "Users can view own attendance" ON attendance_records;
DROP POLICY IF EXISTS "Users can insert own attendance" ON attendance_records;
DROP POLICY IF EXISTS "Users can update own attendance" ON attendance_records;
DROP POLICY IF EXISTS "Users can delete own attendance" ON attendance_records;

-- Create new open policies for attendance_records table
CREATE POLICY "All authenticated users can read attendance records"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can insert attendance records"
  ON attendance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can update attendance records"
  ON attendance_records
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All authenticated users can delete attendance records"
  ON attendance_records
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing restrictive policies for timesheet_entries table
DROP POLICY IF EXISTS "Users can view own timesheets" ON timesheet_entries;
DROP POLICY IF EXISTS "Users can insert own timesheets" ON timesheet_entries;
DROP POLICY IF EXISTS "Users can update own timesheets" ON timesheet_entries;
DROP POLICY IF EXISTS "Users can delete own timesheets" ON timesheet_entries;

-- Create new open policies for timesheet_entries table
CREATE POLICY "All authenticated users can read timesheet entries"
  ON timesheet_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can insert timesheet entries"
  ON timesheet_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can update timesheet entries"
  ON timesheet_entries
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All authenticated users can delete timesheet entries"
  ON timesheet_entries
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing restrictive policies for expenses table
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

-- Create new open policies for expenses table
CREATE POLICY "All authenticated users can read expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can insert expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can update expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All authenticated users can delete expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing restrictive policies for leads_management table
DROP POLICY IF EXISTS "Users can view own leads" ON leads_management;
DROP POLICY IF EXISTS "Users can insert own leads" ON leads_management;
DROP POLICY IF EXISTS "Users can update own leads" ON leads_management;
DROP POLICY IF EXISTS "Users can delete own leads" ON leads_management;

-- Create new open policies for leads_management table
CREATE POLICY "All authenticated users can read leads"
  ON leads_management
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can insert leads"
  ON leads_management
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can update leads"
  ON leads_management
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All authenticated users can delete leads"
  ON leads_management
  FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing restrictive policies for help_desk_tickets table
DROP POLICY IF EXISTS "Users can view own tickets" ON help_desk_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets" ON help_desk_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON help_desk_tickets;
DROP POLICY IF EXISTS "Users can delete own tickets" ON help_desk_tickets;

-- Create new open policies for help_desk_tickets table
CREATE POLICY "All authenticated users can read help desk tickets"
  ON help_desk_tickets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can insert help desk tickets"
  ON help_desk_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "All authenticated users can update help desk tickets"
  ON help_desk_tickets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All authenticated users can delete help desk tickets"
  ON help_desk_tickets
  FOR DELETE
  TO authenticated
  USING (true);