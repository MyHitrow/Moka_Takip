// Yardımcı saf fonksiyonlar — side effect yok, test edilebilir

export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function formatDateTr(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2];
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
    ];
    if (months[monthIndex]) {
      return `${day} ${months[monthIndex]} ${year}`;
    }
  }
  return dateStr;
}

export function normalizeRoleKey(roleStr: string): string {
  if (!roleStr) return 'member';
  const norm = roleStr.trim().toLowerCase();
  if (norm.includes('super') || norm.includes('süper')) return 'super_admin';
  if (norm.includes('creative') || norm.includes('kreatif')) return 'creative_director';
  if (norm.includes('avukat')) return 'avukat';
  if (norm.includes('ads')) return 'ads_specialist';
  if (norm.includes('herbokolog')) return 'herbokolog';
  if (norm.includes('admin') || norm.includes('yönetici')) return 'admin';
  if (norm.includes('edit') || norm.includes('kurgu')) return 'editor';
  if (norm === 'member' || norm.includes('üye') || norm.includes('ekip')) return 'member';
  return norm;
}

export function formatRoleLabel(roleKey: string): string {
  const norm = normalizeRoleKey(roleKey);
  switch (norm) {
    case 'super_admin':       return 'Süper Admin';
    case 'admin':             return 'Admin';
    case 'creative_director': return 'Creative Director';
    case 'avukat':            return 'Avukat';
    case 'ads_specialist':    return 'Ads Uzmanı';
    case 'herbokolog':        return 'Herbokolog';
    case 'editor':            return 'Editör / Kurgucu';
    case 'member':            return 'Ekip Üyesi';
    default:                  return roleKey || 'Ekip Üyesi';
  }
}

// Türkçe karakter normalize + eşleştirme (yanlış örtüşme olmaz)
export function normalizeClientName(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

export function isClientMatch(nameA: string, nameB: string): boolean {
  const normA = normalizeClientName(nameA);
  const normB = normalizeClientName(nameB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  // "Villa Kursları" vs "Villa Koleji" gibi varyasyonlar
  if (normA.startsWith('villa') && normB.startsWith('villa')) return true;
  return false;
}

export function normalizeContentType(type: string): string {
  const map: Record<string, string> = {
    'Reels': 'reels', 'reels': 'reels',
    'Post': 'post', 'post': 'post',
    'Story': 'story', 'story': 'story',
    'YouTube': 'youtube', 'youtube': 'youtube',
    'Reklam': 'ad_video', 'ad_video': 'ad_video',
    'Kurumsal': 'corporate_video', 'corporate_video': 'corporate_video',
  };
  return map[type] || 'other';
}

export const ALLOWED_EXPENSE_CATEGORIES = [
  'personnel', 'transportation', 'food', 'equipment',
  'software', 'advertising', 'office', 'tax', 'freelance', 'other',
] as const;

export function safeExpenseCategory(category: string): string {
  return (ALLOWED_EXPENSE_CATEGORIES as readonly string[]).includes(category)
    ? category
    : 'other';
}
