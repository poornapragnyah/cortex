# 🚀 Quick Setup Guide: Session Submissions

## The Problem
You're getting the error "Could not find the table 'public.sessions'" because the database tables haven't been created yet in your Supabase project.

## ✅ **Step 1: Create Database Tables**

1. **Open your Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `nmfewmlalanmhgmpgryq`

2. **Navigate to SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the Database Setup**
   - Copy the entire contents of `database-setup.sql` file
   - Paste it into the SQL editor
   - Click **Run** (or press Ctrl/Cmd + Enter)

4. **Verify Tables Created**
   - Go to **Table Editor** in the left sidebar
   - You should see these tables:
     - ✅ `speakers`
     - ✅ `sessions`
     - ✅ `agenda_items`

## ✅ **Step 2: Test Session Submission**

1. **Start the Development Server**
   ```bash
   cd speaker-persona-app
   npm run dev
   ```
   - Server running at: http://localhost:5173/

2. **Register or Login**
   - Go to http://localhost:5173/
   - Register a new account or login with existing credentials

3. **Submit a Test Session**
   - Click **"Submit New Session"** button
   - Fill out the form with test data:
     ```
     Title: "Test Session"
     Abstract: "This is a test session submission"
     Category: "Talk"
     Track: "Technology"
     Duration: "30 minutes"
     Level: "Intermediate"
     ```
   - Click **"Submit Session"**

4. **Verify Success**
   - You should see: "Session submitted successfully!"
   - You'll be redirected to the dashboard
   - The session should appear in "My Sessions"

## ✅ **Step 3: Verify Database Data**

1. **Check in Supabase Dashboard**
   - Go to **Table Editor** > **sessions**
   - You should see your test session data
   - All fields should be populated correctly

2. **Test Session Status**
   - The session should have `status = 'submitted'`
   - The `speaker_id` should match your user ID
   - Timestamps should be automatically set

## 🐛 **Troubleshooting Common Issues**

### Issue 1: "Table doesn't exist"
- **Solution**: Run the `database-setup.sql` script in Supabase SQL Editor

### Issue 2: "Row Level Security Policy violation"
- **Solution**: The SQL script includes RLS policies, make sure they were created

### Issue 3: "Insert permission denied"
- **Solution**: Verify you're logged in and the user ID matches

### Issue 4: "Foreign key constraint violation"
- **Solution**: Make sure you're authenticated (user exists in auth.users)

## 📝 **What the Database Schema Includes**

### Sessions Table Structure:
```sql
sessions (
  id              UUID (auto-generated)
  speaker_id      UUID (links to auth.users)
  title           TEXT (required)
  abstract        TEXT (required)
  category        TEXT (Master Class, Demo Pod, Talk)
  track           TEXT (Technology, Design, Business, etc.)
  duration        INTEGER (in minutes)
  level           TEXT (beginner, intermediate, advanced, expert)
  co_speaker_*    TEXT (optional co-speaker fields)
  requirements    TEXT (technical requirements)
  target_audience TEXT (who should attend)
  learning_outcomes TEXT (what attendees will learn)
  status          TEXT (submitted, approved, rejected, on_hold)
  created_at      TIMESTAMP (auto)
  updated_at      TIMESTAMP (auto)
)
```

### Security Features:
- ✅ **Row Level Security (RLS)** enabled
- ✅ **Users can only see their own sessions**
- ✅ **Automatic timestamp updates**
- ✅ **Data validation constraints**

## 🎯 **Testing Checklist**

After setup, verify these work:

- [ ] Register new user account
- [ ] Login with credentials  
- [ ] Navigate to "Submit New Session"
- [ ] Fill out and submit session form
- [ ] See success message
- [ ] Session appears on dashboard
- [ ] Session data in Supabase table
- [ ] Edit existing session
- [ ] Session status badges work

## 🚀 **Next Steps After Setup**

1. **Test the full flow** with real data
2. **Customize tracks and categories** in `src/lib/supabase.js`
3. **Add more session fields** if needed
4. **Test session editing** functionality
5. **Implement email verification** (already coded, needs Supabase config)

## 💡 **Pro Tips**

- **Use the SQL Editor** for quick data inspection
- **Check the Logs** in Supabase for detailed error messages
- **Test with multiple users** to verify RLS policies
- **Customize email templates** in Auth settings
- **Set up proper redirect URLs** for email verification

---

**Ready to test? Run the SQL script and start submitting sessions! 🎉**
