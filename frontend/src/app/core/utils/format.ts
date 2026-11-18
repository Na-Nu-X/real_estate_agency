const eurFormatter = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('sk-SK', { maximumFractionDigits: 1 });

export function formatEur(value: number | null | undefined): string {
  return value === null || value === undefined || Number.isNaN(value) ? '—' : eurFormatter.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : numberFormatter.format(value);
}

/** Slovak plural: 1 izba, 2–4 izby, 5+ izieb */
export function pluralize(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one;
  if (count >= 2 && count <= 4) return few;
  return many;
}

export function formatRooms(rooms: number): string {
  return `${rooms} ${pluralize(rooms, 'izba', 'izby', 'izieb')}`;
}

export function formatFloor(floor: number | null): string {
  if (floor === null || floor === undefined) return '—';
  if (floor === 0) return 'Prízemie';
  if (floor < 0) return `${Math.abs(floor)}. podzemné podlažie`;
  return `${floor}. podlažie`;
}
