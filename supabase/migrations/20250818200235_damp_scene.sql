/*
  # Fix Leads Management RLS and Policies

  1. Security Updates
    - Drop existing restrictive policies
    - Create permissive policies for authenticated users
    - Ensure all CRUD operations work properly

  2. Policy Changes
    - Allow authenticated users to perform all operations
    - Remove user-specific restrictions that may block operations
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can manage leads" ON leads_management;
DROP POLICY IF EXISTS "Users can read leads" ON leads_management;
DROP POLICY IF EXISTS "Users can insert leads" ON leads_management;
DROP POLICY IF EXISTS "Users can update leads" ON leads_management;
DROP POLICY IF EXISTS "Users can delete leads" ON leads_management;

-- Ensure RLS is enabled
ALTER TABLE leads_management ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for authenticated users
CREATE POLICY "Enable all operations for authenticated users"
  ON leads_management
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create separate policies for better debugging (optional, more granular)
CREATE POLICY "Enable read for authenticated users"
  ON leads_management
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON leads_management
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON leads_management
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON leads_management
  FOR DELETE
  TO authenticated
  USING (true);