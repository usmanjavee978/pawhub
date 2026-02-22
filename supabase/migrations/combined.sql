-- ─────────────────────────────────────────────────────────────────
-- PawHub Initial Schema Migration
-- Run via: npx supabase db push
-- ─────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────
CREATE TYPE pet_species AS ENUM ('dog','cat','bird','fish','rabbit','hamster','reptile','other');
CREATE TYPE pet_gender  AS ENUM ('male','female','unknown');
CREATE TYPE pet_size    AS ENUM ('tiny','small','medium','large','giant');
CREATE TYPE meal_type   AS ENUM ('breakfast','lunch','dinner','snack','treat','supplement');
CREATE TYPE vaccine_status AS ENUM ('scheduled','administered','overdue','skipped');
CREATE TYPE blog_category  AS ENUM ('nutrition','health','training','grooming','recipes','lifestyle','adoption','behavior','gear','other');

-- ─── Profiles ─────────────────────────────────────────────────────
-- Extends Supabase auth.users — created automatically via trigger
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  avatar_url    TEXT,
  bio           TEXT DEFAULT '',
  website       TEXT DEFAULT '',
  location      TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]+$')
);

-- ─── Pets ─────────────────────────────────────────────────────────
CREATE TABLE public.pets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  species       pet_species NOT NULL DEFAULT 'dog',
  breed         TEXT NOT NULL DEFAULT 'Mixed',
  date_of_birth DATE,
  gender        pet_gender NOT NULL DEFAULT 'unknown',
  size          pet_size,
  weight_kg     DECIMAL(6,2),
  color         TEXT DEFAULT '',
  avatar_url    TEXT,
  microchip_id  TEXT,
  is_neutered   BOOLEAN DEFAULT FALSE,
  adoption_date DATE,
  allergies     TEXT[] DEFAULT '{}',
  medical_notes TEXT DEFAULT '',
  notes         TEXT DEFAULT '',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pet_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
  CONSTRAINT pet_weight_positive CHECK (weight_kg IS NULL OR weight_kg > 0)
);

-- ─── Food Logs ────────────────────────────────────────────────────
CREATE TABLE public.food_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id        UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  logged_by     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  food_name     TEXT NOT NULL,
  brand         TEXT DEFAULT '',
  portion_grams DECIMAL(7,2),
  portion_unit  TEXT DEFAULT 'grams',
  calories      INTEGER,
  meal_type     meal_type NOT NULL DEFAULT 'dinner',
  is_wet_food   BOOLEAN DEFAULT FALSE,
  rating        SMALLINT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  notes         TEXT DEFAULT '',
  photo_url     TEXT,
  logged_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Vaccine Logs ─────────────────────────────────────────────────
CREATE TABLE public.vaccine_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id          UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  logged_by       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vaccine_name    TEXT NOT NULL,
  batch_number    TEXT DEFAULT '',
  manufacturer    TEXT DEFAULT '',
  status          vaccine_status NOT NULL DEFAULT 'administered',
  administered_at TIMESTAMPTZ,
  next_due_at     TIMESTAMPTZ,
  vet_name        TEXT DEFAULT '',
  cost            DECIMAL(8,2),
  notes           TEXT DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Blog Posts ───────────────────────────────────────────────────
CREATE TABLE public.blog_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  excerpt         TEXT NOT NULL DEFAULT '',
  content         TEXT NOT NULL DEFAULT '',   -- Markdown (architecture decision: not JSONB)
  cover_image_url TEXT,
  tags            TEXT[] DEFAULT '{}',
  category        blog_category NOT NULL DEFAULT 'other',
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  view_count      INTEGER NOT NULL DEFAULT 0,
  like_count      INTEGER NOT NULL DEFAULT 0,
  comment_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Community: Questions ─────────────────────────────────────────
CREATE TABLE public.questions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL DEFAULT '',
  tags         TEXT[] DEFAULT '{}',
  is_answered  BOOLEAN NOT NULL DEFAULT FALSE,
  view_count   INTEGER NOT NULL DEFAULT 0,
  like_count   INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Community: Comments ──────────────────────────────────────────
