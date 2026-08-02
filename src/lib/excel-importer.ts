import * as XLSX from 'xlsx';
import { Cekim, TakvimPost } from '@/types/app';

export interface ParsedExcelResult {
  shoots: Omit<Cekim, 'id'>[];
  posts: Omit<TakvimPost, 'id'>[];
  totalRowsParsed: number;
  rawHeaders: string[];
  clientNamesFound: string[];
}

/**
 * Generates and downloads a pre-formatted sample Excel file for the user
 */
export function downloadSampleExcelTemplate(): void {
  const sampleData = [
    {
      'İşletme Adı': 'Luness',
      'Çekim Başlığı': 'Yaz Koleksiyonu Reels Çekimi',
      'Tarih': '05.08.2026',
      'Saat': '10:00',
      'Konum': 'Luness Mağaza / Nişantaşı',
      'Platform': 'Instagram Reels',
    },
    {
      'İşletme Adı': 'Dutt',
      'Çekim Başlığı': 'Ürün Tanıtımı & Röportaj',
      'Tarih': '05.08.2026',
      'Saat': '15:00',
      'Konum': 'Dutt Stüdyo',
      'Platform': 'Instagram Reels',
    },
    {
      'İşletme Adı': 'Sun Brother Pizza',
      'Çekim Başlığı': 'Mutfak Arkası Video Çekimi',
      'Tarih': '05.08.2026',
      'Saat': '18:00',
      'Konum': 'Şişli Şubesi',
      'Platform': 'Instagram Reels',
    },
    {
      'İşletme Adı': 'ModaPlus',
      'Çekim Başlığı': 'Eylül Kataloğu Çekimleri',
      'Tarih': '06.08.2026',
      'Saat': '11:30',
      'Konum': 'Dış Mekan / Kadıköy',
      'Platform': 'Instagram Reels',
    },
    {
      'İşletme Adı': 'TechMarket',
      'Çekim Başlığı': 'Kutu Açılımı & İnceleme',
      'Tarih': '07.08.2026',
      'Saat': '14:00',
      'Konum': 'Ajans Stüdyosu',
      'Platform': 'YouTube Shorts',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Çekim Takvimi');
  XLSX.writeFile(workbook, 'moka_ornek_cekim_takvimi.xlsx');
}

/**
 * Parses relative date or various Excel date representations into YYYY-MM-DD
 */
function normalizeExcelDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];

  // If already YYYY-MM-DD
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim())) {
    return val.trim();
  }

  // If DD.MM.YYYY
  if (typeof val === 'string' && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(val.trim())) {
    const parts = val.trim().split('.');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  // If Excel Date Serial Number (e.g. 45300)
  if (typeof val === 'number') {
    const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(jsDate.getTime())) {
      return jsDate.toISOString().split('T')[0];
    }
  }

  // General Date parse
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Normalizes time string e.g. "14:00" or 14
 */
function normalizeExcelTime(val: any): string {
  if (!val) return '10:00';
  const str = String(val).trim();
  if (str.includes(':')) return str;
  const num = parseInt(str, 10);
  if (!isNaN(num) && num >= 0 && num <= 24) {
    return `${String(num).padStart(2, '0')}:00`;
  }
  return '10:00';
}

/**
 * Reads an Excel (.xlsx, .xls) or CSV (.csv) File object and converts to Shoots & Content Calendar items
 */
export async function parseExcelFile(file: File): Promise<ParsedExcelResult> {
  const dataBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(dataBuffer, { type: 'array', cellDates: true });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert worksheet to JSON array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    return { shoots: [], posts: [], totalRowsParsed: 0, rawHeaders: [], clientNamesFound: [] };
  }

  const rawHeaders = Object.keys(rawRows[0]);
  const shoots: Omit<Cekim, 'id'>[] = [];
  const posts: Omit<TakvimPost, 'id'>[] = [];
  const clientNamesSet = new Set<string>();

  rawRows.forEach((row) => {
    // Smart Column Matching
    let clientName = '';
    let title = '';
    let dateVal = '';
    let timeVal = '';
    let locationVal = '';
    let platformVal = '';

    Object.entries(row).forEach(([key, val]) => {
      const k = key.trim().toLowerCase();
      const strVal = String(val).trim();
      if (!strVal) return;

      // 1. Location / Yer / Mekan / Adres (Check BEFORE title so 'Çekim Yeri' / 'Çekim Mekanı' matches location!)
      if (
        k.includes('konum') ||
        k.includes('yer') ||
        k.includes('location') ||
        k.includes('mekan') ||
        k.includes('mekân') ||
        k.includes('adres') ||
        k.includes('lokasyon') ||
        k.includes('nerede') ||
        k.includes('stüdyo') ||
        k.includes('studyo')
      ) {
        locationVal = strVal;
      }
      // 2. Client name / İşletme / Müşteri / Firma / Marka
      else if (
        k.includes('işletme') ||
        k.includes('isletme') ||
        k.includes('müşteri') ||
        k.includes('musteri') ||
        k.includes('client') ||
        k.includes('firma') ||
        k.includes('marka')
      ) {
        clientName = strVal;
      }
      // 3. Platform / Kanal
      else if (
        k.includes('platform') ||
        k.includes('kanal') ||
        k.includes('sosyal medya')
      ) {
        platformVal = strVal;
      }
      // 4. Date / Tarih
      else if (
        k.includes('tarih') ||
        k.includes('date') ||
        k.includes('gün')
      ) {
        dateVal = strVal;
      }
      // 5. Time / Saat
      else if (
        k.includes('saat') ||
        k.includes('time')
      ) {
        timeVal = strVal;
      }
      // 6. Title / Başlık / Konu / İçerik
      else if (
        k.includes('başlık') ||
        k.includes('baslik') ||
        k.includes('çekim') ||
        k.includes('cekim') ||
        k.includes('konu') ||
        k.includes('title') ||
        k.includes('içerik') ||
        k.includes('icerik') ||
        k.includes('açıklama') ||
        k.includes('aciklama')
      ) {
        title = strVal;
      }
    });

    // Fallback: If client name column wasn't detected by header, pick first non-empty column string
    if (!clientName) {
      const firstVal = Object.values(row).find((v) => String(v).trim().length > 0);
      clientName = firstVal ? String(firstVal).trim() : 'Genel Müşteri';
    }

    if (!title) {
      title = 'Sosyal Medya Video Çekimi';
    }

    clientNamesSet.add(clientName);
    const parsedDate = normalizeExcelDate(dateVal);
    const parsedTime = normalizeExcelTime(timeVal);

    // Create Shoot Record
    shoots.push({
      client: clientName,
      title: title,
      date: parsedDate,
      time: parsedTime,
      location: locationVal || 'Stüdyo / İşletme Adresi',
      status: 'planned',
    });

    // Create Calendar Record
    posts.push({
      client: clientName,
      title: title,
      platform: platformVal || 'Instagram Reels',
      date: parsedDate,
      time: parsedTime,
      status: 'scheduled',
    });
  });

  return {
    shoots,
    posts,
    totalRowsParsed: rawRows.length,
    rawHeaders,
    clientNamesFound: Array.from(clientNamesSet),
  };
}
