import { Cekim } from '@/types/app';

/**
 * Generates an iCalendar (.ics) format string for a single shoot event.
 * Compatible with Apple Calendar (iOS / macOS), Google Calendar, and Outlook.
 */
export function generateSingleCekimIcal(item: Cekim): string {
  const cleanDate = item.date.replace(/-/g, '');
  const rawTime = item.time || '10:00';
  const parts = rawTime.split(':');
  const hour = parseInt(parts[0], 10) || 10;
  const min = parts[1] || '00';

  const startDt = `${cleanDate}T${String(hour).padStart(2, '0')}${min}00`;
  const endHour = String(hour + 2).padStart(2, '0');
  const endDt = `${cleanDate}T${endHour}${min}00`;

  const title = `🎬 ${item.client} - ${item.title}`;
  const location = item.location || 'Stüdyo';
  const description = `Moka Creative Çekim Planı\\nİşletme: ${item.client}\\nBaşlık: ${item.title}\\nMekan: ${location}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Moka Creative//Cekim Takvimi//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:cekim-${item.id}@mokacreative.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startDt}`,
    `DTEND:${endDt}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generates an iCalendar (.ics) format string containing multiple shoot events.
 */
export function generateBulkCekimlerIcal(items: Cekim[]): string {
  if (!items || items.length === 0) return '';

  const eventsStr = items.map((item) => {
    const cleanDate = item.date.replace(/-/g, '');
    const rawTime = item.time || '10:00';
    const parts = rawTime.split(':');
    const hour = parseInt(parts[0], 10) || 10;
    const min = parts[1] || '00';

    const startDt = `${cleanDate}T${String(hour).padStart(2, '0')}${min}00`;
    const endHour = String(hour + 2).padStart(2, '0');
    const endDt = `${cleanDate}T${endHour}${min}00`;

    const title = `🎬 ${item.client} - ${item.title}`;
    const location = item.location || 'Stüdyo';
    const description = `Moka Creative Çekim Planı\\nİşletme: ${item.client}\\nBaşlık: ${item.title}\\nMekan: ${location}`;

    return [
      'BEGIN:VEVENT',
      `UID:cekim-${item.id}@mokacreative.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startDt}`,
      `DTEND:${endDt}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Moka Creative//Cekim Takvimi//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    eventsStr,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers native download or Apple Calendar opening for .ics file.
 */
export function downloadIcsCalendarFile(filename: string, content: string): void {
  if (!content) return;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
