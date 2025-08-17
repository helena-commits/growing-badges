-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.ensure_single_official_template()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If setting this template as official, unset all others
  IF NEW.is_official = true THEN
    UPDATE public.templates 
    SET is_official = false 
    WHERE id != NEW.id AND is_official = true;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_single_official_back_template()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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