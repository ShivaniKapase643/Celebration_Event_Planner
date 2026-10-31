export function buildIcsFile({
  title,
  date,
  location,
  description
}: {
  title: string;
  date: string;
  location: string;
  description: string;
}): string {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) throw new Error('Invalid calendar event date');
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const formatDate = (value: Date) => value.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const escapeText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Celebrate AI//Planner//EN',
    'BEGIN:VEVENT',
    `UID:${start.getTime()}-${escapeText(title)}@celebrate-ai`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
