import { describe, expect, it } from 'vitest';
import { buildIcsFile } from '@/lib/ics/generator';

describe('ICS generator', () => {
  it('builds valid calendar file content', () => {
    const result = buildIcsFile({
      title: 'Birthday Bash',
      date: '2030-03-15',
      location: 'Pune',
      description: 'Celebrate with family and friends'
    });

    expect(result).toContain('BEGIN:VCALENDAR');
    expect(result).toContain('SUMMARY:Birthday Bash');
  });

  it('escapes user supplied text and rejects invalid dates', () => {
    const result = buildIcsFile({ title: 'Party, Day; One', date: '2030-03-15T18:00:00', location: 'Pune', description: 'Line one\nLine two' });
    expect(result).toContain('SUMMARY:Party\\, Day\\; One');
    expect(result).toContain('DESCRIPTION:Line one\\nLine two');
    expect(() => buildIcsFile({ title: 'Party', date: 'bad date', location: 'Pune', description: '' })).toThrow('Invalid calendar event date');
  });
});
