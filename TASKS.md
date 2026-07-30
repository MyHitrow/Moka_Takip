# Ajans Yönetim Paneli — Görev Listesi (Faz 1)

## 1. Proje Kurulumu
- [x] Next.js projesi oluştur (TypeScript, Tailwind, App Router)
- [x] shadcn/ui kur ve yapılandır
- [x] Gerekli shadcn/ui bileşenlerini ekle
- [x] Google Fonts (Inter) ekle
- [x] PWA manifest oluştur

## 2. Tasarım Sistemi
- [x] globals.css — koyu tema CSS değişkenleri
- [x] Özel renk tokenları (mor vurgu)
- [x] Scrollbar özelleştirmesi ve animasyonlar

## 3. Layout ve Navigasyon
- [x] Root layout (font, metadata, viewport)
- [x] Dashboard layout (sidebar + bottom nav)
- [x] Sidebar bileşeni (masaüstü)
- [x] Bottom nav bileşeni (mobil)
- [x] Header bileşeni
- [x] Mobile menu bileşeni

## 4. Ortak Bileşenler
- [x] stat-card.tsx (Dashboard istatistik kartı)
- [x] page-header.tsx (Sayfa üst bilgi)
- [x] empty-state.tsx (Boş durum)

## 5. Dashboard Sayfası
- [x] Mock verilerle istatistik kartları
- [x] Responsive grid layout
- [x] Haftalık çekim özeti
- [x] Editör iş yükü
- [x] Finansal özet kartları

## 6. Sayfa Route'ları
- [x] İşletmeler (liste, detay, yeni)
- [x] Çekimler (liste, detay, yeni)
- [x] Editler (liste, detay, yeni)
- [x] Paylaşım Takvimi
- [x] Gelirler (liste, yeni)
- [x] Giderler (liste, yeni)
- [x] Raporlar
- [x] Ekip
- [x] Bildirimler
- [x] Ayarlar
- [x] Login sayfası

## 7. Veritabanı
- [x] SQL migration dosyası (12 tablo)
- [x] RLS politikaları
- [x] İndeksler ve trigger'lar

## 8. Supabase Entegrasyon Dosyaları
- [x] client.ts (browser)
- [x] server.ts (server)
- [x] middleware.ts (auth)

## 9. Tipler ve Sabitler
- [x] database.ts (tablo tipleri)
- [x] constants.ts (durum etiketleri, menü, renkler)
- [x] utils.ts (para formatı, tarih, initials)

## 10. Dokümantasyon
- [x] README.md (kurulum rehberi)
- [x] .env.local.example

## 11. Doğrulama
- [x] TypeScript hata kontrolü (0 hata)
- [x] npm run build başarılı
- [x] Mobil görünüm kontrolü
- [x] Masaüstü görünüm kontrolü
