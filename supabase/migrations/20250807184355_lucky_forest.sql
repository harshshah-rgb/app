/*
  # Fix Employee RLS Policies for Sign Up

  1. Security Updates
    - Add INSERT policy for employees table to allow user registration
    - Ensure users can create their own employee record during sign up
    - Maintain existing SELECT and UPDATE policies for data security

  2. Changes
    - Add policy "Users can create own employee record" for INSERT operations
    - Policy allows authenticated users to insert records where auth.uid() matches the id
*/

-- Add INSERT policy for employee registration
CREATE POLICY "Users can create own employee record"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);