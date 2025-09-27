# Database Schema for Speaker Persona App

This document outlines the Supabase database schema required for the Speaker Persona App.

## Tables

### 1. speakers
This table stores additional speaker information beyond what's in Supabase Auth.

```sql
create table speakers (
  id uuid references auth.users(id) primary key,
  full_name text not null,
  mobile_number text not null,
  track text,
  session_category text,
  tshirt_size text not null,
  food_choice text not null check (food_choice in ('veg', 'non-veg')),
  linkedin_url text,
  twitter_url text,
  company_name text,
  job_title text,
  bio text,
  emergency_contact_name text,
  emergency_contact_number text,
  special_requirements text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 2. sessions
This table stores session submissions and details.

```sql
create table sessions (
  id uuid default gen_random_uuid() primary key,
  speaker_id uuid references speakers(id) not null,
  title text not null,
  abstract text not null,
  category text not null,
  track text not null,
  duration integer not null default 30, -- in minutes
  level text not null default 'intermediate' check (level in ('beginner', 'intermediate', 'advanced', 'expert')),
  co_speaker_name text,
  co_speaker_email text,
  co_speaker_bio text,
  requirements text,
  target_audience text,
  learning_outcomes text,
  previous_experience text,
  additional_notes text,
  status text not null default 'submitted' check (status in ('submitted', 'approved', 'rejected', 'on_hold')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 3. agenda_items (Optional - for advanced agenda management)
This table can be used by event managers to build the agenda.

```sql
create table agenda_items (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id),
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  duration integer not null, -- in minutes
  location text,
  track text,
  type text not null check (type in ('session', 'keynote', 'break', 'general')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Row Level Security (RLS) Policies

Enable RLS on all tables:

```sql
alter table speakers enable row level security;
alter table sessions enable row level security;
alter table agenda_items enable row level security;
```

### Speakers table policies:

```sql
-- Users can only see and edit their own speaker profile
create policy "Users can view own speaker profile" on speakers
  for select using (auth.uid() = id);

create policy "Users can update own speaker profile" on speakers
  for update using (auth.uid() = id);

create policy "Users can insert own speaker profile" on speakers
  for insert with check (auth.uid() = id);
```

### Sessions table policies:

```sql
-- Speakers can only see and edit their own sessions
create policy "Speakers can view own sessions" on sessions
  for select using (auth.uid() = speaker_id);

create policy "Speakers can insert own sessions" on sessions
  for insert with check (auth.uid() = speaker_id);

create policy "Speakers can update own sessions" on sessions
  for update using (auth.uid() = speaker_id);

-- Event managers can see all sessions (add this later when implementing manager features)
-- create policy "Event managers can view all sessions" on sessions
--   for select using (auth.jwt() ->> 'role' = 'event_manager');
```

### Agenda items policies:

```sql
-- All authenticated users can view agenda items
create policy "Authenticated users can view agenda" on agenda_items
  for select using (auth.role() = 'authenticated');

-- Only event managers can manage agenda items (implement later)
-- create policy "Event managers can manage agenda" on agenda_items
--   for all using (auth.jwt() ->> 'role' = 'event_manager');
```

## Setup Instructions

1. **Create a Supabase project** at https://supabase.com
2. **Run the SQL commands** above in the Supabase SQL editor
3. **Set up authentication** in the Supabase dashboard
4. **Configure your environment variables**:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

## Notes

- The `speakers` table references the built-in `auth.users` table from Supabase Auth
- User registration creates an entry in both `auth.users` and `speakers` tables
- Session status workflow: `submitted` → `approved`/`rejected`/`on_hold`
- The agenda system can be extended to support drag-and-drop functionality for managers
- Consider adding indexes on frequently queried columns like `speaker_id`, `status`, etc.
