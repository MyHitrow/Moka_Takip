import { Isletme, Cekim, EditItem, Gelir, Gider, TakvimPost, HaftalikNot, EkipUyesi } from '@/types/app';
import { isClientMatch } from '@/lib/helpers';

export interface DataContextPayload {
  isletmeler: Isletme[];
  cekimler: Cekim[];
  editler: EditItem[];
  gelirler: Gelir[];
  giderler: Gider[];
  takvimPosts: TakvimPost[];
  haftalikNotlar: HaftalikNot[];
  ekip: EkipUyesi[];
}

/**
 * Serializes current database state into a rich structured text context for LLMs
 */
export function buildAgencySystemPrompt(data: DataContextPayload): string {
  const activeClients = data.isletmeler.filter((i) => i.active);
  const totalRevenue = data.gelirler.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpenses = data.giderler.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  let prompt = `Sen REDLINE MEDYA AJANSI'nın canlı veritabanı hafızasına tam erişimli Otonom AI Asistanısın.\n`;
  prompt += `Aşağıda ajansındaki canlı Supabase veritabanı bilgileri yer almaktadır:\n\n`;

  prompt += `📊 GENEL AJANS ÖZETİ:\n`;
  prompt += `- Toplam Kayıtlı İşletme: ${data.isletmeler.length} (${activeClients.length} aktif sözleşmeli)\n`;
  prompt += `- Toplam Çekim Kaydı: ${data.cekimler.length}\n`;
  prompt += `- Toplam Kurgu/Edit Kaydı: ${data.editler.length}\n`;
  prompt += `- Toplam Gelir: ₺${totalRevenue.toLocaleString('tr-TR')}\n`;
  prompt += `- Toplam Gider: ₺${totalExpenses.toLocaleString('tr-TR')}\n\n`;

  prompt += `🏢 İŞLETMELER VE ÖZEL AI NOTLARI:\n`;
  data.isletmeler.forEach((client, idx) => {
    prompt += `${idx + 1}. [${client.name}] (Durum: ${client.active ? 'Aktif' : 'Pasif'})\n`;
    prompt += `   - Paket Ücreti: ${client.fee}, Yetkili: ${client.contact}, Tel: ${client.phone}, IG: ${client.instagram}\n`;
    prompt += `   - Hedefler: ${client.monthlyReelsTarget || 10} Reels/ay, ${client.monthlyShootTarget || 2} Çekim/ay, Max ${client.maxDaysBetweenPosts || 3} gün aralık\n`;
    if (client.notes) {
      prompt += `   - 🧠 ÖZEL AI KRİTİK NOTLARI & HAFİZA: "${client.notes}"\n`;
    }
  });
  prompt += `\n`;

  prompt += `🎬 ÇEKİMLER:\n`;
  data.cekimler.slice(0, 15).forEach((s) => {
    prompt += `- ${s.client}: "${s.title}" (Tarih: ${s.date} ${s.time || ''}, Konum: ${s.location}, Durum: ${s.status})\n`;
  });
  prompt += `\n`;

  prompt += `🎞️ KONTROLDEKİ EDİTLER:\n`;
  data.editler.slice(0, 15).forEach((e) => {
    prompt += `- ${e.client}: "${e.title}" (Editör: ${e.editor}, Tür: ${e.type}, Teslim: ${e.deadline}, Durum: ${e.status})\n`;
  });
  prompt += `\n`;

  prompt += `👥 EKİP ÜYELERİ VE ROL DAĞILIMI:\n`;
  data.ekip.forEach((m) => {
    prompt += `- ${m.name} (${m.role}) - Kullanıcı Adı: @${m.username || 'yok'}\n`;
  });
  prompt += `\n`;

  prompt += `KURAL: Sadece veritabanında olan bilgileri esas al. Kullanıcının işletmeleri, çekimleri, kurguları veya özel notları sorulduğunda net, kesin ve profesyonel Türkçe ile cevap ver. Medya ve içerik yönetimi konusunda tavsiyeler ver.`;

  return prompt;
}

/**
 * Intelligent client-side fallback AI response generator if API key is not present
 */
