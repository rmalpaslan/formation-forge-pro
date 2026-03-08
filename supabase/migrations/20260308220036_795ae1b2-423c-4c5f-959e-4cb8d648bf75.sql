ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS player_role text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS squad_fit_notes text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS squad_fit_percentage integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_link text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS market_value text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS resale_potential integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS injury_history text DEFAULT NULL;