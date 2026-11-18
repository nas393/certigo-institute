-- Exam time limits (applied to the live database on 2026-11-18).
-- Per question: 90 s if the question contains numbers (calculation), 60 s if longer than 140 characters (scenario), else 40 s (recall).
-- Limit = sum for the questions drawn + 60 s reading time, stored in exam_sessions.expires_at by start_exam_core.
-- submit_exam rejects submissions later than expires_at + 30 s; the exam page auto-submits at 0 (unanswered = wrong).
-- Full function bodies: see start_exam_core / submit_exam in the database (supabase migration "exam_time_limits").
CREATE OR REPLACE FUNCTION public._question_seconds(_q jsonb) RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN (_q->>'q') ~ '[0-9]' THEN 90 WHEN length(_q->>'q') > 140 THEN 60 ELSE 40 END
$$;