export function processLocalAIChat(userQuery: string, data: DataContextPayload): string {
  const query = userQuery.trim().toLowerCase();

  // 1. İşletme sayısı sorgusu
  if (query.includes('kaç işletme') || query.includes('kaç müşteri') || query.includes('işletme sayısı') || query.includes('kaç tane müşterimiz var')) {
    const activeCount = data.isletmeler.filter((i) => i.active).length;
    const names = data.isletmeler.map((i) => `• <b>${i.name}</b> (${i.fee})`).join('\n');
    return `Ajansımızda toplam <b>${data.isletmeler.length}</b> adet kayıtlı işletme bulunuyor (${activeCount} aktif sözleşmeli):\n\n${names}\n\nHangi işletme hakkında detaylı bilgi almak istersiniz?`;
  }

  // 2. Özel notlar & Kritik durumlar
  if (query.includes('not') || query.includes('taviz') || query.includes('esnek') || query.includes('kritik') || query.includes('zor') || query.includes('özellik')) {
    const clientsWithNotes = data.isletmeler.filter((i) => i.notes && i.notes.trim().length > 0);
    if (clientsWithNotes.length === 0) {
      return `Henüz işletmelerinize eklenmiş özel AI kritik notu bulunmuyor. <b>İşletmeler</b> sayfasından veya detay kartından müşterilerinize *"Taviz vermeyen müşteri, zor video, reklam bütçesi var"* gibi notlar ekleyebilirsiniz!`;
    }
    let res = `🧠 <b>İşletmelerinize Ait Özel AI Hafıza Notları (${clientsWithNotes.length}):</b>\n\n`;
    clientsWithNotes.forEach((c) => {
      res += `🏢 <b>${c.name}</b>:\n"${c.notes}"\n\n`;
    });
    return res;
  }

  // 3. Editör / Ekip İş yükü sorgusu
  if (query.includes('editör') || query.includes('kurgu') || query.includes('iş yükü') || query.includes('ekip')) {
    const pendingEdits = data.editler.filter((e) => e.status !== 'ready' && e.status !== 'published');
    const workload: Record<string, number> = {};
    pendingEdits.forEach((e) => {
      const ed = e.editor.trim();
      workload[ed] = (workload[ed] || 0) + 1;
    });

    let res = `🎬 <b>Editör İş Yükü ve Kurgu Durumu (Aktif ${pendingEdits.length} Edit):</b>\n\n`;
    Object.entries(workload).forEach(([editor, count]) => {
      res += `• <b>${editor}</b>: ${count} aktif edit görevi\n`;
    });
    if (Object.keys(workload).length === 0) {
      res += `Şu an kurgu bekleyen aktif edit görevi bulunmuyor.`;
    }
    return res;
  }

  // 4. Çekimler sorgusu
  if (query.includes('çekim') || query.includes('günlük çekim') || query.includes('bugün') || query.includes('hafta')) {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayShoots = data.cekimler.filter((s) => s.date === todayStr);

    let res = `📸 <b>Çekim Durumu Raporu:</b>\n`;
    res += `Toplam planlı çekim sayısı: <b>${data.cekimler.length}</b>\n\n`;

    if (todayShoots.length > 0) {
      res += `<b>Bugünkü Çekimler:</b>\n`;
      todayShoots.forEach((s) => {
        res += `• <b>${s.client}</b>: ${s.title} (Saat: ${s.time || 'Belirtilmedi'}, Konum: ${s.location})\n`;
      });
    } else {
      res += `Bugün için planlanmış çekim bulunmuyor. Sıradaki gelecek çekimler:\n`;
      data.cekimler.slice(0, 3).forEach((s) => {
        res += `• <b>${s.client}</b> — ${s.title} (${s.date})\n`;
      });
    }
    return res;
  }

  // 5. Belirli bir işletme adı aranıyorsa
  const matchedClient = data.isletmeler.find((i) => query.includes(i.name.toLowerCase()));
  if (matchedClient) {
    const clientEdits = data.editler.filter((e) => isClientMatch(e.client, matchedClient.name));
    const clientShoots = data.cekimler.filter((s) => isClientMatch(s.client, matchedClient.name));
    const clientGelir = data.gelirler.filter((g) => isClientMatch(g.client, matchedClient.name));

    let res = `🏢 <b>${matchedClient.name} İşletme Raporu:</b>\n`;
    res += `• <b>Paket Ücreti:</b> ${matchedClient.fee}\n`;
    res += `• <b>Yetkili:</b> ${matchedClient.contact} (${matchedClient.phone})\n`;
    res += `• <b>Sosyal Medya:</b> ${matchedClient.instagram}\n`;
    res += `• <b>Aylık Hedefler:</b> ${matchedClient.monthlyReelsTarget || 10} Reels, ${matchedClient.monthlyShootTarget || 2} Çekim, Max ${matchedClient.maxDaysBetweenPosts || 3} Gün Aralık\n`;
    res += `• <b>Çekim Sayısı:</b> ${clientShoots.length} kayıtlı çekim\n`;
    res += `• <b>Edit Sayısı:</b> ${clientEdits.length} kurgu kaydı\n`;
    if (matchedClient.notes) {
      res += `• 🧠 <b>Özel AI Notu:</b> "${matchedClient.notes}"\n`;
    }
    return res;
  }

  // 6. Finans sorgusu
  if (query.includes('gelir') || query.includes('gider') || query.includes('para') || query.includes('bütçe') || query.includes('finans')) {
    const totalRevenue = data.gelirler.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const totalExpenses = data.giderler.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const netBalance = totalRevenue - totalExpenses;

    return `💰 <b>Finansal Durum Özetiniz:</b>\n\n` +
           `• <b>Toplam Gelir:</b> ₺${totalRevenue.toLocaleString('tr-TR')}\n` +
           `• <b>Toplam Gider:</b> ₺${totalExpenses.toLocaleString('tr-TR')}\n` +
           `• <b>Net Kasa Durumu:</b> ₺${netBalance.toLocaleString('tr-TR')}\n\n` +
           `Geciken ödemelerinizi incelemek için Gelirler modülünü kontrol edebilirsiniz.`;
  }

  // Varsayılan genel cevap
  return `Anlaşıldı! Veritabanındaki **${data.isletmeler.length} işletmeniz**, çekimleriniz, editleriniz ve finansal kayıtlarınız zihnimde anlık olarak günceldir.\n\n` +
         `Bana örneğin şunları sorabilirsiniz:\n` +
         `• <i>"Kaç işletmem var?"</i>\n` +
         `• <i>"Taviz vermeyen ve zor videolar isteyen müşteriler kimler?"</i>\n` +
         `• <i>"Editör iş yükümüz nasıl?"</i>\n` +
         `• <i>"Bugün ne çekimimiz var?"</i>\n` +
         `• <i>"ModaPlus hakkında bilgi ver"</i>`;
}
