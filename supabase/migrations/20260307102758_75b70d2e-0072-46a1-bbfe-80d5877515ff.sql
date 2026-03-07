
-- Create storage bucket for analysis images
INSERT INTO storage.buckets (id, name, public) VALUES ('analysis-images', 'analysis-images', true);

-- Allow authenticated users to upload to analysis-images bucket
CREATE POLICY "Authenticated users can upload analysis images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'analysis-images');

-- Allow authenticated users to view analysis images
CREATE POLICY "Anyone can view analysis images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'analysis-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own analysis images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'analysis-images');
