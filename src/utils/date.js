export const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
export const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
export const WEEKDAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

export function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function getWeekDates(date = new Date()) {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateBR(date) {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function formatTime(hour, minute = 0) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function isSameDay(date1, date2) {
  return formatDate(date1) === formatDate(date2);
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function getDayName(date) {
  const d = new Date(date);
  return WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

export function getDayNameShort(date) {
  const d = new Date(date);
  return WEEKDAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function getWeekRange(date) {
  const dates = getWeekDates(date);
  const start = formatDateBR(dates[0]);
  const end = formatDateBR(dates[6]);
  return `${start} - ${end}`;
}

