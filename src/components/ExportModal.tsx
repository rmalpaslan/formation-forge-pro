import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileDown, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (dark: boolean) => void;
  title?: string;
}

export function ExportModal({ open, onOpenChange, onExport, title }: ExportModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title || t('exportPdf')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-3 h-auto py-6 border-2 hover:border-primary"
            onClick={() => { onExport(false); onOpenChange(false); }}
          >
            <Sun className="h-8 w-8 text-amber-500" />
            <div className="text-center">
              <div className="font-bold text-sm">Klasik Rapor</div>
              <div className="text-xs text-muted-foreground">(Açık)</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-3 h-auto py-6 border-2 hover:border-primary bg-foreground/5"
            onClick={() => { onExport(true); onOpenChange(false); }}
          >
            <Moon className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-bold text-sm">Premium Rapor</div>
              <div className="text-xs text-muted-foreground">(Koyu)</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