CREATE TABLE public.comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body        TEXT NOT NULL,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  like_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Notifications ────────────────────────────────────────────────
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,  -- 'vaccine_due', 'comment_reply', 'post_like', etc.
  title      TEXT NOT NULL,
  body       TEXT DEFAULT '',
  link       TEXT DEFAULT '',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Row Level Security ───────────────────────────────────────────
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Pets: owner-only
CREATE POLICY "Users can view own pets"
  ON public.pets FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own pets"
  ON public.pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own pets"
  ON public.pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own pets"
  ON public.pets FOR DELETE USING (auth.uid() = owner_id);

-- Food logs: owner-only (via pet ownership)
CREATE POLICY "Users can view own food logs"
  ON public.food_logs FOR SELECT USING (auth.uid() = logged_by);
CREATE POLICY "Users can insert own food logs"
  ON public.food_logs FOR INSERT WITH CHECK (auth.uid() = logged_by);
CREATE POLICY "Users can update own food logs"
  ON public.food_logs FOR UPDATE USING (auth.uid() = logged_by);
CREATE POLICY "Users can delete own food logs"
  ON public.food_logs FOR DELETE USING (auth.uid() = logged_by);

-- Vaccine logs: owner-only
CREATE POLICY "Users can view own vaccine logs"
  ON public.vaccine_logs FOR SELECT USING (auth.uid() = logged_by);
CREATE POLICY "Users can insert own vaccine logs"
  ON public.vaccine_logs FOR INSERT WITH CHECK (auth.uid() = logged_by);
CREATE POLICY "Users can update own vaccine logs"
  ON public.vaccine_logs FOR UPDATE USING (auth.uid() = logged_by);
CREATE POLICY "Users can delete own vaccine logs"
  ON public.vaccine_logs FOR DELETE USING (auth.uid() = logged_by);

-- Blog posts: public read for published, owner write
CREATE POLICY "Published posts are viewable by everyone"
  ON public.blog_posts FOR SELECT USING (is_published = true OR auth.uid() = author_id);
CREATE POLICY "Users can insert own posts"
  ON public.blog_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts"
  ON public.blog_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts"
  ON public.blog_posts FOR DELETE USING (auth.uid() = author_id);

-- Questions: public read, authenticated write
CREATE POLICY "Questions are viewable by everyone"
  ON public.questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post questions"
  ON public.questions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own questions"
  ON public.questions FOR UPDATE USING (auth.uid() = author_id);

-- Comments: public read, authenticated write
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post comments"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE USING (auth.uid() = author_id);

-- Notifications: owner-only
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ─── Triggers ─────────────────────────────────────────────────────
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER pets_updated_at        BEFORE UPDATE ON public.pets        FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER blog_posts_updated_at  BEFORE UPDATE ON public.blog_posts  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER questions_updated_at   BEFORE UPDATE ON public.questions   FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER comments_updated_at    BEFORE UPDATE ON public.comments    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER profiles_updated_at    BEFORE UPDATE ON public.profiles    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ─── Indexes ──────────────────────────────────────────────────────
CREATE INDEX idx_pets_owner_id        ON public.pets(owner_id);
CREATE INDEX idx_food_logs_pet_id     ON public.food_logs(pet_id);
CREATE INDEX idx_food_logs_logged_at  ON public.food_logs(logged_at DESC);
CREATE INDEX idx_vaccine_logs_pet_id  ON public.vaccine_logs(pet_id);
CREATE INDEX idx_vaccine_logs_due     ON public.vaccine_logs(next_due_at) WHERE next_due_at IS NOT NULL;
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published_at DESC) WHERE is_published = true;
CREATE INDEX idx_comments_question    ON public.comments(question_id);
CREATE INDEX idx_notifications_user   ON public.notifications(user_id, is_read, created_at DESC);
-- Migration: 002_community_schema.sql
-- Phase 2: Community Q&A, Profiles, Notifications

-- QUESTIONS
CREATE TYPE question_category AS ENUM ('nutrition', 'health', 'training', 'behavior', 'grooming', 'gear', 'general');

CREATE TABLE public.questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  category      question_category NOT NULL DEFAULT 'general',
  content       TEXT NOT NULL,
  view_count    INTEGER NOT NULL DEFAULT 0,
  like_count    INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  is_resolved   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT question_title_length CHECK (char_length(title) >= 10 AND char_length(title) <= 150)
);

