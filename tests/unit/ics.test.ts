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
});
