-- Create templates_back table for back side templates
CREATE TABLE public.templates_back (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 1024,
  height INTEGER NOT NULL DEFAULT 1536,
  name_x INTEGER NOT NULL,
  name_y INTEGER NOT NULL,
  name_w INTEGER NOT NULL,
  name_h INTEGER NOT NULL,
  name_color TEXT NOT NULL DEFAULT '#111111',
  name_weight TEXT NOT NULL DEFAULT '700',
  name_max_size INTEGER NOT NULL DEFAULT 40,
  is_official BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.templates_back ENABLE ROW LEVEL SECURITY;

-- Create policies for templates_back
CREATE POLICY "Templates back are publicly readable" 
ON public.templates_back 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert templates back" 
ON public.templates_back 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update templates back" 
ON public.templates_back 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete templates back" 
ON public.templates_back 
FOR DELETE 
USING (true);

-- Create storage bucket for back templates
INSERT INTO storage.buckets (id, name, public) VALUES ('templates_back', 'templates_back', true);

-- Create storage policies for templates_back bucket
CREATE POLICY "Back template images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'templates_back');

CREATE POLICY "Anyone can upload back template images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'templates_back');

CREATE POLICY "Anyone can update back template images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'templates_back');

CREATE POLICY "Anyone can delete back template images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'templates_back');

-- Add back_output_url to badges table
ALTER TABLE public.badges ADD COLUMN back_output_url TEXT;

-- Create function to ensure single official back template
CREATE OR REPLACE FUNCTION public.ensure_single_official_back_template()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If setting this template as official, unset all others
  IF NEW.is_official = true THEN
    UPDATE public.templates_back 
    SET is_official = false 
    WHERE id != NEW.id AND is_official = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for single official back template
CREATE TRIGGER trigger_ensure_single_official_back_template
  BEFORE INSERT OR UPDATE ON public.templates_back
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_official_back_template();