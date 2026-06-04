import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

const configured = !!(url && key)

if (!configured) {
  console.warn(
    '[Supabase] ⚠ Missing env vars — app will load but database calls will fail.\n' +
    'Create a .env file in the project root with:\n' +
    '  VITE_SUPABASE_URL=https://xxxx.supabase.co\n' +
    '  VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx'
  )
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-key'
)

// Connection test — logs result to browser console on startup
if (configured) {
  supabase.from('master_data').select('id').limit(1).then(({ error }) => {
    if (error) {
      console.error('[Supabase] ✗ Connection failed:', error.message)
    } else {
      console.log('[Supabase] ✓ Connected successfully')
    }
  })
}
