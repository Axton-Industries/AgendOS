// ponytail: all times are user-local naive strings ("YYYY-MM-DD HH:mm").
// If server timezone ever differs from the user's, switch to storing UTC + tz.

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toDateTimeStr(d: Date) {
  return `${toDateStr(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function todayStr() {
  return toDateStr(new Date());
}

export function nowDateTimeStr() {
  return toDateTimeStr(new Date());
}

export function addDays(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toDateStr(dt);
}

/** Monday-based week start */
export function weekStart(dateStr: string) {
  return addDays(dateStr, -mondayIndex(dateStr));
}

export function monthStart(dateStr: string) {
  return `${dateStr.slice(0, 7)}-01`;
}

export function addMonths(dateStr: string, months: number) {
  const [y, m] = dateStr.split("-").map(Number);
  return toDateStr(new Date(y, m - 1 + months, 1));
}

/** Monday-first weekday index */
export function mondayIndex(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_NAMES_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function dayName(dateStr: string, lang: "en" | "es" = "en") {
  const [y, m, d] = dateStr.split("-").map(Number);
  const names = lang === "es" ? DAY_NAMES_ES : DAY_NAMES_EN;
  return names[new Date(y, m - 1, d).getDay()];
}

export function monthName(month: number, lang: "en" | "es" = "en") {
  const names = lang === "es" ? MONTH_NAMES_ES : MONTH_NAMES_EN;
  return names[month - 1];
}

/** "2026-09-14 09:00" -> "09:00" */
export function timeOf(dt: string) {
  return dt.slice(11, 16);
}

export function friendlyDate(dateStr: string, lang: "en" | "es" = "en") {
  const [y, m, d] = dateStr.split("-").map(Number);
  const names = lang === "es" ? MONTH_NAMES_ES : MONTH_NAMES_EN;
  return `${dayName(dateStr, lang)}, ${names[m - 1]} ${d}, ${y}`;
}

export function addMinutes(dt: string, minutes: number) {
  const [d, t] = dt.split(" ");
  const [y, mo, day, hh, mm] = [...d.split("-"), ...t.split(":")].map(Number);
  const date = new Date(y, mo - 1, day, hh, mm + minutes);
  return toDateTimeStr(date);
}
