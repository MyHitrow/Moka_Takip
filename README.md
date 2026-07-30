# 🎬 Ajans Panel — Prodüksiyon Yönetim Sistemi

Prodüksiyon ve sosyal medya ajansları için modern, koyu temalı, responsive yönetim paneli.

Çekim planlaması, edit/kurgu süreçleri, paylaşım takvimi, gelir-gider takibi ve ekip yönetimini tek panelde birleştiren profesyonel SaaS çözümü.

## ✨ Özellikler

- **İşletme Yönetimi** — Müşteri portföyü, abonelik paketleri, sözleşme bilgileri
- **Çekim Planlama** — Takvim + liste görünüm, ekip ataması, ekipman takibi
- **Edit Yönetimi** — Kanban board ile kurgu süreçleri (sürükle-bırak)
- **Paylaşım Takvimi** — Haftalık/aylık içerik planlaması
- **Ön Muhasebe** — Gelir/gider takibi, tahsilat durumları
- **Raporlama** — Finansal ve operasyonel raporlar
- **Ekip Yönetimi** — Görev atamaları, editör iş yükleri
- **Bildirimler** — Panel içi bildirim sistemi
- **PWA Desteği** — Telefona uygulama olarak yüklenebilir

## 🛠 Teknoloji Yığını

| Teknoloji | Amaç |
|-----------|------|
| [Next.js 16](https://nextjs.org/) | App Router, SSR/SSG |
| [TypeScript](https://www.typescriptlang.org/) | Tip güvenliği |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | UI bileşen kütüphanesi |
| [Supabase](https://supabase.com/) | PostgreSQL, Auth, Storage |
| [Vercel](https://vercel.com/) | Deployment |
| [Lucide Icons](https://lucide.dev/) | İkonlar |

## 📋 Gereksinimler

- Node.js **18** veya üzeri
- npm (veya pnpm/yarn)
- [Supabase](https://supabase.com/) hesabı (ücretsiz plan yeterli)

## 🚀 Kurulum

### 1. Projeyi klonla

```bash
git clone <repo-url>
cd Muhasebe
```

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. Supabase projesi oluştur

1. [supabase.com](https://supabase.com/) adresine git
2. **New Project** butonuna tıkla
3. Proje adını ve veritabanı şifresini belirle
4. Region olarak en yakın bölgeyi seç (örn: Frankfurt)
5. Proje oluşturulduktan sonra **Project Settings > API** bölümünden:
   - `Project URL` → Bu senin `NEXT_PUBLIC_SUPABASE_URL` değerin
   - `anon public` key → Bu senin `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerin

### 4. Ortam değişkenlerini ayarla

```bash
cp .env.local.example .env.local
```

`.env.local` dosyasını aç ve Supabase bilgilerini gir:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
```

### 5. Veritabanı tablolarını oluştur

1. Supabase Dashboard'da **SQL Editor** bölümüne git
2. `supabase/migrations/001_initial_schema.sql` dosyasının içeriğini kopyala
3. SQL Editor'e yapıştır ve **Run** butonuna tıkla
4. Tüm tablolar, indeksler, trigger'lar ve RLS politikaları otomatik oluşturulacak

### 6. Geliştirme sunucusunu başlat

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç.

> **Not:** İlk aşamada Supabase bağlantısı olmadan çalıştırmak isterseniz, `src/middleware.ts` dosyasının tamamını yorum satırına alabilirsiniz. Dashboard mock verilerle çalışacaktır.

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── (auth)/            # Login sayfası
│   ├── (dashboard)/       # Tüm panel sayfaları
│   │   ├── isletmeler/    # İşletme yönetimi
│   │   ├── cekimler/      # Çekim planlama
│   │   ├── editler/       # Edit/kurgu yönetimi
│   │   ├── paylasim-takvimi/
│   │   ├── gelirler/      # Gelir takibi
│   │   ├── giderler/      # Gider takibi
│   │   ├── raporlar/      # Raporlar
│   │   ├── ekip/          # Ekip yönetimi
│   │   ├── bildirimler/   # Bildirimler
│   │   └── ayarlar/       # Panel ayarları
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Koyu tema stilleri
├── components/
│   ├── ui/                # shadcn/ui bileşenleri
│   ├── layout/            # Sidebar, BottomNav, Header
│   ├── dashboard/         # Dashboard kartları
│   └── shared/            # Ortak bileşenler
├── lib/
│   ├── supabase/          # Supabase istemcileri
│   ├── constants.ts       # Menü, etiketler, renkler
│   └── utils.ts           # Yardımcı fonksiyonlar
├── types/
│   └── database.ts        # TypeScript tablo tipleri
├── hooks/
│   └── use-mobile.ts      # Mobil tespit hook
└── middleware.ts           # Auth middleware
```

## 👥 Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|----------|
| **Admin** | Tüm modüllere tam erişim, finansal veriler, kullanıcı yönetimi |
| **Editör** | Sadece atanan editler, durum güncelleme, dosya ekleme. Finans YOK |
| **Muhasebe** | Gelir/gider yönetimi, tahsilat, finans raporları. Edit düzenleme YOK |
| **Ekip Üyesi** | Sadece atanan çekimler, çekim notu, durum güncelleme. Finans YOK |

## 🔐 Ortam Değişkenleri

| Değişken | Açıklama | Zorunlu |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'si | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (sadece sunucu) | ❌ |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` asla tarayıcı tarafında kullanılmamalıdır!

## 🌐 Vercel'e Deploy

1. [vercel.com](https://vercel.com/)'a git ve GitHub hesabını bağla
2. **Import Project** ile bu repoyu seç
3. **Environment Variables** bölümünden Supabase bilgilerini ekle
4. **Deploy** butonuna tıkla

## 📱 Mobil Kullanım

Panel telefona PWA olarak yüklenebilir:

1. Chrome'da paneli aç
2. Menü > **Ana ekrana ekle** seçeneğine tıkla
3. Panel uygulama gibi çalışacaktır

## 📜 Lisans

Bu proje MIT lisansı altındadır.
