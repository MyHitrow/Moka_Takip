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
 * Generates and downloads a pre-formatted sample Excel file for ÇEKİMLER (Video Shoots)
 */
export function downloadSampleShootsExcelTemplate(): void {
  const sampleShoots = [
    {
      'İşletme Adı': 'Luness',
      'Çekim Başlığı': 'Yaz Koleksiyonu Reels Çekimi',
      'Tarih': '05.08.2026',
      'Saat': '10:00',
      'Çekim Yeri / Mekan': 'Nişantaşı Mağaza',
    },
    {
      'İşletme Adı': 'Dutt',
      'Çekim Başlığı': 'Etkinlik Gecesi Röportajı',
      'Tarih': '05.08.2026',
      'Saat': '15:00',
      'Çekim Yeri / Mekan': 'Dutt Sahne / Stüdyo',
    },
    {
      'İşletme Adı': 'Sun Brother Pizza',
      'Çekim Başlığı': 'Mutfak Arkası & Lezzet Çekimi',
      'Tarih': '05.08.2026',
      'Saat': '18:00',
      'Çekim Yeri / Mekan': 'Şişli Şubesi',
    },
    {
      'İşletme Adı': 'Savaş Ticaret',
      'Çekim Başlığı': 'Ürün Lansman Video Çekimi',
      'Tarih': '07.08.2026',
      'Saat': '11:30',
      'Çekim Yeri / Mekan': 'Savaş Ticaret Depo',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleShoots);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Çekim Takvimi');
  XLSX.writeFile(workbook, 'moka_ornek_cekim_takvimi.xlsx');
}

/**
 * Generates and downloads a pre-formatted sample Excel file for PAYLAŞIM TAKVİMİ (Content Calendar)
 */
export function downloadSampleTakvimExcelTemplate(): void {
  const samplePosts = [
    {
      'İşletme Adı': 'Luness',
      'Gönderi Başlığı': 'Yeni Sezon Elbise Tanıtım Reels',
      'Paylaşım Tarihi': '07.08.2026',
      'Paylaşım Saati': '18:00',
      'Platform': 'Instagram Reels',
    },
    {
      'İşletme Adı': 'Savaş Ticaret',
      'Gönderi Başlığı': 'Haftalık Fırsat Ürünleri Duyurusu',
      'Paylaşım Tarihi': '07.08.2026',
      'Paylaşım Saati': '19:30',
      'Platform': 'Instagram Post',
    },
    {
      'İşletme Adı': 'Dutt',
      'Gönderi Başlığı': 'Cuma Gecesi Etkinlik Tanıtım Videosu',
      'Paylaşım Tarihi': '07.08.2026',
      'Paylaşım Saati': '20:00',
      'Platform': 'Instagram Reels',
    },
    {
      'İşletme Adı': 'Sun Brother Pizza',
      'Gönderi Başlığı': 'Hafta Sonu Kampanya Story',
      'Paylaşım Tarihi': '08.08.2026',
      'Paylaşım Saati': '12:00',
      'Platform': 'Story',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(samplePosts);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Paylaşım Takvimi');
  XLSX.writeFile(workbook, 'moka_ornek_paylasim_takvimi.xlsx');
}

// Geriye dönük uyumluluk için alias
export const downloadSampleExcelTemplate = downloadSampleShootsExcelTemplate;

/**
 * Parses relative date, Turkish month names, slashes, or various Excel date representations into YYYY-MM-DD
 */
function normalizeExcelDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];

  const rawStr = String(val).trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawStr)) {
    return rawStr;
  }

  // If DD.MM.YYYY
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(rawStr)) {
    const parts = rawStr.split('.');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  // If DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(rawStr)) {
    const parts = rawStr.split(/[\/\-]/);
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  // "01 Temmuz 2026" or "28 Ağustos 2026"
  const trMonths: Record<string, string> = {
    ocak: '01', subat: '02', şubat: '02', mart: '03', nisan: '04',
    mayis: '05', mayıs: '05', haziran: '06', temmuz: '07', agustos: '08',
    ağustos: '08', eylul: '09', eylül: '09', ekim: '10',
    kasim: '11', kasım: '11', aralik: '12', aralık: '12',
  };

  const match = rawStr.toLowerCase().match(/^(\d{1,2})\s+([a-zşğıöç]+)\s+(\d{4})/i);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthName = match[2];
    const year = match[3];
    const monthNum = trMonths[monthName];
    if (monthNum) {
      return `${year}-${monthNum}-${day}`;
    }
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
      // 6. Title / Gönderi / Post / Başlık / Konu / İçerik
      else if (
        k.includes('başlık') ||
        k.includes('baslik') ||
        k.includes('gönderi') ||
        k.includes('gonderi') ||
        k.includes('post') ||
        k.includes('video') ||
        k.includes('reels') ||
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
      title = `${clientName} Gönderisi`;
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
