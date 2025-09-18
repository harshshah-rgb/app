/*
  # Restore leads_management table

  1. New Tables
    - `leads_management`
      - `id` (uuid, primary key)
      - `lead_id` (text, unique)
      - `company_name` (text)
      - `contact_person` (text)
      - `email` (text)
      - `phone` (text)
      - `status` (text, default 'new')
      - `source` (text)
      - `value` (numeric)
      - `probability` (numeric, 0-100)
      - `expected_close_date` (date)
      - `notes` (text)
      - `created_at` (timestamp, default now())
      - `updated_at` (timestamp, default now())

  2. Security
    - Enable RLS on `leads_management` table
    - Add policies for authenticated users to manage leads

  3. Changes
    - Drop sales_analytics table if it exists
    - Create leads_management with original structure
    - Add proper indexing and constraints
*/

-- Drop sales_analytics table if it exists
DROP TABLE IF EXISTS sales_analytics;

-- Create leads_management table with original structure
CREATE TABLE IF NOT EXISTS leads_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text UNIQUE NOT NULL,
  status text DEFAULT 'new' NOT NULL,
  account text UNIQUE NOT NULL,
  amount numeric(12,2) DEFAULT 0 NOT NULL,
  probability numeric(5,2) DEFAULT 0 NOT NULL,
  closure_date date,
);

-- Enable RLS
ALTER TABLE leads_management ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read leads"
  ON leads_management
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert leads"
  ON leads_management
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
  ON leads_management
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete leads"
  ON leads_management
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_management_status ON leads_management(status);
CREATE INDEX IF NOT EXISTS idx_leads_management_source ON leads_management(source);
CREATE INDEX IF NOT EXISTS idx_leads_management_created_at ON leads_management(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_management_updated_at
    BEFORE UPDATE ON leads_management
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();