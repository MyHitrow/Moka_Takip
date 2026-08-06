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
  const isFinanceRestricted = data.isletmeler.some((i) => i.fee && (i.fee.includes('Gizli') || i.fee.includes('Yetkiniz')));
  const activeClients = data.isletmeler.filter((i) => i.active);
  const totalRevenue = data.gelirler.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpenses = data.giderler.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  let prompt = `Sen MOKA CREATIVE AGENCY'nin Baş Stratejisti, Dijital Prodüksiyon Direktörü ve canlı veritabanı hafızasına tam erişimli Akıllı AI Ortağısın.\n`;
  prompt += `Senin görevin: Ajans sahibine veya yetkili ajans çalışanına veritabanı bilgileri sunmak ve yardım etmektir.\n\n`;

  if (isFinanceRestricted) {
    prompt += `🔒 HASSAS FİNANSAL GİZLİLİK UYARISI: Bu kullanıcının finansal verilere, gelir/giderlere, cirolara ve paket ücretlerine erişim yetkisi KISITLANMIŞTIR.\n`;
    prompt += `Kullanıcı sana gelir, gider, ciro, bütçe, kazanç, en çok kazandıran müşteriler veya paket ücretleri sorarsa KESİNLİKLE hiçbir finansal rakam üretme ve sadece "🔒 Finansal verileri görüntüleme ve sorgulama yetkiniz bulunmamaktadır. Lütfen Süper Admin ile iletişime geçin." yanıtını ver.\n\n`;
  }

  prompt += `📊 ANLIK CANLI VERİTABANI ÖZETİ:\n`;
  prompt += `- Ajans İsmi: MOKA CREATIVE AGENCY\n`;
  prompt += `- Toplam Kayıtlı İşletme: ${data.isletmeler.length} (${activeClients.length} aktif sözleşmeli)\n`;
  prompt += `- Toplam Çekim Kaydı: ${data.cekimler.length}\n`;
  prompt += `- Toplam Kurgu/Edit Görevi: ${data.editler.length}\n`;
  if (!isFinanceRestricted) {
    prompt += `- Toplam Gelir: ₺${totalRevenue.toLocaleString('tr-TR')}\n`;
    prompt += `- Toplam Gider: ₺${totalExpenses.toLocaleString('tr-TR')}\n\n`;
  } else {
    prompt += `- Toplam Gelir/Gider: [GİZLİ / KISITLI ERİŞİM]\n\n`;
  }

  prompt += `🏢 İŞLETMELER, ÜCRETLER VE KRİTİK HAFİZA NOTLARI:\n`;
  data.isletmeler.forEach((client, idx) => {
    prompt += `${idx + 1}. [${client.name}] (${client.active ? '🟢 Aktif' : '🔴 Pasif'})\n`;
    prompt += `   - Paket Ücreti: ${client.fee}, Yetkili: ${client.contact}, Tel: ${client.phone}, IG: ${client.instagram}\n`;
    prompt += `   - Hedefler: ${client.monthlyReelsTarget || 10} Reels/ay, ${client.monthlyShootTarget || 2} Çekim/ay, Max ${client.maxDaysBetweenPosts || 3} Gün Aralık\n`;
    if (client.notes) {
      prompt += `   - 🧠 ÖZEL AI KRİTİK HAFİZA NOTU: "${client.notes}"\n`;
    }
  });
  prompt += `\n`;

  prompt += `🎬 PLANLANAN VE TAMAMLANAN ÇEKİMLER:\n`;
  data.cekimler.slice(0, 20).forEach((s) => {
    prompt += `- ${s.client}: "${s.title}" (Tarih: ${s.date} ${s.time || ''}, Konum: ${s.location}, Durum: ${s.status})\n`;
  });
  prompt += `\n`;

  prompt += `🎞️ EDİTÖR KURGU GÖREVLERİ:\n`;
  data.editler.slice(0, 20).forEach((e) => {
    prompt += `- ${e.client}: "${e.title}" (Editör: ${e.editor}, Tür: ${e.type}, Teslim: ${e.deadline}, Durum: ${e.status})\n`;
  });
  prompt += `\n`;

  prompt += `👥 EKİP KADROSU:\n`;
  data.ekip.forEach((m) => {
    prompt += `- ${m.name} (${m.role}) - Kullanıcı Adı: @${m.username || 'yok'}\n`;
  });
  prompt += `\n`;

  prompt += `DURUS VE KONUŞMA USLUBU:\n`;
  prompt += `1. Kullanıcı senin ajans ortağındır. Samimi, özgüvenli, akıllı, yardımsever ve son derece kıvrak bir Türkçe ile konuş.\n`;
  prompt += `2. Kullanıcı işletmeler, verim, cirolar, zor müşteriler veya ekip hakkında fikir sorduğunda yukarıdaki veritabanı verilerini derinlemesine analiz et.\n`;
  prompt += `3. İçerik fikirleri, video kurgu tavsiyeleri, müşteri yönetim stratejileri veya ajans karlılığını artıracak fikirler üret.\n`;
  prompt += `4. Veritabanındaki tüm işletme isimlerini, yetkililerini ve özel notları anında hatırla ve doğal biçimde sohbetin içinde kullan.`;

  return prompt;
}

