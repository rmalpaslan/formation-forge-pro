import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

const positions = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'];
const feet = ['Right', 'Left', 'Both'];

const PlayerNew = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const [name, setName] = useState('');
  const [currentTeam, setCurrentTeam] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [preferredFoot, setPreferredFoot] = useState('Right');
  const [primaryPosition, setPrimaryPosition] = useState('ST');
  const [secondaryPosition, setSecondaryPosition] = useState('');
  const [transfermarktLink, setTransfermarktLink] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (isEdit) {
      supabase.from('players').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setName(data.name);
          setCurrentTeam(data.current_team || '');
          setBirthDate(data.birth_date || '');
          setPreferredFoot(data.preferred_foot || 'Right');
          setPrimaryPosition(data.primary_position || 'ST');
          setSecondaryPosition(data.secondary_position || '');
          setTransfermarktLink(data.transfermarkt_link || '');
        }
      });
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!name) { toast.error(t('nameRequired')); return; }
    setLoading(true);
    const payload = {
      name, current_team: currentTeam, birth_date: birthDate || null,
      preferred_foot: preferredFoot, primary_position: primaryPosition,
      secondary_position: secondaryPosition || null, transfermarkt_link: transfermarktLink || null,
      user_id: user!.id,
    };
    const { error } = isEdit
      ? await supabase.from('players').update(payload).eq('id', id)
      : await supabase.from('players').insert(payload);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success(isEdit ? t('playerUpdated') : t('playerAdded')); navigate('/players'); }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader><CardTitle>{isEdit ? t('editPlayer') : t('addNewPlayer')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder={t('playerName')} value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder={t('currentTeam')} value={currentTeam} onChange={(e) => setCurrentTeam(e.target.value)} />
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
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? t('saving') : isEdit ? t('updatePlayer') : t('addPlayer')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerNew;
