import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SettingsPage = () => {
  const { t, lang, setLang } = useLanguage();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t('settingsTitle')}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('language')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('languageDesc')}</p>
        </CardHeader>
        <CardContent>
          <Select value={lang} onValueChange={(v) => setLang(v as 'tr' | 'en')}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tr">{t('turkish')}</SelectItem>
              <SelectItem value="en">{t('english')}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
