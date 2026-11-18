/**
 * Minimal line-icon set (24×24, stroke based). Several shapes are adapted from
 * Lucide (ISC licence). Defined as data so no innerHTML / sanitizer bypass is
 * needed.
 */
export type IconNode =
  | ['path', { d: string }]
  | ['circle', { cx: number; cy: number; r: number }]
  | ['rect', { x: number; y: number; width: number; height: number; rx?: number }];

const p = (d: string): IconNode => ['path', { d }];
const c = (cx: number, cy: number, r: number): IconNode => ['circle', { cx, cy, r }];
const r = (x: number, y: number, width: number, height: number, rx = 0): IconNode => [
  'rect',
  { x, y, width, height, rx },
];

export const ICONS = {
  'arrow-right': [p('M5 12h14'), p('m13 5 7 7-7 7')],
  'arrow-left': [p('M19 12H5'), p('m11 19-7-7 7-7')],
  'chevron-left': [p('m15 18-6-6 6-6')],
  'chevron-right': [p('m9 18 6-6-6-6')],
  'chevron-down': [p('m6 9 6 6 6-6')],
  close: [p('M18 6 6 18'), p('m6 6 12 12')],
  menu: [p('M3 8h18'), p('M3 16h18')],
  search: [c(11, 11, 7.5), p('m20.5 20.5-4.2-4.2')],
  'map-pin': [p('M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'), c(12, 10, 3)],
  phone: [
    p(
      'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
    ),
  ],
  mail: [r(2, 4, 20, 16, 1), p('m22 7-10 6L2 7')],
  area: [r(3, 3, 18, 18), p('M3 12h7v9'), p('M14 3v6h7')],
  rooms: [
    p('M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8'),
    p('M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4'),
    p('M12 4v6'),
    p('M2 18h20'),
  ],
  floor: [p('m12 2 10 5-10 5L2 7l10-5z'), p('m2 17 10 5 10-5'), p('m2 12 10 5 10-5')],
  land: [p('M2 20h20'), p('m4 20 5-9 4 6 3-4 4 7')],
  energy: [p('M13 2 3 14h9l-1 8 10-12h-9l1-8z')],
  check: [p('M20 6 9 17l-5-5')],
  calendar: [r(3, 4, 18, 18, 1), p('M16 2v4M8 2v4M3 10h18')],
  clock: [c(12, 12, 10), p('M12 6v6l4 2')],
  expand: [p('M15 3h6v6'), p('M9 21H3v-6'), p('M21 3l-7 7'), p('M3 21l7-7')],
  grid: [r(3, 3, 7, 7), r(14, 3, 7, 7), r(3, 14, 7, 7), r(14, 14, 7, 7)],
  list: [r(3, 4, 18, 6), r(3, 14, 18, 6)],
  filter: [p('M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4')],
  home: [p('M3 10.5 12 3l9 7.5V21H3z'), p('M9 21v-6h6v6')],
  building: [r(4, 2, 16, 20), p('M9 22v-4h6v4'), p('M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01')],
  briefcase: [r(2, 7, 20, 14, 1), p('M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16')],
  instagram: [r(2, 2, 20, 20, 5), c(12, 12, 4), p('M17.5 6.5h.01')],
  facebook: [p('M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z')],
  linkedin: [p('M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z'), r(2, 9, 4, 12), c(4, 4, 2)],
  youtube: [r(2, 5, 20, 14, 4), p('m10 9 5 3-5 3z')],
  shield: [p('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'), p('m9 12 2 2 4-4')],
  user: [c(12, 8, 4), p('M4 21a8 8 0 0 1 16 0')],
  info: [c(12, 12, 10), p('M12 16v-4M12 8h.01')],
  images: [r(3, 3, 18, 18), c(9, 9, 2), p('m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21')],
  trending: [p('M22 7 13.5 15.5 8.5 10.5 2 17'), p('M16 7h6v6')],
  key: [c(7.5, 15.5, 5.5), p('m21 2-9.6 9.6'), p('m15.5 7.5 3 3L22 7l-3-3')],
  star: [p('m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z')],
  camera: [p('M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z'), c(12, 13, 3)],
  document: [p('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'), p('M14 2v6h6'), p('M16 13H8M16 17H8M10 9H8')],
} satisfies Record<string, IconNode[]>;

export type IconName = keyof typeof ICONS;
