/*
  # Add employee_id column to leads_management table

  1. Schema Changes
    - Add `employee_id` column to `leads_management` table
    - Set up foreign key relationship with `employees` table
    - Add index for better query performance

  2. Security Updates
    - Update RLS policies to restrict access to employee's own leads only
    - Ensure users can only see, create, update, and delete their own leads

  3. Data Migration
    - Handle existing data gracefully
*/

-- Add employee_id column to leads_management table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads_management' AND column_name = 'employee_id'
  ) THEN
    ALTER TABLE leads_management ADD COLUMN employee_id uuid REFERENCES employees(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_management_employee_id ON leads_management(employee_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON leads_management;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON leads_management;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON leads_management;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON leads_management;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON leads_management;

-- Create new RLS policies for employee-specific access
CREATE POLICY "Users can view own leads"
  ON leads_management
  FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Users can insert own leads"
  ON leads_management
  FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Users can update own leads"
  ON leads_management
  FOR UPDATE
  TO authenticated
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Users can delete own leads"
  ON leads_management
  FOR DELETE
  TO authenticated
  USING (employee_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE leads_management ENABLE ROW LEVEL SECURITY;