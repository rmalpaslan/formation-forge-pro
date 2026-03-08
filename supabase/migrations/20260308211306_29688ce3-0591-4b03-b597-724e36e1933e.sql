
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS mental_rating integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tactical_iq_rating integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contract_status integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scout_note text DEFAULT '';
