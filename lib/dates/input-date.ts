export function futureDateInput(offsetDays = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}
