'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  title = 'Silme Onayı',
  description = 'Bu kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-[#17181B] border-[#2B2D32] text-[#F7F7F8]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" /> {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#B5B7BD] leading-relaxed">
            {description}
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2B2D32]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-[#2B2D32] bg-[#111214] hover:bg-[#24262B] text-[#F7F7F8] text-xs font-semibold"
            >
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
            >
              Evet, Sil
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
