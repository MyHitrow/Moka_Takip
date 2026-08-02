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

export interface AIExecutedAction {
  type: 'ADD_SHOOT' | 'ADD_EDIT' | 'ADD_NOTE' | 'ADD_EXPENSE' | 'ADD_INCOME';
  payload: any;
  summary: string;
}

/**
 * Serializes current database state into a rich structured text context for LLMs
 */
export function buildAgencySystemPrompt(data: DataContextPayload): string {
  const activeClients = data.isletmeler.filter((i) => i.active);
  const totalRevenue = data.gelirler.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpenses = data.giderler.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  let prompt = `Sen MOKA CREATIVE AGENCY'nin canlı veritabanı hafızasına ve EYLEM/YAZMA yetkisine sahip Otonom AI Asistanısın.\n`;
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

  prompt += `KURAL: Sadece veritabanında olan bilgileri esas al. Kullanıcının işletmeleri, çekimleri, kurguları veya özel notları sorulduğunda net, kesin ve profesyonel Türkçe ile cevap ver. Çekim veya edit ekleme istekleri geldiğinde işlemi onaylayıp kaydedildiğini bildir.`;

  return prompt;
}

/**
 * Helper to calculate target date string YYYY-MM-DD from Turkish relative date keywords
 */
function parseTargetDate(query: string): string {
  const now = new Date();
  if (query.includes('yarın') || query.includes('yarin')) {
    now.setDate(now.getDate() + 1);
  } else if (query.includes('öbür gün') || query.includes('obur gun')) {
    now.setDate(now.getDate() + 2);
  }
  return now.toISOString().split('T')[0];
}

/**
 * Intelligent AI Command & Intent Parser to create Shoots, Edits, Notes, Expenses from chat input
 */
export function parseAICommandsAndIntent(userQuery: string, data: DataContextPayload): {
  actions: AIExecutedAction[];
  textReply: string;
} {
  const query = userQuery.trim();
  const lower = query.toLowerCase();
  const actions: AIExecutedAction[] = [];

  // Check for SHOOT CREATION Intent
  const isShootIntent =
    lower.includes('çekim') ||
    lower.includes('cekim') ||
    lower.includes('çekimi') ||
    lower.includes('saat') ||
    lower.includes('yaz') ||
    lower.includes('ekle') ||
    lower.includes('planla');

  if (isShootIntent) {
    const targetDate = parseTargetDate(lower);

    // Try matching any registered business or candidate names in the user query
    // e.g., "yarın saat 10 a luness 3 e dutt 6 ya sun brother pizza çekimi yaz"
    const foundClients: { clientName: string; time: string }[] = [];

    // Common time regex patterns: 10'a, 10:00, saat 10, 3'e, 15:00, 6'ya, 18:00
    // Split query by segments or test clients against query
    data.isletmeler.forEach((biz) => {
      const bizName = biz.name.toLowerCase();
      // Match if client name or first word is in query
      const firstWord = bizName.split(' ')[0];
      if (lower.includes(bizName) || (firstWord.length >= 3 && lower.includes(firstWord))) {
        // Extract time near client name or index
        let time = '12:00';
        const clientIndex = lower.indexOf(firstWord);
        const subBefore = lower.substring(Math.max(0, clientIndex - 25), clientIndex);
        const subAfter = lower.substring(clientIndex, Math.min(lower.length, clientIndex + 25));
        const combinedSub = `${subBefore} ${subAfter}`;

        // Look for numbers like 10, 3, 6, 15, 18
        if (combinedSub.includes('10')) time = '10:00';
        else if (combinedSub.includes('11')) time = '11:00';
        else if (combinedSub.includes('12')) time = '12:00';
        else if (combinedSub.includes('13') || combinedSub.includes("1'e") || combinedSub.includes("1'ya")) time = '13:00';
        else if (combinedSub.includes('14') || combinedSub.includes("2'ye") || combinedSub.includes("2'de")) time = '14:00';
        else if (combinedSub.includes('15') || combinedSub.includes("3'e") || combinedSub.includes("3'de") || combinedSub.includes(' 3 ')) time = '15:00';
        else if (combinedSub.includes('16') || combinedSub.includes("4'e")) time = '16:00';
        else if (combinedSub.includes('17') || combinedSub.includes("5'e")) time = '17:00';
        else if (combinedSub.includes('18') || combinedSub.includes("6'ya") || combinedSub.includes("6'da") || combinedSub.includes(' 6 ')) time = '18:00';
        else if (combinedSub.includes('19') || combinedSub.includes("7'ye")) time = '19:00';
        else if (combinedSub.includes('20') || combinedSub.includes("8'e")) time = '20:00';

        foundClients.push({ clientName: biz.name, time });
      }
    });

    // Also extract raw client names if not in database yet (e.g. Luness, Dutt, Sun Brother Pizza)
    if (foundClients.length === 0) {
      // Fallback extraction for names mentioned in query
      const words = ['luness', 'dutt', 'sun brother', 'modaplus', 'groupama', 'techmarket', 'cafe nero'];
      words.forEach((w) => {
        if (lower.includes(w)) {
          let time = '14:00';
          if (lower.includes('10')) time = '10:00';
          if (lower.includes('3') || lower.includes('15')) time = '15:00';
          if (lower.includes('6') || lower.includes('18')) time = '18:00';
          const capName = w.charAt(0).toUpperCase() + w.slice(1);
          foundClients.push({ clientName: capName, time });
        }
      });
    }

    if (foundClients.length > 0) {
      foundClients.forEach((fc) => {
        actions.push({
          type: 'ADD_SHOOT',
          payload: {
            client: fc.clientName,
            title: 'Sosyal Medya Video Çekimi',
            date: targetDate,
            time: fc.time,
            location: 'İşletme Adresi / Çekim Alanı',
            status: 'planned',
          },
          summary: `🎬 <b>${fc.clientName}</b> — ${targetDate} @ ${fc.time}`,
        });
      });

      let textReply = `✅ <b>${actions.length} ADET ÇEKİM VERİTABANINA BAŞARIYLA EKLENDİ VE İŞLENDİ:</b>\n\n`;
      actions.forEach((act) => {
        textReply += `• ${act.summary}\n`;
      });
      textReply += `\nÇekimler modülünden ve takvimden tüm detayları kontrol edebilirsiniz! 🎉`;

      return { actions, textReply };
    }
  }

  // Fallback to query processor if no specific creation action was parsed
  const textReply = processLocalAIChat(userQuery, data);
  return { actions, textReply };
}

