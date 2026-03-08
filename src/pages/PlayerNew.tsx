import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Save, CheckCircle } from 'lucide-react';
import { leagues } from '@/data/leaguesAndTeams';

const positions = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'];
const feet = ['Right', 'Left', 'Both'];

const PlayerNew = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const [name, setName] = useState('');
  const [currentTeam, setCurrentTeam] = useState('');
  const [league, setLeague] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [preferredFoot, setPreferredFoot] = useState('Right');
  const [primaryPosition, setPrimaryPosition] = useState('ST');
  const [secondaryPosition, setSecondaryPosition] = useState('');
  const [transfermarktLink, setTransfermarktLink] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const staticLeagues = leagues.map(l => l.name);

  useEffect(() => {
    if (isEdit) {
      supabase.from('players').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setName(data.name);
          setCurrentTeam(data.current_team || '');
          setLeague((data as any).league || '');
          setBirthDate(data.birth_date || '');
          setPreferredFoot(data.preferred_foot || 'Right');
          setPrimaryPosition(data.primary_position || 'ST');
          setSecondaryPosition(data.secondary_position || '');
          setTransfermarktLink(data.transfermarkt_link || '');
        }
      });
    }
  }, [id]);

  const doSave = async (): Promise<boolean> => {
    if (!name) { toast.error(t('nameRequired')); return false; }
    setLoading(true);
    const payload = {
      name, current_team: currentTeam, league: league || null,
      birth_date: birthDate || null,
      preferred_foot: preferredFoot, primary_position: primaryPosition,
      secondary_position: secondaryPosition || null, transfermarkt_link: transfermarktLink || null,
      user_id: user!.id,
    };
    const { error } = isEdit
      ? await supabase.from('players').update(payload as any).eq('id', id)
      : await supabase.from('players').insert(payload as any);
    setLoading(false);
    if (error) { toast.error(error.message); return false; }
    return true;
  };

  const handleDraftSave = async () => {
    const ok = await doSave();
    if (ok) toast.success(t('draftSaved'));
  };

  const handleFinish = async () => {
    const ok = await doSave();
    if (ok) {
      toast.success(isEdit ? t('playerUpdated') : t('playerAdded'));
      navigate('/players');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader><CardTitle>{isEdit ? t('editPlayer') : t('addNewPlayer')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder={t('playerName')} value={name} onChange={(e) => setName(e.target.value)} />
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
            <label className="text-sm text-muted-foreground">{t('currentTeam')}</label>
            <TeamSelector value={currentTeam} onChange={setCurrentTeam} placeholder={t('currentTeam')} />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('birthDate')}</label>
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('preferredFoot')}</label>
            <Select value={preferredFoot} onValueChange={setPreferredFoot}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{feet.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">{t('primaryPosition')}</label>
              <Select value={primaryPosition} onValueChange={setPrimaryPosition}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{positions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">{t('secondaryPosition')}</label>
              <Select value={secondaryPosition} onValueChange={setSecondaryPosition}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('none')}</SelectItem>
                  {positions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Input placeholder={t('transfermarktLink')} value={transfermarktLink} onChange={(e) => setTransfermarktLink(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleDraftSave} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? t('saving') : t('draftSave')}
            </Button>
            <Button className="flex-1" onClick={handleFinish} disabled={loading}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('finishPlayer')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerNew;
