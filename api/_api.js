import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

export const api = createClient(supabaseUrl, supabaseSecretKey)
