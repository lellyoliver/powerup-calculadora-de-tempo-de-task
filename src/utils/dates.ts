/** Diferença em dias civis entre duas datas YYYY-MM-DD (ou Date). */
export function diffDays(from: string | Date, to: string | Date): number {
  const a = toUtcMidnight(from);
  const b = toUtcMidnight(to);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function todayYmd(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toUtcMidnight(value: string | Date): Date {
  if (typeof value === 'string') {
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
}

export function isValidYmd(value: string | undefined | null): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

/** Nomes de lista que indicam conclusão da task. */
export const DONE_LIST_NAMES = [
  'concluído',
  'concluido',
  'done',
  'completo',
  'completa',
  'finalizado',
  'finalizada',
  'finished',
  'closed',
];

export function isDoneListName(name: string | undefined | null): boolean {
  if (!name) return false;
  const normalized = name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase();
  return DONE_LIST_NAMES.some((n) => normalized === n || normalized.includes(n));
}