/**
 * Helper to calculate target date string YYYY-MM-DD from Turkish relative date keywords and days of week
 */
function parseTargetDate(query: string): string {
  const lower = query.toLowerCase();
  const now = new Date();

  // "X gün içinde" or "X gün sonra"
  const daysMatch = lower.match(/(\d+)\s*gün/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    now.setDate(now.getDate() + days);
    return now.toISOString().split('T')[0];
  }

  if (lower.includes('yarın') || lower.includes('yarin')) {
    now.setDate(now.getDate() + 1);
    return now.toISOString().split('T')[0];
  }
  if (lower.includes('öbür gün') || lower.includes('obur gun')) {
    now.setDate(now.getDate() + 2);
    return now.toISOString().split('T')[0];
  }

  // Days of week in Turkish
  const daysMap: Record<string, number> = {
    pazartesi: 1, salı: 2, sali: 2, çarşamba: 3, carsamba: 3,
    perşembe: 4, persembe: 4, cuma: 5, cumartesi: 6, pazar: 0,
  };

  for (const [dayName, targetDayIdx] of Object.entries(daysMap)) {
    if (lower.includes(dayName)) {
      const currentDayIdx = now.getDay();
      let diff = targetDayIdx - currentDayIdx;
      if (diff <= 0) diff += 7; // Next occurrence
      now.setDate(now.getDate() + diff);
      return now.toISOString().split('T')[0];
    }
  }

  return now.toISOString().split('T')[0];
}

/**
 * Matches a registered business name from user query
 */
function matchClientNameFromQuery(query: string, clients: Isletme[]): string | null {
  const lower = query.toLowerCase();
  for (const biz of clients) {
    const bizNameLower = biz.name.toLowerCase();
    const firstWord = bizNameLower.split(' ')[0];
    if (lower.includes(bizNameLower) || (firstWord.length >= 3 && lower.includes(firstWord))) {
      return biz.name;
    }
  }
  return null;
}

/**
 * Flexible Turkish Synonym Checker
 */
function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw));
}

/**
 * Intelligent AI Command & Intent Parser to create Shoots, Edits, Notes, Expenses, Incomes from chat input
 */
