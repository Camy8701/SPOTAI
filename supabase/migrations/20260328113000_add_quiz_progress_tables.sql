CREATE TABLE public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL,
  quiz_title TEXT NOT NULL,
  category TEXT,
  difficulty_band TEXT,
  score INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  incorrect_count INT NOT NULL DEFAULT 0,
  max_streak INT NOT NULL DEFAULT 0,
  xp_earned INT NOT NULL DEFAULT 0,
  lives_start INT,
  lives_remaining INT,
  answers JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz sessions"
ON public.quiz_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz sessions"
ON public.quiz_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz sessions"
ON public.quiz_sessions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_quiz_sessions_user_completed_at
ON public.quiz_sessions(user_id, completed_at DESC);

CREATE TABLE public.quiz_question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  order_index INT NOT NULL,
  quiz_title TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  question_text TEXT NOT NULL,
  selected_answer INT,
  correct_answer INT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  points_earned INT NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_question_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts"
ON public.quiz_question_attempts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
ON public.quiz_question_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz attempts"
ON public.quiz_question_attempts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_quiz_attempts_user_answered_at
ON public.quiz_question_attempts(user_id, answered_at DESC);

CREATE INDEX idx_quiz_attempts_session
ON public.quiz_question_attempts(session_id, order_index);

CREATE TABLE public.quiz_player_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak_days INT NOT NULL DEFAULT 0,
  best_streak_days INT NOT NULL DEFAULT 0,
  total_sessions INT NOT NULL DEFAULT 0,
  total_correct_answers INT NOT NULL DEFAULT 0,
  total_questions_answered INT NOT NULL DEFAULT 0,
  total_xp INT NOT NULL DEFAULT 0,
  longest_answer_streak INT NOT NULL DEFAULT 0,
  favorite_category TEXT,
  last_daily_challenge_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz player stats"
ON public.quiz_player_stats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz player stats"
ON public.quiz_player_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz player stats"
ON public.quiz_player_stats
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quiz player stats"
ON public.quiz_player_stats
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_quiz_player_stats_updated_at
BEFORE UPDATE ON public.quiz_player_stats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
