
-- Add league column to match_analyses and players
ALTER TABLE public.match_analyses ADD COLUMN IF NOT EXISTS league text;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS league text;

-- Shared leagues table
CREATE TABLE IF NOT EXISTS public.shared_leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read leagues" ON public.shared_leagues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert leagues" ON public.shared_leagues FOR INSERT TO authenticated WITH CHECK (true);

-- Shared teams table
CREATE TABLE IF NOT EXISTS public.shared_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  league text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(name, league)
);

ALTER TABLE public.shared_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read teams" ON public.shared_teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert teams" ON public.shared_teams FOR INSERT TO authenticated WITH CHECK (true);
