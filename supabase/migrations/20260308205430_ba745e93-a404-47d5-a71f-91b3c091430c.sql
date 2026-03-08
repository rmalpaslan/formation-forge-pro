
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS technical_rating integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tactical_rating integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS physical_rating integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS key_traits text[] DEFAULT '{}';
