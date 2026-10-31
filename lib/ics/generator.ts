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
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const formatDate = (value: Date) => value.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Celebrate AI//Planner//EN',
    'BEGIN:VEVENT',
    `UID:${title.toLowerCase().replace(/\s+/g, '-')}-${start.getTime()}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}
