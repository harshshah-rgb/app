/*
  # Fix leads management RLS policies

  1. Security Updates
    - Drop existing restrictive policies
    - Create new policies that allow all authenticated employees to manage leads
    - Ensure employees can create, read, update, and delete their own leads
    - Fix policy conditions to use proper user authentication

  2. Changes
    - Remove overly restrictive policies
    - Add policies that check employee_id matches auth.uid()
    - Ensure all authenticated users can perform CRUD operations on their own data
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own leads" ON leads_management;
DROP POLICY IF EXISTS "Users can insert own leads" ON leads_management;
DROP POLICY IF EXISTS "Users can update own leads" ON leads_management;
DROP POLICY IF EXISTS "Users can delete own leads" ON leads_management;

-- Create new policies that allow authenticated employees to manage their own leads
CREATE POLICY "Employees can view own leads"
  ON leads_management
  FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Employees can insert own leads"
  ON leads_management
  FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update own leads"
  ON leads_management
  FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can delete own leads"
  ON leads_management
  FOR DELETE
  TO authenticated
  USING (employee_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE leads_management ENABLE ROW LEVEL SECURITY;