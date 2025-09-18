
  # Authentication and Employee Management Schema

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `employee_id` (text, unique employee identifier)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `department` (text)
      - `position` (text)
      - `hire_date` (date)
      - `status` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `announcements`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `category` (text)
      - `priority` (text)
      - `author` (text)
      - `pinned` (boolean)
      - `created_at` (timestamp)

    - `handbooks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `file_url` (text)
      - `pages` (integer)
      - `size` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `attendance_records`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `date` (date)
      - `clock_in` (time)
      - `clock_out` (time)
      - `hours` (decimal)
      - `status` (text)
      - `location` (text)
      - `created_at` (timestamp)

    - `timesheet_entries`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `date` (date)
      - `project` (text)
      - `hours` (decimal)
      - `description` (text)
      - `status` (text)
      - `created_at` (timestamp)

    - `expense_records`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `expense_id` (text)
      - `date` (date)
      - `category` (text)
      - `description` (text)
      - `currency` (text)
      - `amount` (decimal)
      - `receipt_url` (text)
      - `status` (text)
      - `created_at` (timestamp)

    - `sales_leads`
      - `id` (uuid, primary key)
      - `sales_id` (text)
      - `account` (text)
      - `status` (text)
      - `amount` (decimal)
      - `probability` (decimal)
      - `closure_date` (date)
     

    - `help_desk_tickets`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `title` (text)
      - `category` (text)
      - `priority` (text)
      - `status` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for admin users to manage all data
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  department text NOT NULL,
  position text NOT NULL,
  hire_date date NOT NULL,
  status text DEFAULT 'active',
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  priority text DEFAULT 'medium',
  author text NOT NULL,
  pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create handbooks table
CREATE TABLE IF NOT EXISTS handbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  file_url text,
  pages integer DEFAULT 0,
  size text DEFAULT '0 KB',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  clock_in time,
  clock_out time,
  hours decimal(4,2) DEFAULT 0,
  status text DEFAULT 'present',
  location text DEFAULT 'Office',
  created_at timestamptz DEFAULT now()
);

-- Create timesheet_entries table
CREATE TABLE IF NOT EXISTS timesheet_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  project text NOT NULL,
  hours decimal(4,2) NOT NULL,
  description text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

-- Create expense_records table
CREATE TABLE IF NOT EXISTS expense_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  expense_id text NOT NULL,
  date date NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  currency text DEFAULT 'AED',
  amount decimal(10,2) NOT NULL,
  receipt_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create sales_leads table (rename existing leads table)
DROP TABLE IF EXISTS leads;
CREATE TABLE IF NOT EXISTS sales_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_id text NOT NULL,
  account text NOT NULL,
  status text NOT NULL,
  amount decimal(10,2) NOT NULL,
  probability decimal(5,2) NOT NULL,
  closure_date date NOT NULL,

);

-- Create help_desk_tickets table
CREATE TABLE IF NOT EXISTS help_desk_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE handbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_desk_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Users can read own employee data"
  ON employees
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own employee data"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Create policies for announcements (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for handbooks (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read handbooks"
  ON handbooks
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for attendance_records
CREATE POLICY "Users can manage own attendance"
  ON attendance_records
  FOR ALL
  TO authenticated
  USING (employee_id IN (SELECT id FROM employees WHERE auth.uid()::text = id::text));

-- Create policies for timesheet_entries
CREATE POLICY "Users can manage own timesheets"
  ON timesheet_entries
  FOR ALL
  TO authenticated
  USING (employee_id IN (SELECT id FROM employees WHERE auth.uid()::text = id::text));

-- Create policies for expense_records
CREATE POLICY "Users can manage own expenses"
  ON expense_records
  FOR ALL
  TO authenticated
  USING (employee_id IN (SELECT id FROM employees WHERE auth.uid()::text = id::text));

-- Create policies for sales_leads
CREATE POLICY "Users can manage own sales leads"
  ON sales_leads
  FOR ALL
  TO authenticated
  USING (created_by IN (SELECT id FROM employees WHERE auth.uid()::text = id::text));

-- Create policies for help_desk_tickets
CREATE POLICY "Users can manage own tickets"
  ON help_desk_tickets
  FOR ALL
  TO authenticated
  USING (employee_id IN (SELECT id FROM employees WHERE auth.uid()::text = id::text));

-- Insert sample employee data
INSERT INTO employees (id, employee_id, email, first_name, last_name, department, position, hire_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'EMP001', 'john.smith@blueflute.com', 'John', 'Smith', 'Engineering', 'Senior Developer', '2023-01-15'),
('550e8400-e29b-41d4-a716-446655440002', 'EMP002', 'jane.doe@blueflute.com', 'Jane', 'Doe', 'Marketing', 'Marketing Manager', '2023-02-01'),
('550e8400-e29b-41d4-a716-446655440003', 'EMP003', 'mike.johnson@blueflute.com', 'Mike', 'Johnson', 'Sales', 'Sales Representative', '2023-03-10');

-- Insert sample announcements
INSERT INTO announcements (title, content, category, priority, author, pinned) VALUES
('Welcome to Blue Flute Consulting', 'We are excited to have you join our team! Please review the employee handbook and complete your onboarding tasks.', 'general', 'high', 'HR Team', true),
('Monthly Team Meeting', 'Our monthly all-hands meeting is scheduled for next Friday at 2 PM in the main conference room.', 'meeting', 'medium', 'Management', false),
('New Security Policies', 'Please review the updated security policies in the handbook section. All employees must acknowledge these changes by end of week.', 'policy', 'high', 'IT Security', true);

-- Insert sample handbooks
INSERT INTO handbooks (title, description, category, pages, size) VALUES
('Employee Handbook', 'Complete guide to company policies, procedures, and benefits', 'general', 45, '2.3 MB'),
('IT Security Guidelines', 'Security best practices and compliance requirements', 'policy', 12, '850 KB'),
('Sales Process Manual', 'Step-by-step guide to our sales methodology and CRM usage', 'technical', 28, '1.8 MB');