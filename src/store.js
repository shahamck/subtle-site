// Cart + saved state. Everything lives in this browser only (it's a concept store, nothing is sent).
import { byId, priceOf, imageFor, selectionLabel } from './catalogue.js';

const KEY = 'subtle.cart.v1';
const read = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};
const write = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: keep in memory */ }
};

const events = new EventTarget();
let lines = read(KEY, []).filter((l) => byId[l.id]);

const lineKey = (id, wood, sel) => `${id}|${wood}|${JSON.stringify(sel)}`;
const save = () => { write(KEY, lines); events.dispatchEvent(new Event('change')); };

export const cart = {
  on: (fn) => { events.addEventListener('change', fn); return () => events.removeEventListener('change', fn); },
  lines: () => lines.map((l) => {
    const p = byId[l.id];
    return { ...l, product: p, price: priceOf(p, l.wood, l.sel), image: imageFor(p, l.wood, l.sel), detail: selectionLabel(p, l.wood, l.sel) };
  }),
  count: () => lines.reduce((n, l) => n + l.qty, 0),
  subtotal: () => cart.lines().reduce((s, l) => s + l.price * l.qty, 0),
  add(id, wood, sel, qty = 1) {
    const key = lineKey(id, wood, sel);
    const hit = lines.find((l) => l.key === key);
    if (hit) hit.qty += qty;
    else lines.push({ key, id, wood, sel, qty });
    save();
    events.dispatchEvent(new CustomEvent('added', { detail: { id, wood, sel } }));
  },
  setQty(key, qty) {
    lines = qty <= 0 ? lines.filter((l) => l.key !== key) : lines.map((l) => (l.key === key ? { ...l, qty } : l));
    save();
  },
  clear() { lines = []; save(); },
  onAdded: (fn) => events.addEventListener('added', fn),
};

export const orders = {
  save(order) { const all = read('subtle.orders.v1', {}); all[order.id] = order; write('subtle.orders.v1', all); },
  get: (id) => read('subtle.orders.v1', {})[id],
};

export const board = {
  load: () => read('subtle.board.v1', null),
  save: (state) => write('subtle.board.v1', state),
};
