import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AccountPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single().then(({ data }) => {
      if (data) { setFirstName(data.first_name || ''); setLastName(data.last_name || ''); }
    });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ first_name: firstName, last_name: lastName }).eq('user_id', user!.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success(t('profileUpdated'));
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader><CardTitle>{t('account')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">{t('email')}: {user?.email}</div>
          <Input placeholder={t('firstName')} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input placeholder={t('lastName')} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t('saving') : t('saveChanges')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPage;
