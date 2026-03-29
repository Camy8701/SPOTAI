
-- Quiz sessions table
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mode TEXT NOT NULL DEFAULT 'classic',
  quiz_title TEXT NOT NULL DEFAULT 'AI Knowledge Arena',
  category TEXT,
  difficulty_band TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  lives_start INTEGER,
  lives_remaining INTEGER,
  answers JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz player stats table
CREATE TABLE public.quiz_player_stats (
  user_id UUID NOT NULL PRIMARY KEY,
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  best_streak_days INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions_answered INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  longest_answer_streak INTEGER NOT NULL DEFAULT 0,
  favorite_category TEXT,
  last_daily_challenge_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz question attempts table
CREATE TABLE public.quiz_question_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  quiz_title TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  question_text TEXT NOT NULL,
  selected_answer INTEGER,
  correct_answer INTEGER NOT NULL DEFAULT 0,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  points_earned INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_question_attempts ENABLE ROW LEVEL SECURITY;

-- quiz_sessions policies
CREATE POLICY "Users can insert own sessions" ON public.quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own sessions" ON public.quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sessions" ON public.quiz_sessions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- quiz_player_stats policies
CREATE POLICY "Users can upsert own stats" ON public.quiz_player_stats FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all stats" ON public.quiz_player_stats FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- quiz_question_attempts policies
CREATE POLICY "Users can insert own attempts" ON public.quiz_question_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own attempts" ON public.quiz_question_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all attempts" ON public.quiz_question_attempts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
