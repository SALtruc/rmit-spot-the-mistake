import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && key)
export const supabase = isSupabaseConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

export async function ensureAnonymousUser() {
  if (!supabase) throw new Error('Supabase is not configured. Add the VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY values to .env.local.')

  const { data: { user: existingUser }, error: existingError } = await supabase.auth.getUser()
  if (!existingError && existingUser) return existingUser

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) {
    throw new Error('Could not start a temporary player session. In Supabase Dashboard, enable Anonymous Sign-Ins under Authentication > Providers.')
  }

  return data.user
}
