/*
  # Create leads_management table

  1. New Tables
    - `leads_management`
      - `sales_id` (text, primary key) - Unique identifier for each lead
      - `status` (text) - Status of the lead (e.g., New, Upsell)
      - `account` (text) - Customer or company name associated with the lead
      - `amount` (numeric) - Estimated deal value
      - `probability` (text) - Percentage likelihood of closing the deal
      - `closure_date` (date) - Expected deal closure date

  2. Security
    - Enable RLS on `leads_management` table
    - Add policy for authenticated users to manage leads
*/

CREATE TABLE IF NOT EXISTS leads_management (
  sales_id text PRIMARY KEY,
  status text NOT NULL,
  account text,
  amount numeric(12,2),
  probability text,
  closure_date date
);

ALTER TABLE leads_management ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage leads"
  ON leads_management
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);