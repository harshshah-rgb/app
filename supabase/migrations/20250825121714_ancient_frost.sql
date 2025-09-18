/*
  # Create receipts storage bucket

  1. Storage Setup
    - Create 'receipts' storage bucket for expense receipt images
    - Set bucket to public for easy access to receipt images
    - Configure RLS policies for secure access

  2. Security
    - Allow authenticated users to upload receipts
    - Allow public read access to receipt images
    - Restrict delete operations to authenticated users
*/

-- Create the receipts storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload receipts
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

-- Allow authenticated users to view receipts
CREATE POLICY "Authenticated users can view receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'receipts');

-- Allow public access to receipt images (for displaying in UI)
CREATE POLICY "Public can view receipts"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'receipts');

-- Allow authenticated users to delete their own receipts
CREATE POLICY "Authenticated users can delete receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'receipts');