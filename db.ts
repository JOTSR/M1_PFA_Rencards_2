import { createClient } from './deps.ts'

const SUPABASE_URL = String(Deno.env.get('SUPABASE_URL') ?? '')
const SUPABASE_KEY = String(Deno.env.get('SUPABASE_KEY') ?? '')

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export type ContactForm = {
    id: number
    first_name: string
    name: string
    email: string
    message: string
}

export type ConnectionLogs = {
    ip: string
    first_at: string
    last_at: string
}