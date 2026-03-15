import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { positionMapTR } from '@/lib/positionMap';
import { getRolesForPosition } from '@/lib/positionRoles';
import { CurrencyInput } from '@/components/CurrencyInput';
import { NationalitySelector } from '@/components/NationalitySelector';
import { BulletInput } from '@/components/BulletInput';

// CF and ST both map to 'Santrfor' — keep only ST to avoid duplicates
const positions = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];
const feet = ['Right', 'Left', 'Both'];

const TRAIT_KEYS = [
  'fast', 'playmaker', 'strong', 'aerialThreat', 'creative', 'defensive',
  'clinical', 'versatile', 'leader', 'workRate', 'ballControl', 'vision',
  'crossing', 'longShot', 'tackling', 'positioning',
] as const;

const footLabelTR: Record<string, string> = { Right: 'Sağ', Left: 'Sol', Both: 'Her İki Ayak' };

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
  const [playerRole, setPlayerRole] = useState('');
  const [transfermarktLink, setTransfermarktLink] = useState('');
  const [technicalRating, setTechnicalRating] = useState(0);
  const [tacticalRating, setTacticalRating] = useState(0);
  const [physicalRating, setPhysicalRating] = useState(0);
  const [mentalRating, setMentalRating] = useState(0);
  const [tacticalIQRating, setTacticalIQRating] = useState(0);
  const [currentAbility, setCurrentAbility] = useState(0);
  const [contractStatus, setContractStatus] = useState(0);
  const [keyTraits, setKeyTraits] = useState<string[]>([]);
  const [scoutNote, setScoutNote] = useState('');
  const [squadFitNotes, setSquadFitNotes] = useState('');
  const [squadFitPercentage, setSquadFitPercentage] = useState(0);
  const [videoLink, setVideoLink] = useState('');
  const [marketValue, setMarketValue] = useState('');
  const [resalePotential, setResalePotential] = useState(0);
  const [injuryHistory, setInjuryHistory] = useState('');
  const [nationality, setNationality] = useState('');
  const [watchedMatch, setWatchedMatch] = useState('');
  const [finalGrade, setFinalGrade] = useState(0);
  const [scoutNotes, setScoutNotes] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const staticLeagues = leagues.map(l => l.name);
  const availableRoles = getRolesForPosition(primaryPosition, lang);

  // Auto-calculated average of 5 core ratings
  const overallAverage = useMemo(() => {
    const sum = technicalRating + tacticalRating + physicalRating + mentalRating + tacticalIQRating;
    return (sum / 5).toFixed(1);
  }, [technicalRating, tacticalRating, physicalRating, mentalRating, tacticalIQRating]);

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
          setPlayerRole((data as any).player_role || '');
          setTransfermarktLink(data.transfermarkt_link || '');
          setTechnicalRating((data as any).technical_rating || 0);
          setTacticalRating((data as any).tactical_rating || 0);
          setPhysicalRating((data as any).physical_rating || 0);
          setMentalRating((data as any).mental_rating || 0);
          setTacticalIQRating((data as any).tactical_iq_rating || 0);
          setCurrentAbility((data as any).current_ability || 0);
          setContractStatus((data as any).contract_status || 0);
          setKeyTraits((data as any).key_traits || []);
          setScoutNote((data as any).scout_note || '');
          setSquadFitNotes((data as any).squad_fit_notes || '');
          setSquadFitPercentage((data as any).squad_fit_percentage || 0);
          setVideoLink((data as any).video_link || '');
          setMarketValue((data as any).market_value || '');
          setResalePotential((data as any).resale_potential || 0);
          setInjuryHistory((data as any).injury_history || '');
          setNationality((data as any).nationality || '');
          setWatchedMatch((data as any).watched_match || '');
          setFinalGrade((data as any).final_grade || 0);
          const sn = (data as any).scout_notes;
          setScoutNotes(sn && sn.length > 0 ? sn : ['']);
        }
      });
    }
  }, [id]);

  // Reset role when position changes
  useEffect(() => {
    const roles = getRolesForPosition(primaryPosition, lang);
    if (roles.length > 0 && !roles.includes(playerRole)) {
      setPlayerRole('');
    }
  }, [primaryPosition, lang]);

  const toggleTrait = (trait: string) => {
    setKeyTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : prev.length < 6 ? [...prev, trait] : prev
    );
  };

  const doSave = async (): Promise<boolean> => {
    if (!name) { toast.error(t('nameRequired')); return false; }
    setLoading(true);
    const payload = {
      name, current_team: currentTeam, league: league || null,
      birth_date: birthDate || null,
      preferred_foot: preferredFoot, primary_position: primaryPosition,
      secondary_position: secondaryPosition || null, transfermarkt_link: transfermarktLink || null,
      player_role: playerRole || null,
      technical_rating: technicalRating, tactical_rating: tacticalRating, physical_rating: physicalRating,
      mental_rating: mentalRating, tactical_iq_rating: tacticalIQRating,
      current_ability: currentAbility, contract_status: contractStatus,
      key_traits: keyTraits,
      scout_note: scoutNote || null,
      squad_fit_notes: squadFitNotes || null,
      squad_fit_percentage: squadFitPercentage,
      video_link: videoLink || null,
      market_value: marketValue || null,
      resale_potential: resalePotential,
      injury_history: injuryHistory || null,
      nationality: nationality || null,
      watched_match: watchedMatch || null,
      final_grade: finalGrade,
      scout_notes: scoutNotes.filter(s => s.trim() !== ''),
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

  const localizeFoot = (f: string) => lang === 'tr' ? (footLabelTR[f] || f) : f;

  const ratingRows: [string, number, (v: number) => void][] = [
    [t('technical' as any), technicalRating, setTechnicalRating],
    [t('tactical' as any), tacticalRating, setTacticalRating],
    [t('physical' as any), physicalRating, setPhysicalRating],
    [t('mental' as any), mentalRating, setMentalRating],
    [t('tacticalIQ' as any), tacticalIQRating, setTacticalIQRating],
    [t('currentAbility' as any), currentAbility, setCurrentAbility],
    [t('potentialAbility' as any), contractStatus, setContractStatus],
  ];

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader><CardTitle>{isEdit ? t('editPlayer') : t('addNewPlayer')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder={t('playerName')} value={name} onChange={(e) => setName(e.target.value)} />

          {/* Nationality */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{lang === 'tr' ? 'Milliyet' : 'Nationality'}</label>
            <NationalitySelector value={nationality} onChange={setNationality} />
          </div>

          {/* Watched Match */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('watchedMatch' as any)}</label>
            <Input placeholder={t('watchedMatchPlaceholder' as any)} value={watchedMatch} onChange={(e) => setWatchedMatch(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('league')}</label>
            <CreatableSelector value={league} onChange={setLeague} placeholder={t('searchLeague')} table="shared_leagues" staticOptions={staticLeagues} />
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
              <SelectContent>{feet.map((f) => <SelectItem key={f} value={f}>{localizeFoot(f)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">{t('primaryPosition')}</label>
              <Select value={primaryPosition} onValueChange={setPrimaryPosition}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{positions.map((p) => <SelectItem key={p} value={p}>{lang === 'tr' ? (positionMapTR[p] || p) : p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">{t('secondaryPosition')}</label>
              <Select value={secondaryPosition} onValueChange={setSecondaryPosition}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('none')}</SelectItem>
                  {positions.map((p) => <SelectItem key={p} value={p}>{lang === 'tr' ? (positionMapTR[p] || p) : p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Player Role */}
          {availableRoles.length > 0 && (
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">{t('playerRole' as any)}</label>
              <Select value={playerRole} onValueChange={setPlayerRole}>
                <SelectTrigger><SelectValue placeholder={t('selectRole' as any)} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('none')}</SelectItem>
                  {availableRoles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Skill Ratings — 1-10 scale */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">{t('skillRatings' as any)}</h3>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-xs text-muted-foreground">{t('overallAverage' as any)}</span>
                <span className="text-sm font-bold text-primary">{overallAverage}/10</span>
              </div>
            </div>
            {ratingRows.map(([label, val, setter]) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold text-primary">{val}/10</span>
                </div>
                <Slider min={0} max={10} step={1} value={[val]} onValueChange={([v]) => setter(v)} className="w-full" />
              </div>
            ))}
          </div>

          {/* Final Grade — prominent */}
          <div className="space-y-2 rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">{t('finalGrade' as any)}</h3>
              <span className="text-2xl font-black text-primary">{finalGrade}/10</span>
            </div>
            <Slider min={0} max={10} step={1} value={[finalGrade]} onValueChange={([v]) => setFinalGrade(v)} className="w-full" />
          </div>

          {/* Key Traits */}
          <div className="space-y-2 rounded-lg border border-border p-4">
            <h3 className="text-sm font-bold text-foreground">{t('keyTraits' as any)} <span className="font-normal text-muted-foreground">({keyTraits.length}/6)</span></h3>
            <div className="flex flex-wrap gap-2">
              {[...TRAIT_KEYS].sort((a, b) => t(a as any).localeCompare(t(b as any), lang)).map(trait => (
                <Badge
                  key={trait}
                  variant={keyTraits.includes(trait) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${keyTraits.includes(trait) ? '' : 'opacity-60 hover:opacity-100'}`}
                  onClick={() => toggleTrait(trait)}
                >
                  {t(trait as any)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Squad Fit Analysis */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-bold text-foreground">{t('squadFit' as any)}</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('squadFitPercentage' as any)}</span>
                <span className="font-bold text-primary">%{squadFitPercentage}</span>
              </div>
              <Slider min={0} max={100} step={5} value={[squadFitPercentage]} onValueChange={([v]) => setSquadFitPercentage(v)} className="w-full" />
            </div>
            <Textarea
              placeholder={t('squadFitPlaceholder' as any)}
              value={squadFitNotes}
              onChange={(e) => setSquadFitNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Financial Info */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-bold text-foreground">{t('financialInfo' as any)}</h3>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">{t('marketValue' as any)}</label>
              <CurrencyInput value={marketValue} onChange={setMarketValue} placeholder="1.000.000" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('resalePotential' as any)}</span>
                <span className="font-bold text-primary">{resalePotential}/10</span>
              </div>
              <Slider min={0} max={10} step={1} value={[resalePotential]} onValueChange={([v]) => setResalePotential(v)} className="w-full" />
            </div>
          </div>

          {/* Injury History */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-foreground">{t('injuryHistory' as any)}</label>
            <Textarea
              placeholder={t('injuryHistoryPlaceholder' as any)}
              value={injuryHistory}
              onChange={(e) => setInjuryHistory(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Scout Note (Final Opinion) */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-foreground">{t('scoutNote' as any)}</label>
            <Textarea
              placeholder={t('scoutNotePlaceholder' as any)}
              value={scoutNote}
              onChange={(e) => setScoutNote(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* Scout Notes — Bullet Points */}
          <BulletInput
            label={t('scoutNotes' as any)}
            value={scoutNotes}
            onChange={setScoutNotes}
            placeholder={t('scoutNotesPlaceholder' as any)}
          />

          {/* Video Link */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">{t('videoLink' as any)}</label>
            <Input placeholder={t('videoLinkPlaceholder' as any)} value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
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
