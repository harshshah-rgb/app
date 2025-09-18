/*
  # Ensure proper RLS setup for all tables

  1. Security Updates
    - Fix RLS policies for all tables
    - Ensure proper user access controls
    - Add missing policies where needed

  2. Employee Table Fixes
    - Allow users to create their own records
    - Allow users to read and update their own data
    - Prevent access to other users' data


-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can create own employee record" ON employees;
DROP POLICY IF EXISTS "Users can read own employee data" ON employees;
DROP POLICY IF EXISTS "Users can update own employee data" ON employees;

-- Recreate employee policies with proper permissions
CREATE POLICY "Users can create own employee record"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own employee data"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own employee data"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure all other tables have proper RLS policies
-- Announcements - readable by all authenticated users
DROP POLICY IF EXISTS "Authenticated users can read announcements" ON announcements;
CREATE POLICY "Authenticated users can read announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Handbooks - readable by all authenticated users
DROP POLICY IF EXISTS "Authenticated users can read handbooks" ON handbooks;
CREATE POLICY "Authenticated users can read handbooks"
  ON handbooks
  FOR SELECT
  TO authenticated
  USING (true);

-- Attendance records - users can manage their own
DROP POLICY IF EXISTS "Users can manage own attendance" ON attendance_records;
CREATE POLICY "Users can manage own attendance"
  ON attendance_records
  FOR ALL
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

-- Timesheet entries - users can manage their own
DROP POLICY IF EXISTS "Users can manage own timesheets" ON timesheet_entries;
CREATE POLICY "Users can manage own timesheets"
  ON timesheet_entries
  FOR ALL
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

-- Expense records - users can manage their own
DROP POLICY IF EXISTS "Users can manage own expenses" ON expense_records;
CREATE POLICY "Users can manage own expenses"
  ON expense_records
  FOR ALL
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

-- Sales leads - users can manage their own
DROP POLICY IF EXISTS "Users can manage own sales leads" ON sales_leads;
CREATE POLICY "Users can manage own sales leads"
  ON sales_leads
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Help desk tickets - users can manage their own
DROP POLICY IF EXISTS "Users can manage own tickets" ON help_desk_tickets;
CREATE POLICY "Users can manage own tickets"
  ON help_desk_tickets
  FOR ALL
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());