-- Create templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 1024,
  height INTEGER NOT NULL DEFAULT 1536,
  photo_x INTEGER NOT NULL,
  photo_y INTEGER NOT NULL,
  photo_w INTEGER NOT NULL,
  photo_h INTEGER NOT NULL,
  photo_radius INTEGER NOT NULL,
  name_x INTEGER NOT NULL,
  name_y INTEGER NOT NULL,
  name_w INTEGER NOT NULL,
  name_h INTEGER NOT NULL,
  role_x INTEGER NOT NULL,
  role_y INTEGER NOT NULL,
  role_w INTEGER NOT NULL,
  role_h INTEGER NOT NULL,
  name_color TEXT NOT NULL DEFAULT '#111111',
  role_color TEXT NOT NULL DEFAULT '#111111',
  name_weight TEXT NOT NULL DEFAULT '700',
  role_weight TEXT NOT NULL DEFAULT '700',
  name_max_size INTEGER NOT NULL DEFAULT 64,
  role_max_size INTEGER NOT NULL DEFAULT 72,
  is_official BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table for history
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  template_id UUID REFERENCES public.templates(id),
  output_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for templates (public read, admin write)
CREATE POLICY "Templates are publicly readable" 
ON public.templates 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert templates" 
ON public.templates 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update templates" 
ON public.templates 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete templates" 
ON public.templates 
FOR DELETE 
USING (true);

-- RLS policies for badges (public read, anyone write)
CREATE POLICY "Badges are publicly readable" 
ON public.badges 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert badges" 
ON public.badges 
FOR INSERT 
WITH CHECK (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('templates', 'templates', true),
  ('photos', 'photos', true),
  ('badges', 'badges', true);

-- Storage policies for templates bucket
CREATE POLICY "Template files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'templates');

CREATE POLICY "Anyone can upload template files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'templates');

CREATE POLICY "Anyone can update template files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'templates');

CREATE POLICY "Anyone can delete template files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'templates');

-- Storage policies for photos bucket
CREATE POLICY "Photo files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

CREATE POLICY "Anyone can upload photo files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos');

-- Storage policies for badges bucket
CREATE POLICY "Badge files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'badges');

CREATE POLICY "Anyone can upload badge files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'badges');

-- Function to ensure only one official template
CREATE OR REPLACE FUNCTION public.ensure_single_official_template()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this template as official, unset all others
  IF NEW.is_official = true THEN
    UPDATE public.templates 
    SET is_official = false 
    WHERE id != NEW.id AND is_official = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one official template
CREATE TRIGGER ensure_single_official_template_trigger
  BEFORE INSERT OR UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_official_template();

-- Insert default template seed
INSERT INTO public.templates (
  name,
  file_url,
  width,
  height,
  photo_x,
  photo_y,
  photo_w,
  photo_h,
  photo_radius,
  name_x,
  name_y,
  name_w,
  name_h,
  role_x,
  role_y,
  role_w,
  role_h,
  name_color,
  role_color,
  name_weight,
  role_weight,
  name_max_size,
  role_max_size,
  is_official
) VALUES (
  'Template Padrão',
  'default-template',
  1024,
  1536,
  341,
  441,
  341,
  436,
  28,
  169,
  954,
  688,
  65,
  169,
  1137,
  688,
  82,
  '#111111',
  '#111111',
  '700',
  '700',
  64,
  72,
  true
);