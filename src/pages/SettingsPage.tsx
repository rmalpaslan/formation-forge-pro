import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SettingsPage = () => {
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success(lang === 'tr' ? 'Kaydedildi' : 'Saved');
    setTimeout(() => setSaved(false), 2000);
  };

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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('theme')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('themeDesc')}</p>
        </CardHeader>
        <CardContent>
          <Select value={theme || 'dark'} onValueChange={setTheme}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t('lightMode')}</SelectItem>
              <SelectItem value="dark">{t('darkMode')}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Button onClick={handleSave} className="w-full" variant={saved ? 'secondary' : 'default'}>
        {saved ? (lang === 'tr' ? '✓ Kaydedildi' : '✓ Saved') : (lang === 'tr' ? 'Değişiklikleri Kaydet' : 'Save Changes')}
      </Button>
    </div>
  );
};

export default SettingsPage;
