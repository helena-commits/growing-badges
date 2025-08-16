import { supabase } from "@/integrations/supabase/client";

export interface Template {
  id: string;
  name: string;
  file_url: string;
  width: number;
  height: number;
  photo_x: number;
  photo_y: number;
  photo_w: number;
  photo_h: number;
  photo_radius: number;
  name_x: number;
  name_y: number;
  name_w: number;
  name_h: number;
  role_x: number;
  role_y: number;
  role_w: number;
  role_h: number;
  name_color: string;
  role_color: string;
  name_weight: string;
  role_weight: string;
  name_max_size: number;
  role_max_size: number;
  is_official: boolean;
  created_at: string;
}

export interface Badge {
  id: string;
  full_name: string;
  role: string;
  photo_url?: string;
  template_id?: string;
  output_url?: string;
  created_at: string;
}

// Get the official template
export async function getOfficialTemplate(): Promise<Template | null> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_official', true)
    .single();

  if (error) {
    console.error('Error fetching official template:', error);
    return null;
  }

  return data;
}

// Set a template as official
export async function setOfficialTemplate(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('templates')
    .update({ is_official: true })
    .eq('id', id);

  if (error) {
    console.error('Error setting official template:', error);
    return false;
  }

  return true;
}

// List all templates
export async function listTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing templates:', error);
    return [];
  }

  return data || [];
}

// Save a new template
export async function saveTemplate(template: Omit<Template, 'id' | 'created_at'>): Promise<Template | null> {
  const { data, error } = await supabase
    .from('templates')
    .insert([template])
    .select()
    .single();

  if (error) {
    console.error('Error saving template:', error);
    return null;
  }

  return data;
}

// Update existing template
export async function updateTemplate(id: string, template: Partial<Template>): Promise<Template | null> {
  const { data, error } = await supabase
    .from('templates')
    .update(template)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating template:', error);
    return null;
  }

  return data;
}

// Delete a template
export async function deleteTemplate(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting template:', error);
    return false;
  }

  return true;
}

// Save a badge to history
export async function saveBadge(badge: Omit<Badge, 'id' | 'created_at'>): Promise<Badge | null> {
  const { data, error } = await supabase
    .from('badges')
    .insert([badge])
    .select()
    .single();

  if (error) {
    console.error('Error saving badge:', error);
    return null;
  }

  return data;
}

// Upload file to storage
export async function uploadFile(bucket: string, fileName: string, file: File): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

// Get public URL for a file
export function getPublicUrl(bucket: string, fileName: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}