/**
 * Intelligent client-side fallback AI response generator if API key is not present
 */
export function processLocalAIChat(userQuery: string, data: DataContextPayload): string {
  const query = userQuery.trim().toLowerCase();

  // 1. Selamlaşma / Hatır sorma
  if (
    query === 'selam' ||
    query === 'merhaba' ||
    query.startsWith('selam') ||
    query.startsWith('merhaba') ||
    query.includes('nasılsın') ||
    query.includes('naber')
  ) {
    const activeCount = data.isletmeler.filter((i) => i.active).length;
    return `Selamlar! Ben MOKA CREATIVE AGENCY canlı veritabanı hafızasına sahip AI Asistanınızım. 🤖\n\nŞu an sistemde <b>${data.isletmeler.length} işletmeniz</b> (${activeCount} aktif), planlı çekimleriniz ve kurgularınız güncel olarak zihnimdedir.\n\nBana <i>"İşletmelerimizi listele"</i>, <i>"Editör yükü nasıl?"</i> veya <i>"Yarın 10'a X çekimi yaz"</i> diyebilirsiniz!`;
  }

  // 2. STKATEJİK ANALİZ: Düşük Getiri / Düşük Ciro / Zahmetli İşletmeler
  if (
    query.includes('düşük getiri') ||
    query.includes('düşük ciro') ||
    query.includes('az kazandıran') ||
    query.includes('verimsiz') ||
    query.includes('zahmetli') ||
    query.includes('yükü fazla')
  ) {
    if (data.isletmeler.length === 0) {
      return `Veritabanında kayıtlı işletme bulunmuyor.`;
    }

    // Sort clients by numeric fee ascending
    const parsedClients = data.isletmeler.map((biz) => {
      const numFee = Number(biz.fee.replace(/[^0-9.]/g, '')) || 0;
      const reelsTarget = biz.monthlyReelsTarget || 10;
      const costPerReel = reelsTarget > 0 ? Math.round(numFee / reelsTarget) : numFee;
      return { ...biz, numFee, costPerReel };
    });

    parsedClients.sort((a, b) => a.numFee - b.numFee);
    const lowReturnClients = parsedClients.slice(0, 5);

    let res = `📊 <b>İçerik & Planlama Açısından Düşük Getiri / Yüksek Efor Sağlayan İşletmeler:</b>\n\n`;
    lowReturnClients.forEach((c, idx) => {
      res += `${idx + 1}. <b>${c.name}</b> — Aylık Paket: <b>${c.fee}</b>\n`;
      res += `   • Aylık Reels Hedefi: ${c.monthlyReelsTarget || 10} adet (Video başına ~₺${c.costPerReel})\n`;
      if (c.notes) res += `   • 🧠 AI Notu: "${c.notes}"\n`;
      res += `\n`;
    });

    res += `💡 <b>Stratejik AI Tavsiyesi:</b> Bu işletmelerin prodüksiyon ve kurgu yükü paket ücretlerine kıyasla ajans marjınızı düşürüyor olabilir. Yenileme döneminde fiyat revizesi yapılmasını veya içerik adedinin opsiyonel sunulmasını öneririm.`;
    return res;
  }

  // 3. STRATEJİK ANALİZ: Kaybetmememiz Gereken / Hayati Önemdeki / Yüksek Cirolu Müşteriler
  if (
    query.includes('kaybetmemem') ||
    query.includes('kaybetmemek') ||
    query.includes('zora girmemek') ||
    query.includes('en önemli') ||
    query.includes('kritik müşteri') ||
    query.includes('yüksek ciro') ||
    query.includes('en çok kazandıran')
  ) {
    if (data.isletmeler.length === 0) {
      return `Veritabanında kayıtlı işletme bulunmuyor.`;
    }

    const parsedClients = data.isletmeler.map((biz) => {
      const numFee = Number(biz.fee.replace(/[^0-9.]/g, '')) || 0;
      return { ...biz, numFee };
    });

    // Sort clients by fee descending
    parsedClients.sort((a, b) => b.numFee - a.numFee);
    const topClients = parsedClients.slice(0, 5);
    const totalAgencyRev = parsedClients.reduce((acc, c) => acc + c.numFee, 0);

    let res = `💎 <b>MOKA CREATIVE AGENCY İçin Finansal Hayati Önem Taşıyan Müşteriler:</b>\n`;
    res += `<i>(Ajans nakit akışınızın temel direği olan en yüksek cirolu işletmeler)</i>\n\n`;

    topClients.forEach((c, idx) => {
      const share = totalAgencyRev > 0 ? Math.round((c.numFee / totalAgencyRev) * 100) : 0;
      res += `${idx + 1}. 🌟 <b>${c.name}</b> — Aylık Ciro: <b>${c.fee}</b> (Ajans Cirosunun %${share}'i)\n`;
      res += `   • Yetkili: ${c.contact} (${c.phone})\n`;
      if (c.notes) res += `   • 🧠 Özel Not: "${c.notes}"\n`;
      res += `\n`;
    });

    res += `👑 <b>Stratejik AI Uyarısı:</b> Zora girmemek ve ajans karlılığını korumak için bu müşterilerle VIP iletişim sürdürülmeli, teslimat süreleri ve memnuniyetleri 7/24 yakından takip edilmelidir!`;
    return res;
  }

  // 4. İşletme / Müşteri Listesi Sorgusu (Örn: "işletmeleri listeler misin", "müşterilerimizi göster", "kaç işletmem var")
  const isBusinessListIntent =
    query.includes('işletme') ||
    query.includes('isletme') ||
    query.includes('müşteri') ||
    query.includes('musteri') ||
    query.includes('listele') ||
    query.includes('listelr') ||
    query.includes('liste') ||
    query.includes('hangileri') ||
    query.includes('kimler');

  if (isBusinessListIntent && !query.includes('not') && !query.includes('taviz') && !query.includes('kritik')) {
    const activeClients = data.isletmeler.filter((i) => i.active);
    if (data.isletmeler.length === 0) {
      return `Henüz veritabanında kayıtlı bir işletmeniz bulunmuyor. <b>İşletmeler</b> sayfasından yeni müşteri ekleyebilirsiniz.`;
    }

    let res = `🏢 <b>MOKA CREATIVE AGENCY Kayıtlı İşletme Listesi (${data.isletmeler.length} İşletme / ${activeClients.length} Aktif):</b>\n\n`;
    data.isletmeler.forEach((b, idx) => {
      const noteStr = b.notes ? ` 🧠 <i>"${b.notes}"</i>` : '';
      res += `${idx + 1}. <b>${b.name}</b> — Paket: ${b.fee} (${b.active ? '🟢 Aktif' : '🔴 Pasif'})\n`;
      res += `   - Yetkili: ${b.contact} (${b.phone}) | IG: ${b.instagram}\n`;
      res += `   - Hedefler: ${b.monthlyReelsTarget || 10} Reels/ay, ${b.monthlyShootTarget || 2} Çekim/ay${noteStr}\n\n`;
    });

    res += `Hangi işletmenin çekimleri veya editleri hakkında detaylı bilgi almak istersiniz?`;
    return res;
  }

  // 3. Özel notlar & Kritik durumlar
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

  // 4. Editör / Ekip İş yükü sorgusu
  if (query.includes('editör') || query.includes('kurgu') || query.includes('iş yükü') || query.includes('ekip') || query.includes('edit')) {
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

  // 5. Çekimler sorgusu
  if (query.includes('çekim') || query.includes('cekim') || query.includes('günlük çekim') || query.includes('bugün') || query.includes('hafta')) {
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

  // 6. Belirli bir işletme adı aranıyorsa
  const matchedClient = data.isletmeler.find((i) => query.includes(i.name.toLowerCase()));
  if (matchedClient) {
    const clientEdits = data.editler.filter((e) => isClientMatch(e.client, matchedClient.name));
    const clientShoots = data.cekimler.filter((s) => isClientMatch(s.client, matchedClient.name));

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

  // 7. Finans sorgusu
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
         `Bana örneğin şunları yazabilirsiniz:\n` +
         `• <i>"Yarın saat 10'a Luness, 3'e Dutt, 6'ya Sun Brother Pizza çekimi yaz."</i> (Otomatik Veritabanına Ekler)\n` +
         `• <i>"Kaç işletmem var?"</i>\n` +
         `• <i>"Taviz vermeyen ve zor videolar isteyen müşteriler kimler?"</i>\n` +
         `• <i>"Editör iş yükümüz nasıl?"</i>`;
}
