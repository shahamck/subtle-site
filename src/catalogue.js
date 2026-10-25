// Catalogue helpers over src/data/catalogue.json (built from the live subtleconcepts.in shop by
// scripts/build-catalogue.py). A product has one or two "editions" — Ashwood and/or Mahogany —
// each with its own option groups, per-combination prices and photos.
import data from './data/catalogue.json';

export const products = data;
export const byId = Object.fromEntries(data.map((p) => [p.id, p]));

const BASE = import.meta.env.BASE_URL;
export const photo = (name) => `${BASE}p/${name}`;
export const thumb = (name) => `${BASE}t/${name}`;
export const asset = (path) => `${BASE}${path}`;

export const inr = (n) => (n == null ? '' : '₹' + Math.round(n).toLocaleString('en-IN'));

export const DEPTS = [
  { id: 'seating', label: 'Seating' },
  { id: 'tables', label: 'Tables' },
  { id: 'storage', label: 'Storage' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'decor', label: 'Home decor' },
];

export const WOODS = {
  ashwood: { label: 'Ashwood', note: 'Imported from Europe & America' },
  mahogany: { label: 'Mahogany', note: 'Rich grain, warm undertone' },
};

// the shop's "rooms" — used by the home page category list and shop filters
export const ROOMS = [
  { id: 'sofas', label: 'Sofas', match: (p) => p.type === 'sofa' },
  { id: 'chairs', label: 'Chairs', match: (p) => p.type === 'chair' },
  { id: 'dining', label: 'Dining', match: (p) => p.type === 'dining-table' || p.type === 'crockery-unit' },
  { id: 'bedroom', label: 'Bedroom', match: (p) => p.dept === 'bedroom' },
  { id: 'storage', label: 'Storage', match: (p) => p.dept === 'storage' || p.type === 'work-study-table' },
  { id: 'decor', label: 'Decor', match: (p) => p.dept === 'decor' },
];

export const edition = (p, wood = 0) => p.editions[Math.min(wood, p.editions.length - 1)];

export function defaultSelection(p, wood = 0) {
  const sel = {};
  for (const o of edition(p, wood).options) sel[o.key] = o.values[0].id;
  return sel;
}

function bestCombo(p, wood, sel) {
  let best = null;
  let score = -1;
  for (const c of edition(p, wood).combos) {
    const keys = Object.keys(c.o);
    if (keys.some((k) => sel[k] != null && sel[k] !== c.o[k])) continue;
    const s = keys.filter((k) => sel[k] === c.o[k]).length;
    if (s > score) { best = c; score = s; }
  }
  return best;
}

export function priceOf(p, wood, sel) {
  const c = bestCombo(p, wood, sel);
  return c ? c.price : edition(p, wood).priceFrom;
}

// the photo that matches the chosen finish/fabric, when the shop has one
export function imageFor(p, wood, sel) {
  const c = bestCombo(p, wood, sel);
  const e = edition(p, wood);
  return c?.img && e.images.includes(c.img) ? c.img : c?.img || e.images[0];
}

export const cover = (p) => p.editions[0].images[0];
export const secondImage = (p) => p.editions[0].images[1] || p.editions[1]?.images[0] || null;
export const buyable = (p) => !p.comingSoon && p.priceFrom != null;

export function priceLabel(p) {
  if (!buyable(p)) return 'Coming soon';
  const top = Math.max(...p.editions.map((e) => e.priceTo || 0));
  return top > p.priceFrom ? `From ${inr(p.priceFrom)}` : inr(p.priceFrom);
}

export function selectionLabel(p, wood, sel) {
  const parts = [];
  if (p.editions.length > 1 || edition(p, wood).wood) parts.push(WOODS[edition(p, wood).wood]?.label);
  for (const o of edition(p, wood).options) {
    const v = o.values.find((x) => x.id === sel[o.key]);
    if (v) parts.push(v.label);
  }
  return parts.filter(Boolean).join(' · ');
}

export function related(p, n = 4) {
  const room = ROOMS.find((r) => r.match(p));
  const pool = products.filter((q) => q.id !== p.id && buyable(q));
  const same = pool.filter((q) => q.room === p.room && q.type !== p.type);
  const sib = pool.filter((q) => room && room.match(q));
  return [...new Set([...same.slice(0, 2), ...sib, ...same])].slice(0, n);
}
