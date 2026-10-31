const formulaLike = /^'*[\u0000-\u0020]*[=+\-@]/;

function needsSpreadsheetEscape(value: string): boolean {
  return formulaLike.test(value);
}

/** Quote a guest name for CSV and neutralize spreadsheet formula prefixes. */
export function escapeGuestCsvCell(value: string): string {
  const safeValue = needsSpreadsheetEscape(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

/** Remove only the protective apostrophe added by escapeGuestCsvCell. */
export function restoreGuestCsvCell(value: string): string {
  if (!value.startsWith("'")) return value;
  const unescaped = value.slice(1);
  return needsSpreadsheetEscape(unescaped) ? unescaped : value;
}
