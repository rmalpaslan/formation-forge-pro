import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const AnalysisNew = () => {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [targetTeam, setTargetTeam] = useState('home');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleContinue = async () => {
    if (!homeTeam || !awayTeam || !matchDate) {
      toast.error(t('fillAllFields'));
      return;
    }
    setLoading(true);

    if (targetTeam === 'both') {
      // Create two analyses: first for home, then for away
      const { data: homeData, error: homeError } = await supabase.from('match_analyses').insert({
        home_team: homeTeam, away_team: awayTeam, match_date: matchDate,
        target_team: 'home', user_id: user!.id,
      }).select().single();

      if (homeError || !homeData) {
        toast.error(homeError?.message || 'Failed');
        setLoading(false);
        return;
      }

      const { data: awayData, error: awayError } = await supabase.from('match_analyses').insert({
        home_team: homeTeam, away_team: awayTeam, match_date: matchDate,
        target_team: 'away', user_id: user!.id,
      }).select().single();

      setLoading(false);
      if (awayError || !awayData) {
        toast.error(awayError?.message || 'Failed');
        return;
      }

      // Navigate to home analysis first, pass away analysis id as state
      navigate(`/analyses/${homeData.id}/edit`, { state: { nextAnalysisId: awayData.id, step: 1 } });
    } else {
      const { data, error } = await supabase.from('match_analyses').insert({
        home_team: homeTeam, away_team: awayTeam, match_date: matchDate,
        target_team: targetTeam, user_id: user!.id,
      }).select().single();
      setLoading(false);
      if (error || !data) {
        toast.error(error?.message || 'Failed');
      } else {
        navigate(`/analyses/${data.id}/edit`);
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
          <Input placeholder={t('homeTeam')} value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
          <Input placeholder={t('awayTeam')} value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('matchDate')}</label>
            <Input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('analysisTarget')}</label>
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
