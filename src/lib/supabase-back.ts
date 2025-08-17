import { supabase } from '@/integrations/supabase/client';

// Interface for back template
export interface TemplateBack {
  id: string;
  name: string;
  file_url: string;
  width: number;
  height: number;
  name_x: number;
  name_y: number;
  name_w: number;
  name_h: number;
  name_color: string;
  name_weight: string;
  name_max_size: number;
  doc_num_x: number;
  doc_num_y: number;
  doc_num_w: number;
  doc_num_h: number;
  doc_num_color: string;
  doc_num_weight: string;
  doc_num_max_size: number;
  admission_x: number;
  admission_y: number;
  admission_w: number;
  admission_h: number;
  admission_color: string;
  admission_weight: string;
  admission_max_size: number;
  is_official: boolean;
  created_at: string;
}

// Back template management functions
export async function getOfficialBackTemplate(): Promise<TemplateBack | null> {
  const { data, error } = await supabase
    .from('templates_back')
    .select('*')
    .eq('is_official', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching official back template:', error);
    return null;
  }

  return data;
}

export async function setOfficialBackTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('templates_back')
    .update({ is_official: true })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function listBackTemplates(): Promise<TemplateBack[]> {
  const { data, error } = await supabase
    .from('templates_back')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function saveBackTemplate(template: Omit<TemplateBack, 'id' | 'created_at'>): Promise<TemplateBack> {
  const { data, error } = await supabase
    .from('templates_back')
    .insert(template)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBackTemplate(id: string, template: Partial<TemplateBack>): Promise<void> {
  const { error } = await supabase
    .from('templates_back')
    .update(template)
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function deleteBackTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('templates_back')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

// Initialize default back template
export async function initializeDefaultBackTemplate(): Promise<void> {
  try {
    // Check if an official template already exists
    const existingTemplate = await getOfficialBackTemplate();
    if (existingTemplate) {
      return; // Already initialized
    }

    // Create default template
    const defaultTemplate = {
      name: 'Template Padrão do Verso',
      file_url: '/assets/badge-back-template.png',
      width: 1024,
      height: 1536,
      name_x: 264,
      name_y: 244,
      name_w: 460,
      name_h: 28,
      name_color: '#000000',
      name_weight: '600',
      name_max_size: 20,
      doc_num_x: 264,
      doc_num_y: 302,
      doc_num_w: 300,
      doc_num_h: 28,
      doc_num_color: '#000000',
      doc_num_weight: '600',
      doc_num_max_size: 20,
      admission_x: 564,
      admission_y: 302,
      admission_w: 300,
      admission_h: 28,
      admission_color: '#000000',
      admission_weight: '600',
      admission_max_size: 20,
      is_official: true
    };

    await saveBackTemplate(defaultTemplate);
    console.log('Default back template initialized');
  } catch (error) {
    console.error('Error initializing default back template:', error);
  }
}