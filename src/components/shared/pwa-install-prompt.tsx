'use client';

import { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PwaInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Standalone modunda zaten çalışıyorsa banner gösterme
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Kullanıcı daha önce kapattıysa 7 gün boyunca tekrar gösterme
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) return;
    }

    const userAgent = window.navigator.userAgent;
    const iosDevice = /iPhone|iPad|iPod/i.test(userAgent);
    setIsIos(iosDevice);

    // Mobil cihazlarda 2 saniye gecikmeyle göster
    const isMobile = iosDevice || /Android/i.test(userAgent);
    if (isMobile) {
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-card/95 backdrop-blur-xl border-2 border-primary/30 p-4 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Kapat butonu */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-primary/15 rounded-xl border border-primary/30 text-primary shrink-0 mt-0.5">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1 pr-4">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              MOKA Takip'i Telefonuna Yükle
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Uygulama olarak ana ekranına ekleyerek tek tıkla hızlıca erişebilirsin.
            </p>

            {isIos ? (
              <div className="mt-3 bg-muted/60 p-2.5 rounded-xl border border-border space-y-1.5 text-[11px] text-muted-foreground">
                <p className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Share className="w-3.5 h-3.5 text-primary shrink-0" />
                  1. Safari'de aşağıdaki <strong>Paylaş (⬆️)</strong> butonuna bas.
                </p>
                <p className="flex items-center gap-1.5 font-semibold text-foreground">
                  <PlusSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                  2. Açılan menüden <strong>"Ana Ekrana Ekle"</strong> seçeneğini seç.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-primary font-semibold">
                Tarayıcı menüsünden "Ana Ekrana Ekle" seçeneğine dokunun.
              </p>
            )}

            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                onClick={handleDismiss}
                className="bg-primary hover:bg-primary/90 text-white text-xs h-7 px-3 font-semibold rounded-lg"
              >
                <Check className="w-3 h-3 mr-1" /> Anladım
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
