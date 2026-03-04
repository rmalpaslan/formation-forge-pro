
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Match Analyses table
CREATE TABLE public.match_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_date DATE NOT NULL,
  target_team TEXT NOT NULL DEFAULT 'home',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.match_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analyses" ON public.match_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.match_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analyses" ON public.match_analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON public.match_analyses FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_match_analyses_updated_at BEFORE UPDATE ON public.match_analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Analysis Tabs table
CREATE TABLE public.analysis_tabs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_analysis_id UUID NOT NULL REFERENCES public.match_analyses(id) ON DELETE CASCADE,
  tab_type TEXT NOT NULL,
  sub_tab TEXT,
  formation TEXT DEFAULT '4-4-2',
  general_notes TEXT[] DEFAULT '{}',
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.analysis_tabs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analysis tabs" ON public.analysis_tabs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.match_analyses WHERE id = match_analysis_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own analysis tabs" ON public.analysis_tabs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.match_analyses WHERE id = match_analysis_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own analysis tabs" ON public.analysis_tabs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.match_analyses WHERE id = match_analysis_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own analysis tabs" ON public.analysis_tabs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.match_analyses WHERE id = match_analysis_id AND user_id = auth.uid()));

-- Players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_team TEXT,
  birth_date DATE,
  preferred_foot TEXT DEFAULT 'Right',
  primary_position TEXT DEFAULT 'ST',
  secondary_position TEXT,
  transfermarkt_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own players" ON public.players FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own players" ON public.players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own players" ON public.players FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own players" ON public.players FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Squads table
CREATE TABLE public.squads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  formation TEXT NOT NULL DEFAULT '4-3-3',
  positions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own squads" ON public.squads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own squads" ON public.squads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own squads" ON public.squads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own squads" ON public.squads FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_squads_updated_at BEFORE UPDATE ON public.squads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
