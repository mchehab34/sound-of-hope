import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export type Category = 'hearing_aid' | 'surgery' | 'batteries'

export const GOALS: Record<Category, number> = {
  hearing_aid: 600,
  surgery: 23000,
  batteries: 150,
}

export type Donation = {
  id: string
  category: Category
  name: string
  amount: number
  created_at: string
}
