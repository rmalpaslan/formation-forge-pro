import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ analyses: 0, players: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [{ count: a }, { count: p }] = await Promise.all([
        supabase.from('match_analyses').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('players').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setStats({ analyses: a ?? 0, players: p ?? 0 });
    };
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-1">{t('welcomeBack')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/analyses/new')}>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <ClipboardList className="h-12 w-12 text-primary" />
            <span className="text-xl font-semibold">{t('newMatchAnalysis')}</span>
            <span className="text-sm text-muted-foreground">{t('startAnalyzing')}</span>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/players/new')}>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <UserPlus className="h-12 w-12 text-primary" />
            <span className="text-xl font-semibold">{t('addNewPlayer')}</span>
            <span className="text-sm text-muted-foreground">{t('scoutPlayer')}</span>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{stats.analyses}</div>
            <div className="text-sm text-muted-foreground mt-1">{t('totalAnalyses')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{stats.players}</div>
            <div className="text-sm text-muted-foreground mt-1">{t('totalPlayers')}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
