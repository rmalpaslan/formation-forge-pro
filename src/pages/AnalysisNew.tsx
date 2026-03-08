import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamSelector } from '@/components/TeamSelector';
import { CreatableSelector } from '@/components/CreatableSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { leagues } from '@/data/leaguesAndTeams';

const AnalysisNew = () => {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [league, setLeague] = useState('');
  const [targetTeam, setTargetTeam] = useState('home');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const staticLeagues = leagues.map(l => l.name);

  const handleContinue = async () => {
    if (!homeTeam || !awayTeam || !matchDate) {
      toast.error(t('fillAllFields'));
      return;
    }
    setLoading(true);

    if (targetTeam === 'both') {
      const { data: homeData, error: homeError } = await supabase.from('match_analyses').insert({
        home_team: homeTeam, away_team: awayTeam, match_date: matchDate,
        league: league || null, target_team: 'home', user_id: user!.id,
      } as any).select().single();

      if (homeError || !homeData) {
        toast.error(homeError?.message || 'Failed');
        setLoading(false);
        return;
      }

      const { data: awayData, error: awayError } = await supabase.from('match_analyses').insert({
        home_team: homeTeam, away_team: awayTeam, match_date: matchDate,
        league: league || null, target_team: 'away', user_id: user!.id,
      } as any).select().single();

      setLoading(false);
      if (awayError || !awayData) {
        toast.error(awayError?.message || 'Failed');
        return;
      }

      navigate(`/analyses/${(homeData as any).id}/edit`, { state: { nextAnalysisId: (awayData as any).id, step: 1 } });
    } else {
      const { data, error } = await supabase.from('match_analyses').insert({
        home_team: homeTeam, away_team: awayTeam, match_date: matchDate,
        league: league || null, target_team: targetTeam, user_id: user!.id,
      } as any).select().single();
      setLoading(false);
      if (error || !data) {
        toast.error(error?.message || 'Failed');
      } else {
        navigate(`/analyses/${(data as any).id}/edit`);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('newMatchAnalysis')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('league')}</label>
            <CreatableSelector
              value={league}
              onChange={setLeague}
              placeholder={t('searchLeague')}
              table="shared_leagues"
              staticOptions={staticLeagues}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('homeTeam')}</label>
            <TeamSelector value={homeTeam} onChange={setHomeTeam} placeholder={t('homeTeam')} />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('awayTeam')}</label>
            <TeamSelector value={awayTeam} onChange={setAwayTeam} placeholder={t('awayTeam')} />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('matchDate')}</label>
            <Input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('target')}</label>
            <Select value={targetTeam} onValueChange={setTargetTeam}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="home">{t('home')}</SelectItem>
                <SelectItem value="away">{t('away')}</SelectItem>
                <SelectItem value="both">{t('both')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleContinue} disabled={loading}>
            {loading ? t('creating') : t('continueToAnalysis')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisNew;
