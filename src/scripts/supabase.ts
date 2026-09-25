/**
 * Supabase client helper (client-side only).
 * Uses the project's PUBLISHABLE key (modern replacement of the anon key) —
 * safe to ship in a browser; RLS policies protect the data.
 * When SUPABASE_URL/ANON_KEY are not configured, `supabase` is null and the
 * site uses the localStorage fallback in adminStore.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

export const supabaseConfigured: boolean = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/** Sign an admin in with email + password (used when Supabase is configured). */
export async function supabaseSignIn(email: string, password: string): Promise<string | null> {
  if (!supabase) return null;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? error.message : null;
}

/** Sign the admin out. */
export async function supabaseSignOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}

/** Whether an admin session already exists. */
export async function supabaseHasSession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

/** Upload an image to the public `product-images` bucket, returns its public URL. */
export async function uploadProductImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const cleanName = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `products/${Date.now()}_${cleanName}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}