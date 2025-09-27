-- Speaker Persona App Database Schema
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- =====================================================
-- 1. SPEAKERS TABLE
-- =====================================================
-- This table stores additional speaker information beyond Supabase Auth
CREATE TABLE IF NOT EXISTS public.speakers (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  track TEXT,
  session_category TEXT,
  tshirt_size TEXT NOT NULL CHECK (tshirt_size IN ('S', 'M', 'L', 'XL', 'XXL')),
  food_choice TEXT NOT NULL CHECK (food_choice IN ('veg', 'non-veg')),
  linkedin_url TEXT,
  twitter_url TEXT,
  company_name TEXT,
  job_title TEXT,
  bio TEXT,
  emergency_contact_name TEXT,
  emergency_contact_number TEXT,
  special_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- 2. SESSIONS TABLE
-- =====================================================
-- This table stores session submissions and details
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  speaker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Master Class', 'Demo Pod', 'Talk')),
  track TEXT NOT NULL CHECK (track IN ('Technology', 'Design', 'Business', 'Startup', 'AI/ML', 'Blockchain')),
  duration INTEGER NOT NULL DEFAULT 30 CHECK (duration > 0), -- in minutes
  level TEXT NOT NULL DEFAULT 'intermediate' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  co_speaker_name TEXT,
  co_speaker_email TEXT,
  co_speaker_bio TEXT,
  requirements TEXT,
  target_audience TEXT,
  learning_outcomes TEXT,
  previous_experience TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'on_hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- 3. AGENDA ITEMS TABLE (Optional - for event management)
-- =====================================================
-- This table can be used by event managers to build the agenda
CREATE TABLE IF NOT EXISTS public.agenda_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
  location TEXT,
  track TEXT,
  type TEXT NOT NULL CHECK (type IN ('session', 'keynote', 'break', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_speaker_id ON public.sessions(speaker_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agenda_items_session_id ON public.agenda_items(session_id);
CREATE INDEX IF NOT EXISTS idx_agenda_items_start_time ON public.agenda_items(start_time);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. SPEAKERS TABLE POLICIES
-- =====================================================
-- Users can only see and edit their own speaker profile
CREATE POLICY IF NOT EXISTS "Users can view own speaker profile" ON public.speakers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own speaker profile" ON public.speakers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own speaker profile" ON public.speakers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Event managers can view all speaker profiles (for later implementation)
-- CREATE POLICY IF NOT EXISTS "Event managers can view all speakers" ON public.speakers
--   FOR SELECT USING (auth.jwt() ->> 'role' = 'event_manager');

-- =====================================================
-- 7. SESSIONS TABLE POLICIES
-- =====================================================
-- Speakers can only see and edit their own sessions
CREATE POLICY IF NOT EXISTS "Speakers can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = speaker_id);

CREATE POLICY IF NOT EXISTS "Speakers can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = speaker_id);

CREATE POLICY IF NOT EXISTS "Speakers can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = speaker_id);

-- Event managers can see all sessions (for later implementation)
-- CREATE POLICY IF NOT EXISTS "Event managers can view all sessions" ON public.sessions
--   FOR SELECT USING (auth.jwt() ->> 'role' = 'event_manager');

-- CREATE POLICY IF NOT EXISTS "Event managers can update session status" ON public.sessions
--   FOR UPDATE USING (auth.jwt() ->> 'role' = 'event_manager');

-- =====================================================
-- 8. AGENDA ITEMS TABLE POLICIES
-- =====================================================
-- All authenticated users can view agenda items
CREATE POLICY IF NOT EXISTS "Authenticated users can view agenda" ON public.agenda_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only event managers can manage agenda items (for later implementation)
-- CREATE POLICY IF NOT EXISTS "Event managers can manage agenda" ON public.agenda_items
--   FOR ALL USING (auth.jwt() ->> 'role' = 'event_manager');

-- =====================================================
-- 9. FUNCTIONS FOR UPDATED_AT TRIGGERS
-- =====================================================
-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================
-- Create triggers to automatically update updated_at
CREATE TRIGGER IF NOT EXISTS handle_speakers_updated_at
  BEFORE UPDATE ON public.speakers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER IF NOT EXISTS handle_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER IF NOT EXISTS handle_agenda_items_updated_at
  BEFORE UPDATE ON public.agenda_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 11. SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment below to insert sample data for testing

-- INSERT INTO public.sessions (speaker_id, title, abstract, category, track, duration, level) VALUES
-- ('your-user-id-here', 'Introduction to React Hooks', 'A comprehensive guide to using React Hooks effectively in modern applications.', 'Talk', 'Technology', 45, 'intermediate'),
-- ('your-user-id-here', 'Building Scalable Design Systems', 'Learn how to create and maintain design systems that scale with your organization.', 'Master Class', 'Design', 90, 'advanced');

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your database is now ready for the Speaker Persona App
-- 
-- Next steps:
-- 1. Test session submission from your app
-- 2. Verify data is being stored correctly
-- 3. Test the session listing on dashboard
-- 4. Implement email verification if needed
