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

export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}


export function isSameWeek(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return getWeekNumber(d1) === getWeekNumber(d2) &&
         d1.getFullYear() === d2.getFullYear();
}

export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

export function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isSameDay(startDate, endDate)) {
    return formatDate(start);
  }

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.getDate()} ${getMonthName(start.getMonth())} ${start.getFullYear()}`;
  }

  if (start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} ${getMonthName(start.getMonth())}–${end.getDate()} ${getMonthName(end.getMonth())} ${end.getFullYear()}`;
  }

  return `${start.getDate()} ${getMonthName(start.getMonth())}–${end.getDate()} ${getMonthName(end.getMonth())} ${end.getFullYear()}`;
}

export function formatDate(date) {
  const d = new Date(date);
  return `${d.getDate()} ${getMonthName(d.getMonth())} ${d.getFullYear()}`;
}

function getMonthName(month) {
  const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  return months[month];
}

export function getWeekDateRange(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday,
    end: sunday,
    formatted: `Vecka ${getWeekNumber(date)} (${monday.getDate()}–${sunday.getDate()} ${getMonthName(monday.getMonth())})`
  };
}
