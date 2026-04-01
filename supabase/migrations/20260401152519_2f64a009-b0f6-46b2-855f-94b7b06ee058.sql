
DROP VIEW IF EXISTS public.quiz_questions_public;
CREATE VIEW public.quiz_questions_public
WITH (security_invoker = true) AS
  SELECT id, quiz_title, question, options, difficulty, category, created_at
  FROM public.quiz_questions;
