-- ==============================================================================
-- AMBIENT LIVING CANVAS - SUPABASE DATABASE SCHEMA & SETUP
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Stores user info, country, roles, and last login)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  country TEXT DEFAULT 'United States',
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user searches
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. USER ALBUMS TABLE (Custom personal screensaver collections)
CREATE TABLE IF NOT EXISTS public.user_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  transition TEXT DEFAULT 'crossfade',
  default_duration INT DEFAULT 10,
  soundscape TEXT DEFAULT 'none',
  particle_effect TEXT DEFAULT 'none',
  is_default_screensaver BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_albums_user_id ON public.user_albums(user_id);

-- 4. USER PHOTOS TABLE (Photos inside user albums)
CREATE TABLE IF NOT EXISTS public.user_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES public.user_albums(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  width INT DEFAULT 1920,
  height INT DEFAULT 1080,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_photos_album_id ON public.user_photos(album_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON public.user_photos(user_id);

-- 5. CATEGORIES TABLE (Curated visual categories)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "group" TEXT DEFAULT 'world',
  icon_name TEXT DEFAULT 'Sparkles',
  description TEXT,
  cover_url TEXT,
  gradient TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CATEGORY MEDIA TABLE (Images for each category, managed by Admin)
CREATE TABLE IF NOT EXISTS public.category_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  source TEXT DEFAULT 'curated',
  author TEXT,
  author_url TEXT,
  focal_point JSONB DEFAULT '{"x": 0.5, "y": 0.5}'::JSONB,
  particle_effect TEXT DEFAULT 'none',
  suggested_soundscape TEXT DEFAULT 'none',
  color_hint TEXT,
  width INT DEFAULT 3840,
  height INT DEFAULT 2160,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_category_media_category ON public.category_media(category_id);

-- 7. FEEDBACK & CONTACT TABLE (User queries, suggestions, feedback)
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  type TEXT DEFAULT 'feedback' CHECK (type IN ('query', 'feedback', 'feature_request', 'bug')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Anyone can view usernames, users can update own profile, Admins can view all
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User Albums: Users manage their own albums, Admins can view for analytics
CREATE POLICY "Users manage own albums" ON public.user_albums
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user albums" ON public.user_albums
  FOR SELECT USING (public.is_admin());

-- User Photos: Users manage own photos, Admins can view
CREATE POLICY "Users manage own photos" ON public.user_photos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user photos" ON public.user_photos
  FOR SELECT USING (public.is_admin());

-- Categories: Public read, Admin write
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- Category Media: Public read, Admin write
CREATE POLICY "Anyone can view category media" ON public.category_media
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage category media" ON public.category_media
  FOR ALL USING (public.is_admin());

-- Feedback: Anyone can insert, Admins can view and manage
CREATE POLICY "Anyone can submit feedback" ON public.feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view feedback" ON public.feedback
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update feedback" ON public.feedback
  FOR UPDATE USING (public.is_admin());

-- ==============================================================================
-- STORAGE BUCKETS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('screensaver-media', 'screensaver-media', true),
  ('user-photos', 'user-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public view screensaver media" ON storage.objects
  FOR SELECT USING (bucket_id = 'screensaver-media');

CREATE POLICY "Admins upload screensaver media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'screensaver-media' AND public.is_admin());

CREATE POLICY "Admins delete screensaver media" ON storage.objects
  FOR DELETE USING (bucket_id = 'screensaver-media' AND public.is_admin());

CREATE POLICY "Public view user photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-photos');

CREATE POLICY "Users upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-photos');

CREATE POLICY "Users delete own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-photos');

-- ==============================================================================
-- TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_username TEXT;
  user_country TEXT;
BEGIN
  extracted_username := COALESCE(
    NEW.raw_user_meta_data->>'username', 
    split_part(NEW.email, '@', 1)
  );
  
  user_country := COALESCE(
    NEW.raw_user_meta_data->>'country', 
    'United States'
  );

  INSERT INTO public.profiles (id, username, email, full_name, country, role, last_sign_in_at)
  VALUES (
    NEW.id,
    extracted_username,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', extracted_username),
    user_country,
    -- Make iamavk265 default to admin automatically!
    CASE 
      WHEN extracted_username = 'iamavk265' OR NEW.email ILIKE '%iamavk265%' THEN 'admin'
      ELSE 'user'
    END,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    last_sign_in_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
