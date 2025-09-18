/*
  # Create Sales Tables

  1. New Tables
    - `opportunities`
      - `id` (uuid, primary key)
      - `name` (text)
      - `stage` (text)
      - `value` (numeric)
      - `created_at` (timestamp)
    - `sales_reports`
      - `id` (uuid, primary key)
      - `report_name` (text)
      - `total_sales` (numeric)
      - `report_date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stage text NOT NULL,
  value numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create sales_reports table
CREATE TABLE IF NOT EXISTS sales_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name text NOT NULL,
  total_sales numeric(12,2) NOT NULL DEFAULT 0,
  report_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for opportunities
CREATE POLICY "Authenticated users can read opportunities"
  ON opportunities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert opportunities"
  ON opportunities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update opportunities"
  ON opportunities
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete opportunities"
  ON opportunities
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for sales_reports
CREATE POLICY "Authenticated users can read sales_reports"
  ON sales_reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sales_reports"
  ON sales_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales_reports"
  ON sales_reports
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sales_reports"
  ON sales_reports
  FOR DELETE
  TO authenticated
  USING (true);