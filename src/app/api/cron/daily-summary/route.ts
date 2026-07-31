import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({
        error: 'TELEGRAM_BOT_TOKEN veya TELEGRAM_CHAT_ID .env.local / Vercel Environment Variables üzerinde tanımlanmamış!',
        setup: {
          step1: 'Telegram@BotFather uygulamasından bot oluşturun (TOKEN alın)',
          step2: 'Botunuza mesaj atın ve Chat ID değerinizi öğrenin',
          step3: 'Vercel / .env.local içine TELEGRAM_BOT_TOKEN ve TELEGRAM_CHAT_ID ekleyin.',
        },
      }, { status: 400 });
    }

    const supabase = createClient();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dateFormatted = today.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 1. Bugünkü Çekimler
    const { data: shoots } = await supabase
      .from('shoots')
      .select('*')
      .eq('shoot_date', todayStr);

    // 2. Bugün Teslim Edilmesi Gereken Editler (Bitenler hariç)
    const { data: edits } = await supabase
      .from('edits')
      .select('*')
      .lte('deadline', todayStr)
      .not('status', 'in', '("ready","published")');

    // 3. Bugünkü Paylaşımlar
    const { data: posts } = await supabase
      .from('content_calendar')
      .select('*')
      .eq('publish_date', todayStr);

    // 4. Gecikmiş Ödemeler
    const { data: incomeData } = await supabase
      .from('income_records')
      .select('*')
      .not('collection_status', 'eq', 'paid');

    const overdueIncomes = (incomeData || []).filter((g) => {
      if (!g.due_date) return false;
      return g.due_date <= todayStr;
    });

    // Mesaj Başlığı
    let message = `☀️ <b>MOKA TAKİP — SABAH ÖZETİ</b>\n📅 <i>${dateFormatted}</i>\n\n`;

    // Çekimler Bölümü
    message += `🎬 <b>BUGÜNKÜ ÇEKİMLER (${shoots?.length || 0}):</b>\n`;
    if (shoots && shoots.length > 0) {
      shoots.forEach((s) => {
        const client = s.client_name || 'İşletme';
        const time = s.start_time || '10:00';
        const location = s.location || 'Stüdyo';
        message += `• <b>${client}</b> — ${s.title} (⏰ ${time} @ ${location})\n`;
      });
    } else {
      message += `<i>Bugün için planlanan çekim yok.</i>\n`;
    }
    message += `\n`;

    // Editler Bölümü
    message += `🎞️ <b>TESLİM EDİLECEK EDİTLER (${edits?.length || 0}):</b>\n`;
    if (edits && edits.length > 0) {
      edits.forEach((e) => {
        const client = e.client_name || 'İşletme';
        const editor = e.editor_name || 'Atanmadı';
        const isOverdue = e.deadline < todayStr;
        message += `• <b>${client}</b> — ${e.title} [${editor}] ${isOverdue ? '⚠️ <i>Gecikti!</i>' : ''}\n`;
      });
    } else {
      message += `<i>Bugün teslim edilecek bekleyen edit yok.</i>\n`;
    }
    message += `\n`;

    // Paylaşımlar Bölümü
    message += `📱 <b>BUGÜNKÜ PAYLAŞIMLAR (${posts?.length || 0}):</b>\n`;
    if (posts && posts.length > 0) {
      posts.forEach((p) => {
        const client = p.client_name || 'İşletme';
        const platform = p.platform || p.content_type || 'Social Media';
        const time = p.publish_time || '18:00';
        message += `• <b>${client}</b> — ${p.title || 'İçerik'} (${platform} - ⏰ ${time})\n`;
      });
    } else {
      message += `<i>Bugün için planlanan paylaşım yok.</i>\n`;
    }

    // Gecikmiş Ödemeler Uyarısı
    if (overdueIncomes.length > 0) {
      const totalOverdue = overdueIncomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
      message += `\n🚨 <b>TAHSİLAT UYARISI:</b>\n`;
      message += `Tahsilat bekleyen <b>${overdueIncomes.length}</b> müşteriden toplam <b>${totalOverdue.toLocaleString('tr-TR')} ₺</b> alacak var.\n`;
    }

    message += `\n🔗 <a href="https://moka-takip.vercel.app">MOKA Takip Panelini Aç</a>`;

    // Telegram Bot API Endpoint'ine mesaj gönder
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const telegramRes = await res.json();

    if (!telegramRes.ok) {
      return NextResponse.json({
        error: 'Telegram mesajı gönderilemedi!',
        details: telegramRes,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Sabah özeti Telegram adresinize başarıyla gönderildi! 🎉',
      sentAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
