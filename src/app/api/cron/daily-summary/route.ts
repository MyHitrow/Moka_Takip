import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { runAISentinelAudit } from '@/lib/ai-sentinel';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({
        error: 'TELEGRAM_BOT_TOKEN veya TELEGRAM_CHAT_ID tanımlanmamış!',
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

    // Supabase Sorguları
    const { data: rawIsletmeler } = await supabase.from('clients').select('*');
    const { data: rawShoots } = await supabase.from('shoots').select('*');
    const { data: rawEdits } = await supabase.from('edits').select('*');
    const { data: rawPosts } = await supabase.from('content_calendar').select('*');
    const { data: rawIncome } = await supabase.from('income_records').select('*');

    // Model Dönüştürmeleri
    const isletmeler = (rawIsletmeler || []).map((b) => ({
      id: b.id,
      name: b.name || b.client_name,
      contact: b.contact_person || '',
      phone: b.phone || '',
      instagram: b.instagram || '',
      fee: b.monthly_fee || '',
      active: b.status !== 'inactive',
      monthlyReelsTarget: b.monthly_reels_target || 8,
      monthlyShootTarget: b.monthly_shoot_target || 2,
    }));

    const cekimler = (rawShoots || []).map((s) => ({
      id: s.id,
      client: s.client_name,
      title: s.title,
      date: s.shoot_date,
      time: s.start_time || '10:00',
      location: s.location || 'Stüdyo',
      status: s.status,
    }));

    const editler = (rawEdits || []).map((e) => ({
      id: e.id,
      title: e.title,
      client: e.client_name,
      type: e.content_type || 'Reels',
      editor: e.editor_name || 'Atanmadı',
      deadline: e.deadline,
      status: e.status,
    }));

    const takvimPosts = (rawPosts || []).map((p) => ({
      id: p.id,
      client: p.client_name,
      title: p.title,
      platform: p.platform || 'Instagram Reels',
      date: p.publish_date,
      time: p.publish_time,
      status: p.status,
    }));

    // AI Sentinel Audit Çalıştır
    const aiInsights = runAISentinelAudit({
      isletmeler,
      cekimler,
      editler,
      takvimPosts,
    });

    // Bugünkü veriler
    const todayShoots = cekimler.filter((s) => s.date === todayStr);
    const todayEdits = editler.filter((e) => e.deadline <= todayStr && !['ready', 'published'].includes(e.status));
    const todayPosts = takvimPosts.filter((p) => p.date === todayStr);
    const overdueIncomes = (rawIncome || []).filter((g) => g.collection_status !== 'paid' && g.due_date && g.due_date <= todayStr);

    // Mesaj Başlığı
    let message = `☀️ <b>MOKA TAKİP — SABAH ÖZETİ</b>\n📅 <i>${dateFormatted}</i>\n\n`;

    // AI DİREKTÖR BEKÇİSİ UYARILARI
    if (aiInsights.length > 0) {
      message += `🤖 <b>AI DİREKTÖR BEKÇİSİ UYARILARI (${aiInsights.length}):</b>\n`;
      aiInsights.slice(0, 4).forEach((insight) => {
        message += `• ${insight.title}\n`;
      });
      message += `\n`;
    }

    // Çekimler Bölümü
    message += `🎬 <b>BUGÜNKÜ ÇEKİMLER (${todayShoots.length}):</b>\n`;
    if (todayShoots.length > 0) {
      todayShoots.forEach((s) => {
        message += `• <b>${s.client}</b> — ${s.title} (⏰ ${s.time} @ ${s.location})\n`;
      });
    } else {
      message += `<i>Bugün için planlanan çekim yok.</i>\n`;
    }
    message += `\n`;

    // Editler Bölümü
    message += `🎞️ <b>TESLİM EDİLECEK EDİTLER (${todayEdits.length}):</b>\n`;
    if (todayEdits.length > 0) {
      todayEdits.forEach((e) => {
        const isOverdue = e.deadline < todayStr;
        message += `• <b>${e.client}</b> — ${e.title} [${e.editor}] ${isOverdue ? '⚠️ <i>Gecikti!</i>' : ''}\n`;
      });
    } else {
      message += `<i>Bugün teslim edilecek bekleyen edit yok.</i>\n`;
    }
    message += `\n`;

    // Paylaşımlar Bölümü
    message += `📱 <b>BUGÜNKÜ PAYLAŞIMLAR (${todayPosts.length}):</b>\n`;
    if (todayPosts.length > 0) {
      todayPosts.forEach((p) => {
        message += `• <b>${p.client}</b> — ${p.title} (${p.platform} - ⏰ ${p.time || '18:00'})\n`;
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
      message: 'Sabah özeti ve AI Direktör Raporu Telegram adresinize başarıyla gönderildi! 🎉',
      sentAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
