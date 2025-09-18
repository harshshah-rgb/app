/*
  # Add Row Level Security (RLS) policies for sales data

  1. Security Policies
    - Enable RLS on leads_management and sales_opportunities tables
    - Add policies to ensure users can only access their own data
    - Prevent unauthorized access to other employees' sales data

  2. Tables Affected
    - `leads_management` - Users can only see/modify their own leads
    - `sales_opportunities` - Users can only see/modify their own opportunities

  3. Policy Details
    - SELECT: Users can only read their own records
    - INSERT: Users can only create records assigned to themselves
    - UPDATE: Users can only update their own records
    - DELETE: Users can only delete their own records
*/

-- Enable RLS on leads_management table (if not already enabled)
ALTER TABLE leads_management ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own leads" ON leads_management;
DROP POLICY IF EXISTS "Users can insert own leads" ON leads_management;
DROP POLICY IF EXISTS "Users can update own leads" ON leads_management;
DROP POLICY IF EXISTS "Users can delete own leads" ON leads_management;

-- Create comprehensive RLS policies for leads_management
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

-- Enable RLS on sales_opportunities table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sales_opportunities') THEN
    ALTER TABLE sales_opportunities ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own opportunities" ON sales_opportunities;
    DROP POLICY IF EXISTS "Users can insert own opportunities" ON sales_opportunities;
    DROP POLICY IF EXISTS "Users can update own opportunities" ON sales_opportunities;
    DROP POLICY IF EXISTS "Users can delete own opportunities" ON sales_opportunities;
    
    -- Create RLS policies for sales_opportunities
    CREATE POLICY "Users can view own opportunities"
      ON sales_opportunities
      FOR SELECT
      TO authenticated
      USING (created_by = auth.uid());

    CREATE POLICY "Users can insert own opportunities"
      ON sales_opportunities
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());

    CREATE POLICY "Users can update own opportunities"
      ON sales_opportunities
      FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());

    CREATE POLICY "Users can delete own opportunities"
      ON sales_opportunities
      FOR DELETE
      TO authenticated
      USING (created_by = auth.uid());
  END IF;
END $$;