export function parseAICommandsAndIntent(userQuery: string, data: DataContextPayload): {
  actions: AIExecutedAction[];
  textReply: string;
} {
  const query = userQuery.trim();
  const lower = query.toLowerCase();
  const actions: AIExecutedAction[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  // Synonyms for Income (Gelir / Tahsilat)
  const incomeKeywords = [
    'gelir', 'ödeme', 'odeme', 'tahsilat', 'para geldi', 'para aldık', 'para aldik',
    'ödendi', 'odendi', 'ödedi', 'odedi', 'ücret aldık', 'ucret aldik', 'hesaba yattı',
    'hesaba yatti', 'para yattı', 'para yatti', 'havale geldi', 'eft geldi', 'paket ücreti'
  ];

  // Synonyms for Expense (Gider / Harcama)
  const expenseKeywords = [
    'gider', 'harcama', 'yakıt', 'yakit', 'benzin', 'avans', 'aldım', 'aldim', 'aldık', 'aldik',
    'ödedim', 'odedim', 'ödedik', 'odedik', 'harcadım', 'harcadim', 'harcadık', 'harcadik',
    'fatura', 'kira', 'satın aldım', 'satin aldim', 'ücret ödedik', 'ucret odedik'
  ];

  // Synonyms for Edit & Revision (Edit / Revize / Kurgu)
  const editKeywords = [
    'revize', 'revizesi', 'kurgu', 'kurgusu', 'edit', 'editi', 'montaj', 'montajı',
    'düzenlenecek', 'duzenlenecek', 'düzeltilecek', 'duzeltilecek', 'kurgulanacak', 'video yapılacak'
  ];

  // Synonyms for Shoot (Çekim)
  const shootKeywords = [
    'çekim', 'cekim', 'çekimi', 'saat', 'planla', 'çekilecek', 'cekilecek', 'çekeceğiz',
    'cekecegiz', 'çekmeye gideceğiz', 'cekmeye gidecegiz', 'çekim var', 'cekim var'
  ];

  // ─── 1. GİDER EKLEME NİYETİ (EXPENSE INTENT) ──────────────────────────────
  const isExpenseIntent = containsAny(lower, expenseKeywords) && (lower.includes('gider') || lower.includes('harcam') || lower.includes('yakıt') || lower.includes('avans') || lower.includes('tl') || lower.includes('lira') || lower.includes('₺'));

  if (isExpenseIntent) {
    const amountMatch = lower.match(/(\d+)\s*(tl|₺|lira)?/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    if (amount > 0) {
      let category = 'office';
      if (containsAny(lower, ['yakıt', 'yakit', 'benzin', 'araba', 'taksi', 'ulaşım', 'ulasim'])) {
        category = 'transportation';
      } else if (containsAny(lower, ['avans', 'maaş', 'maas', 'personel', 'prim'])) {
        category = 'personnel';
      } else if (containsAny(lower, ['yemek', 'restoran', 'kahve', 'kurye', 'gıda'])) {
        category = 'food';
      } else if (containsAny(lower, ['ekipman', 'kamera', 'lens', 'ışık', 'isik', 'tripod'])) {
        category = 'equipment';
      } else if (containsAny(lower, ['yazılım', 'yazilim', 'lisans', 'adobe', 'plugin', 'sunucu'])) {
        category = 'software';
      }

      let paidBy = 'Şirket Hesabı';
      if (lower.includes('kadir')) paidBy = 'Kadir';
      else if (lower.includes('caner')) paidBy = 'Caner';
      else if (lower.includes('alim')) paidBy = 'Alim';

      let title = 'Genel Harcama';
      if (containsAny(lower, ['yakıt', 'yakit', 'benzin'])) title = 'Yakıt / Benzin Gideri';
      else if (containsAny(lower, ['avans'])) title = 'Personel Avans Ödemesi';
      else if (containsAny(lower, ['yemek'])) title = 'Yemek Gideri';
      else if (containsAny(lower, ['kira'])) title = 'Ofis Kirası';
      else title = query.length < 50 ? query : 'Ofis / Operasyon Gideri';

      if (lower.includes('kadirin araba') || lower.includes('kadir araba')) {
        title = "Kadir'in Araba - Yakıt Gideri";
        paidBy = 'Kadir';
      }

      const targetDate = parseTargetDate(lower);

      actions.push({
        type: 'ADD_EXPENSE',
        payload: {
          title,
          category,
          amount,
          date: targetDate,
          paidBy,
        },
        summary: `💳 <b>₺${amount.toLocaleString('tr-TR')}</b> — "${title}" (${paidBy})`,
      });

      let textReply = `✅ <b>GİDER VERİTABANINA BAŞARIYLA EKLENDİ VE İŞLENDİ:</b>\n\n`;
      textReply += `• Tutar: <b>₺${amount.toLocaleString('tr-TR')}</b>\n`;
      textReply += `• Başlık / Açıklama: <b>${title}</b>\n`;
      textReply += `• Ödeyen: <b>${paidBy}</b>\n`;
      textReply += `• Tarih: <b>${targetDate}</b>\n\n`;
      textReply += `Giderler modülünüzden ve grafik analizinizden tüm harcamaları kontrol edebilirsiniz! 💸`;

      return { actions, textReply };
    }
  }

  // ─── 2. GELİR EKLEME NİYETİ (INCOME INTENT) ───────────────────────────────
  const isIncomeIntent = containsAny(lower, incomeKeywords) && (lower.includes('para') || lower.includes('ödeme') || lower.includes('odeme') || lower.includes('tahsilat') || lower.includes('gelir') || lower.includes('yattı') || lower.includes('yatti') || lower.includes('aldık') || lower.includes('aldik'));

  if (isIncomeIntent) {
    const amountMatch = lower.match(/(\d+)\s*(tl|₺|lira)?/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const matchedClient = matchClientNameFromQuery(query, data.isletmeler);
    const clientName = matchedClient || 'Müşteri';

    if (amount > 0) {
      const isPaid = containsAny(lower, ['yaptı', 'yapti', 'ödendi', 'odendi', 'geldi', 'yattı', 'yatti', 'aldık', 'aldik', 'ödedi', 'odedi']);

      actions.push({
        type: 'ADD_INCOME',
        payload: {
          client: clientName,
          description: `${clientName} - Tahsilat / Ödeme`,
          amount,
          date: todayStr,
          status: isPaid ? 'paid' : 'pending',
          paidAmount: isPaid ? amount : 0,
        },
        summary: `💰 <b>${clientName}</b> — ₺${amount.toLocaleString('tr-TR')}`,
      });

      let textReply = `✅ <b>GELİR KAYDI VERİTABANINA EKLENDİ:</b>\n\n`;
      textReply += `• Müşteri: <b>${clientName}</b>\n`;
      textReply += `• Tutar: <b>₺${amount.toLocaleString('tr-TR')}</b>\n`;
      textReply += `• Durum: <b>${isPaid ? '🟢 Ödendi' : '🟡 Bekliyor'}</b>\n\n`;
      textReply += `Gelirler modülünden finansal detayları inceleyebilirsiniz! 💵`;

      return { actions, textReply };
    }
  }

  // ─── 3. EDİT & REVİZE EKLEME NİYETİ (EDIT INTENT) ─────────────────────────
  const isEditIntent = containsAny(lower, editKeywords);

  if (isEditIntent) {
    const matchedClient = matchClientNameFromQuery(query, data.isletmeler);
    const clientName = matchedClient || 'Genel İşletme';
    const targetDate = parseTargetDate(lower);

    let editType = 'Reels';
    if (containsAny(lower, ['sinematik', 'kurumsal'])) editType = 'Kurumsal Video';
    else if (lower.includes('post')) editType = 'Post';
    else if (lower.includes('story')) editType = 'Story';
    else if (lower.includes('youtube')) editType = 'YouTube';

    let title = `${clientName} Video Editi`;
    if (containsAny(lower, ['revize', 'revizesi'])) {
      title = `${clientName} Sinematik Video Revizesi`;
    }

    actions.push({
      type: 'ADD_EDIT',
      payload: {
        title,
        client: clientName,
        type: editType,
        editor: 'Atanmadı',
        deadline: targetDate,
        status: containsAny(lower, ['revize', 'revizesi']) ? 'revision' : 'editing',
      },
      summary: `🎬 <b>${clientName}</b> — "${title}" (Teslim: ${targetDate})`,
    });

    let textReply = `✅ <b>KURGU / REVİZE GÖREVİ VERİTABANINA EKLENDİ:</b>\n\n`;
    textReply += `• İşletme: <b>${clientName}</b>\n`;
    textReply += `• Görev: <b>${title}</b>\n`;
    textReply += `• Teslim Tarihi: <b>${targetDate}</b>\n`;
    textReply += `• Durum: <b>${containsAny(lower, ['revize', 'revizesi']) ? '🔴 Revizede' : '🎬 Kurguda'}</b>\n\n`;
    textReply += `Editler modülünüzden kurgu durumunu ve editör atamasını yönetebilirsiniz! 🍿`;

    return { actions, textReply };
  }

  // ─── 4. ÇEKİM PLANLAMA NİYETİ (SHOOT INTENT) ──────────────────────────────
  const isShootIntent = containsAny(lower, shootKeywords);

  if (isShootIntent) {
    const targetDate = parseTargetDate(lower);
    const foundClients: { clientName: string; time: string; title: string }[] = [];

    data.isletmeler.forEach((biz) => {
      const bizName = biz.name.toLowerCase();
      const firstWord = bizName.split(' ')[0];
      if (lower.includes(bizName) || (firstWord.length >= 3 && lower.includes(firstWord))) {
        let time = '12:00';
        const clientIndex = lower.indexOf(firstWord);
        const subBefore = lower.substring(Math.max(0, clientIndex - 25), clientIndex);
        const subAfter = lower.substring(clientIndex, Math.min(lower.length, clientIndex + 25));
        const combinedSub = `${subBefore} ${subAfter}`;

        if (combinedSub.includes('10')) time = '10:00';
        else if (combinedSub.includes('11')) time = '11:00';
        else if (combinedSub.includes('12')) time = '12:00';
        else if (combinedSub.includes('13') || combinedSub.includes("1'e")) time = '13:00';
        else if (combinedSub.includes('14') || combinedSub.includes("2'ye")) time = '14:00';
        else if (combinedSub.includes('15') || combinedSub.includes("3'e") || combinedSub.includes(' 3 ')) time = '15:00';
        else if (combinedSub.includes('16') || combinedSub.includes("4'e")) time = '16:00';
        else if (combinedSub.includes('17') || combinedSub.includes("5'e")) time = '17:00';
        else if (combinedSub.includes('18') || combinedSub.includes("6'ya") || combinedSub.includes(' 6 ')) time = '18:00';

        let shootTitle = 'Sosyal Medya Video Çekimi';
        if (lower.includes('sinematik') || lower.includes('reels')) {
          shootTitle = 'Sinematik Reels Video Çekimi';
        }

        foundClients.push({ clientName: biz.name, time, title: shootTitle });
      }
    });

    if (foundClients.length === 0) {
      const parts = lower.split(/çekimi|çekim|yaz|ekle|planla/);
      if (parts.length > 0) {
        const potentialName = parts[0].replace(/yarın|yarin|obur|öbür|gun|gün|saat|\d+('a|'e|'ya|'ye|:00)?/gi, '').trim();
        if (potentialName.length >= 2) {
          const capName = potentialName.charAt(0).toUpperCase() + potentialName.slice(1);
          let time = '14:00';
          if (lower.includes('10')) time = '10:00';
          else if (lower.includes('15') || lower.includes("3'e")) time = '15:00';
          else if (lower.includes('18') || lower.includes("6'ya")) time = '18:00';
          foundClients.push({ clientName: capName, time, title: 'Sosyal Medya Video Çekimi' });
        }
      }
    }

    if (foundClients.length > 0) {
      foundClients.forEach((fc) => {
        actions.push({
          type: 'ADD_SHOOT',
          payload: {
            client: fc.clientName,
            title: fc.title,
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

  // ─── 5. HAFTALIK NOT / GÖREV NİYETİ (NOTE INTENT) ─────────────────────────
  if (lower.includes('not') && (lower.includes('ekle') || lower.includes('al') || lower.includes('yaz'))) {
    const matchedClient = matchClientNameFromQuery(query, data.isletmeler);
    
    actions.push({
      type: 'ADD_NOTE',
      payload: {
        content: query,
        client: matchedClient || undefined,
      },
      summary: `📝 <b>Not:</b> "${query}"`,
    });

    let textReply = `✅ <b>YAPILACAK GÖREV / NOT VERİTABANINA EKLENDİ:</b>\n\n`;
    textReply += `• Not: <b>"${query}"</b>\n`;
    if (matchedClient) textReply += `• İlgili İşletme: <b>${matchedClient}</b>\n`;
    textReply += `\nDashboard haftalık notlar kısmından görevi takip edebilirsiniz! 📌`;

    return { actions, textReply };
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
  const isFinanceRestricted = data.isletmeler.some((i) => i.fee && (i.fee.includes('Gizli') || i.fee.includes('Yetkiniz')));
  const isFinanceQuery =
    query.includes('gelir') ||
    query.includes('gider') ||
    query.includes('para') ||
    query.includes('bütçe') ||
    query.includes('finans') ||
    query.includes('ciro') ||
    query.includes('kazanç') ||
    query.includes('kazandıran') ||
    query.includes('düşük getiri') ||
    query.includes('paket ücreti');

  if (isFinanceRestricted && isFinanceQuery) {
    return `🔒 <b>Erişim Engellendi:</b> Finansal verileri görüntüleme ve AI ile sorgulama yetkiniz bulunmamaktadır. Lütfen Süper Admin ile iletişime geçin.`;
  }

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
    return `Selamlar! Ben MOKA CREATIVE AGENCY canlı veritabanı hafızasına sahip AI Operatörünüzüm. 🤖\n\nŞu an sistemde <b>${data.isletmeler.length} işletmeniz</b> (${activeCount} aktif), planlı çekimleriniz, kurgularınız ve harcamalarınız güncel olarak zihnimdedir.\n\nBana doğal Türkçe cümlelerle emredebilirsiniz:\n• <i>"1200 tl yakıt aldım kadirin araba gider olarak ekle"</i>\n• <i>"Akbay tekstilden 15000 tl ödeme aldık gelir olarak ekle"</i>\n• <i>"2 gün içinde akbay tekstil sinematik videosuna revize notları ses düzenlenecek"</i>\n• <i>"Cuma 12'ye pety music sinematik 2 adet reels çekimi yaz"</i>`;
  }

  // 2. STRATEJİK ANALİZ: Düşük Getiri / Düşük Ciro / Zahmetli İşletmeler
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

  // 3. STRATEJİK ANALİZ: Kaybetmememiz Gereken Müşteriler
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

  // 4. İşletme Listesi Sorgusu
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

  // 5. Özel notlar & Kritik durumlar
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

  // 6. Editör / Ekip İş yükü sorgusu
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

  // 7. Çekimler sorgusu
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

  // 8. Finans sorgusu
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
         `Bana doğal Türkçe ile dilediğiniz kelimeyle komut verebilirsiniz:\n` +
         `• <i>"1200 tl yakıt aldım kadirin araba gider olarak ekle"</i>\n` +
         `• <i>"Akbay tekstilden 15000 tl ödeme aldık gelir ekle"</i>\n` +
         `• <i>"2 gün içinde akbay tekstil sinematik videosuna revize notları ses düzenlenecek"</i>\n` +
         `• <i>"Cuma 12'ye pety music sinematik 2 adet reels çekimi yaz"</i>`;
}
