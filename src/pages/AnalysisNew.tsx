import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AnalysisNew = () => {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [targetTeam, setTargetTeam] = useState('home');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleContinue = async () => {
    if (!homeTeam || !awayTeam || !matchDate) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('match_analyses').insert({
      home_team: homeTeam,
      away_team: awayTeam,
      match_date: matchDate,
      target_team: targetTeam,
      user_id: user!.id,
    }).select().single();
    setLoading(false);
    if (error || !data) {
      toast.error(error?.message || 'Failed to create analysis');
    } else {
      navigate(`/analyses/${data.id}/edit`);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>New Match Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Home Team" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
          <Input placeholder="Away Team" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
          <Input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Analysis Target</label>
            <Select value={targetTeam} onValueChange={setTargetTeam}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home Team</SelectItem>
                <SelectItem value="away">Away Team</SelectItem>
                <SelectItem value="both">Both Teams</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleContinue} disabled={loading}>
            {loading ? 'Creating...' : 'Continue to Analysis'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisNew;
