// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const missing = []

if (!supabaseUrl) missing.push('VITE_SUPABASE_URL')
if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY')

export const supabaseConfigError = missing.length
  ? `Supabase is not configured. Missing env var(s): ${missing.join(', ')}.`
  : null

export function ensureSupabaseConfigured() {
  if (supabaseConfigError) {
    throw new Error(`${supabaseConfigError} Add them in .env for local and Netlify Environment Variables for production.`)
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(`${supabaseConfigError} API requests will fail until this is fixed.`)
}

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabaseAnonKey || 'public-anon-key',
  {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
  }
)
