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

