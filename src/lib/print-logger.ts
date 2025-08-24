import { supabase } from '@/integrations/supabase/client';

export async function logBadgePrint(params: {
  fullName: string;
  roleTitle: string;
  action: 'download' | 'print';
  photoUrl?: string | null;
  photoOrigin?: 'supabase' | 'local' | 'unknown';
}) {
  try {
    await supabase.from('badges_printed').insert({
      full_name: params.fullName,
      role_title: params.roleTitle,
      action: params.action,
      photo_url: params.photoUrl ?? null,
      photo_origin: params.photoOrigin ?? 'unknown',
    });
  } catch (err) {
    // não bloquear fluxo; apenas logar no console
    console.warn('logBadgePrint failed', err);
  }
}