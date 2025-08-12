import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Profile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  author_id: string
  content: string
  type: 'query' | 'poll'
  poll_question?: string
  likes_count: number
  replies_count: number
  created_at: string
  updated_at: string
  profiles?: Profile
  poll_options?: PollOption[]
  user_vote?: PollVote
  user_liked?: boolean
}

export interface PollOption {
  id: string
  post_id: string
  option_text: string
  votes_count: number
  created_at: string
}

export interface PollVote {
  id: string
  post_id: string
  option_id: string
  user_id: string
  created_at: string
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface AnonymousSubmission {
  id: string
  category: string
  content: string
  urgency: 'low' | 'medium' | 'high'
  status: 'new' | 'reviewed' | 'resolved'
  created_at: string
  updated_at: string
}