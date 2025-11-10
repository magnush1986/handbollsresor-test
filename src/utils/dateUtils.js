export function getCurrentSeason() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (year === 2025 && month >= 5) {
    return '2025-2026';
  }

  return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export function getEffectiveToday() {
  const today = new Date();
  if (today.getFullYear() === 2025 && (today.getMonth() + 1) < 7) {
    return new Date('2025-07-01');
  }
  return today;
}

export function parseKostnad(kostnadStr) {
  if (!kostnadStr) return 0;
  return parseFloat(
    kostnadStr
      .replace(/\s/g, '')
      .replace('kr', '')
      .replace(',', '.')
  ) || 0;
}