-- COMMENTS
CREATE TABLE public.comments (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id        UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  parent_id          UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For nesting replies (max depth 2 handled in app logic)
  content            TEXT NOT NULL,
  like_count         INTEGER NOT NULL DEFAULT 0,
  is_accepted_answer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LIKES (Polymorphic-esque via target_type and target_id)
CREATE TYPE like_target_type AS ENUM ('question', 'comment', 'blog_post');

CREATE TABLE public.likes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type like_target_type NOT NULL,
  target_id   UUID NOT NULL, -- Logical reference to questions.id, comments.id, etc.
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id) -- A user can only like a target once
);

-- NOTIFICATIONS
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'accepted_answer', 'mention');

CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- The recipient
  actor_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- The person who performed the action
  type        notification_type NOT NULL,
  target_type like_target_type NOT NULL,
  target_id   UUID NOT NULL, -- E.g., The question or comment ID that triggered this
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS POLICIES FOR COMMUNITY

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Questions are readable by anyone
CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create questions" ON public.questions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own questions" ON public.questions FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own questions" ON public.questions FOR DELETE USING (auth.uid() = author_id);

-- Comments are readable by anyone
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);
-- Question owner can accept an answer (update is_accepted_answer on arbitrary comment of that question)
-- We will handle this complex policy check inside a database function or allow updates where user owns the linked question
CREATE POLICY "Question author can update is_accepted_answer" ON public.comments FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.questions q WHERE q.id = question_id AND q.author_id = auth.uid())
    OR auth.uid() = author_id
  );

-- Likes are readable by everyone, creatable by authenticated users
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Notifications are only visible/updateable to the recipient
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
-- Trigger logic naturally runs as superuser, no insert policy strictly needed if only inserts come from triggers.
-- But we'll add one just in case client inserts are needed, though typically triggers push notifications
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- DATABASE TRIGGERS
-- Trigger to auto-update comment count on question
CREATE OR REPLACE FUNCTION public.update_question_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.questions SET comment_count = comment_count + 1 WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.questions SET comment_count = comment_count - 1 WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_comment_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_question_comment_count();

-- Function to handle like counts and emit notification
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
BEGIN
  IF NEW.target_type = 'question' THEN
    UPDATE public.questions SET like_count = like_count + 1 WHERE id = NEW.target_id RETURNING author_id INTO v_recipient_id;
  ELSIF NEW.target_type = 'comment' THEN
    UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.target_id RETURNING author_id INTO v_recipient_id;
  END IF;
  
  -- Create notification if not self-like
  IF v_recipient_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, target_type, target_id)
    VALUES (v_recipient_id, NEW.user_id, 'like', NEW.target_type, NEW.target_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_created
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();

-- Function to handle like deletion
CREATE OR REPLACE FUNCTION public.handle_remove_like()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.target_type = 'question' THEN
    UPDATE public.questions SET like_count = like_count - 1 WHERE id = OLD.target_id;
  ELSIF OLD.target_type = 'comment' THEN
    UPDATE public.comments SET like_count = like_count - 1 WHERE id = OLD.target_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_deleted
AFTER DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.handle_remove_like();

-- Trigger to notify on new comment
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_question_owner UUID;
  v_parent_comment_owner UUID;
BEGIN
  SELECT author_id INTO v_question_owner FROM public.questions WHERE id = NEW.question_id;
  
  -- Notify question author if it's not their own comment
  IF NEW.author_id != v_question_owner THEN
    INSERT INTO public.notifications (user_id, actor_id, type, target_type, target_id)
    VALUES (v_question_owner, NEW.author_id, 'comment', 'question', NEW.question_id);
  END IF;
  
  -- If it's a reply to a comment, notify parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_comment_owner FROM public.comments WHERE id = NEW.parent_id;
    IF NEW.author_id != v_parent_comment_owner AND v_parent_comment_owner != v_question_owner THEN
      INSERT INTO public.notifications (user_id, actor_id, type, target_type, target_id)
      VALUES (v_parent_comment_owner, NEW.author_id, 'comment', 'comment', NEW.parent_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_created
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_new_comment();

