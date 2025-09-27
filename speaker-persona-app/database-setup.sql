-- =====================================================
-- 1. TABLES
-- =====================================================

-- Speakers (Profiles) Table
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

-- Sessions Table
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

-- Agenda Items Table
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
-- 2. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_sessions_speaker_id ON public.sessions(speaker_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agenda_items_session_id ON public.agenda_items(session_id);
CREATE INDEX IF NOT EXISTS idx_agenda_items_start_time ON public.agenda_items(start_time);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

-- Policies for the 'speakers' table
DROP POLICY IF EXISTS "Users can view own speaker profile" ON public.speakers;
CREATE POLICY "Users can view own speaker profile" ON public.speakers
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own speaker profile" ON public.speakers;
CREATE POLICY "Users can update own speaker profile" ON public.speakers
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own speaker profile" ON public.speakers;
CREATE POLICY "Users can insert own speaker profile" ON public.speakers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for the 'sessions' table
DROP POLICY IF EXISTS "Speakers can view own sessions" ON public.sessions;
CREATE POLICY "Speakers can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = speaker_id);

DROP POLICY IF EXISTS "Speakers can insert own sessions" ON public.sessions;
CREATE POLICY "Speakers can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = speaker_id);

DROP POLICY IF EXISTS "Speakers can update own sessions" ON public.sessions;
CREATE POLICY "Speakers can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = speaker_id) WITH CHECK (auth.uid() = speaker_id);

-- Policies for the 'agenda_items' table
DROP POLICY IF EXISTS "Authenticated users can view agenda" ON public.agenda_items;
CREATE POLICY "Authenticated users can view agenda" ON public.agenda_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- 5. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update the 'updated_at' column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for the 'speakers' table
DROP TRIGGER IF EXISTS handle_speakers_updated_at ON public.speakers;
CREATE TRIGGER handle_speakers_updated_at
  BEFORE UPDATE ON public.speakers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for the 'sessions' table
DROP TRIGGER IF EXISTS handle_sessions_updated_at ON public.sessions;
CREATE TRIGGER handle_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for the 'agenda_items' table
DROP TRIGGER IF EXISTS handle_agenda_items_updated_at ON public.agenda_items;
CREATE TRIGGER handle_agenda_items_updated_at
  BEFORE UPDATE ON public.agenda_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();