import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nmfewmlalanmhgmpgryq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZmV3bWxhbGFubWhnbXBncnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTI0MzUsImV4cCI6MjA3NDUyODQzNX0.mfuY_fdhHDLmnrfaJu0G0k3lle5jMeBEJnOo4_PlBzU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  SPEAKERS: 'speakers',
  SESSIONS: 'sessions',
  AGENDA_ITEMS: 'agenda_items'
}

// Session status enum
export const SESSION_STATUS = {
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ON_HOLD: 'on_hold'
}

// User roles
export const USER_ROLES = {
  SPEAKER: 'speaker',
  EVENT_MANAGER: 'event_manager'
}

// Session categories
export const SESSION_CATEGORIES = {
  MASTER_CLASS: 'Master Class',
  DEMO_POD: 'Demo Pod',
  TALK: 'Talk'
}

// Tracks (these can be customized based on event)
export const TRACKS = {
  TECHNOLOGY: 'Technology',
  DESIGN: 'Design',
  BUSINESS: 'Business',
  STARTUP: 'Startup',
  AI_ML: 'AI/ML',
  BLOCKCHAIN: 'Blockchain'
}
