import { describe, expect, it } from 'vitest';
import { escapeGuestCsvCell, restoreGuestCsvCell } from '@/lib/csv/guests';

describe('guest CSV cells', () => {
  it.each([
    '=1+1',
    '  @SUM(A1:A2)',
    '+cmd',
    "'=1+1",
    "''=1+1"
  ])('neutralizes spreadsheet formulas and restores the original name: %s', (name) => {
    const escaped = escapeGuestCsvCell(name);
    const cellValue = escaped.slice(1, -1).replace(/""/g, '"');

    expect(cellValue).toMatch(/^'/);
    expect(restoreGuestCsvCell(cellValue)).toBe(name);
  });

  it('quotes commas and double quotes without changing the name', () => {
    const name = 'Asha "AJ", Shah';
    const escaped = escapeGuestCsvCell(name);

    expect(escaped).toBe('"Asha ""AJ"", Shah"');
    expect(restoreGuestCsvCell(escaped.slice(1, -1).replace(/""/g, '"'))).toBe(name);
  });

  it('leaves ordinary names unchanged', () => {
    expect(escapeGuestCsvCell('Nisha')).toBe('"Nisha"');
    expect(restoreGuestCsvCell('Nisha')).toBe('Nisha');
  });
});
