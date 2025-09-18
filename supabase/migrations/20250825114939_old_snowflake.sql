/*
  # Create expenses table with auto-incrementing expense_id

  1. New Tables
    - `expenses`
      - `expense_id` (text, primary key) - Auto-generated in format BFC2001, BFC2002, etc.
      - `date` (date) - Expense date
      - `category` (text) - Expense category
      - `description` (text) - Expense description
      - `currency` (text) - Currency code (USD, INR, OMR, etc.)
      - `amount` (numeric) - Original amount
      - `amount_aed` (numeric) - Converted amount in AED
      - `receipt` (text) - Receipt URL or file reference

  2. Security
    - Enable RLS on `expenses` table
    - Add policies for authenticated users to manage expenses

  3. Auto-increment Function
    - Custom function to generate expense_id in BFC format
    - Trigger to automatically set expense_id on insert
*/

-- Create sequence for expense numbering
CREATE SEQUENCE IF NOT EXISTS expense_sequence START 2001;

-- Function to generate expense_id
CREATE OR REPLACE FUNCTION generate_expense_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BFC' || nextval('expense_sequence')::text;
END;
$$ LANGUAGE plpgsql;

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  expense_id text PRIMARY KEY DEFAULT generate_expense_id(),
  date date NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  currency text NOT NULL DEFAULT 'AED',
  amount numeric(12,2) NOT NULL,
  amount_aed numeric(12,2) NOT NULL DEFAULT 0,
  receipt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can manage expenses"
  ON expenses
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();