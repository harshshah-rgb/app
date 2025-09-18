/*
  # Fix RLS policies for leads_management table

  1. Security Updates
    - Drop existing restrictive policies
    - Create permissive policies for all CRUD operations
    - Allow authenticated users to manage all leads data

  2. Policy Changes
    - SELECT: Allow authenticated users to read all leads
    - INSERT: Allow authenticated users to create new leads
    - UPDATE: Allow authenticated users to update all leads
    - DELETE: Allow authenticated users to delete all leads
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Employees can view own leads" ON leads_management;
DROP POLICY IF EXISTS "Employees can insert own leads" ON leads_management;
DROP POLICY IF EXISTS "Employees can update own leads" ON leads_management;
DROP POLICY IF EXISTS "Employees can delete own leads" ON leads_management;

-- Create new permissive policies for all authenticated users
CREATE POLICY "Authenticated users can view all leads"
  ON leads_management
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert leads"
  ON leads_management
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update all leads"
  ON leads_management
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all leads"
  ON leads_management
  FOR DELETE
  TO authenticated
  USING (true);