
ALTER TABLE public.players 
  ADD COLUMN IF NOT EXISTS watched_match text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS final_grade numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scout_notes text[] DEFAULT '{}'::text[];
