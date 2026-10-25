import { products, ROOMS, buyable } from '../catalogue.js';
import { productCard, icon, esc, reveal } from '../ui.js';

const SORTS = [
  ['featured', 'Featured'],
  ['low', 'Price: low to high'],
  ['high', 'Price: high to low'],
  ['name', 'Name A–Z'],
];

const INTRO = {
  all: 'Solid wood furniture and handmade decor, designed, crafted and produced by Subtle.',
  sofas: 'Deep seats, dual fabrics and frames built to sink into — from a single lounger to a 3 + 2 set.',
  chairs: 'Dining, study and lounge chairs in Ashwood or Mahogany, with Urban Jute seats on many.',
  dining: 'Four-, six- and eight-seater tables, plus crockery units with fluted glass.',
  bedroom: 'Beds in king and queen with nightstands to match — poster, cane and upholstered.',
  storage: 'Media consoles, storage consoles, shoe racks and study tables that keep a room calm.',
  decor: 'Ceramics and terracotta made by hand — small pieces that finish a shelf.',
};

export default function shop(root, query) {
  const state = {
    room: query.get('room') || 'all',
    wood: query.get('wood') || 'any',
    sort: query.get('sort') || 'featured',
    q: query.get('q') || '',
  };

  root.innerHTML = `
  <section class="shop wrap">
    <header class="shop-head">
      <p class="eyebrow">The collection</p>
      <h1 class="display shop-title"></h1>
      <p class="shop-intro"></p>
    </header>
    <div class="shop-bar">
      <div class="chips" role="tablist" aria-label="Rooms">
        <button type="button" role="tab" data-room="all">All</button>
        ${ROOMS.map((r) => `<button type="button" role="tab" data-room="${r.id}">${r.label}</button>`).join('')}
      </div>
      <div class="shop-tools">
        <div class="seg" role="group" aria-label="Wood">
          <button type="button" data-wood="any">Any wood</button><button type="button" data-wood="ashwood">Ashwood</button><button type="button" data-wood="mahogany">Mahogany</button>
        </div>
        <label class="search">${icon.right}<span class="sr">Search</span><input type="search" placeholder="Search pieces" value="${esc(state.q)}"></label>
        <label class="sort"><span class="sr">Sort</span><select>${SORTS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
      </div>
    </div>
    <p class="shop-count muted" aria-live="polite"></p>
    <div class="grid"></div>
  </section>`;

  const grid = root.querySelector('.grid');
  const title = root.querySelector('.shop-title');
  const intro = root.querySelector('.shop-intro');
  const count = root.querySelector('.shop-count');
  root.querySelector('.sort select').value = state.sort;

  function list() {
    const room = ROOMS.find((r) => r.id === state.room);
    const q = state.q.trim().toLowerCase();
    let out = products.filter((p) =>
      (!room || room.match(p)) &&
      (state.wood === 'any' || p.editions.some((e) => e.wood === state.wood)) &&
      (!q || `${p.name} ${p.typeLabel} ${p.description}`.toLowerCase().includes(q)));
    const price = (p) => p.priceFrom ?? Infinity;
    if (state.sort === 'low') out = out.sort((a, b) => price(a) - price(b));
    if (state.sort === 'high') out = out.sort((a, b) => (b.priceFrom ?? -1) - (a.priceFrom ?? -1));
    if (state.sort === 'name') out = out.sort((a, b) => a.name.localeCompare(b.name));
    if (state.sort === 'featured') out = out.sort((a, b) => Number(buyable(b)) - Number(buyable(a)));
    return out;
  }

  function render() {
    const label = ROOMS.find((r) => r.id === state.room)?.label || 'Shop all';
    title.textContent = label;
    intro.textContent = INTRO[state.room] || INTRO.all;
    root.querySelectorAll('[data-room]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.room === state.room)));
    root.querySelectorAll('[data-wood]').forEach((b) => b.classList.toggle('on', b.dataset.wood === state.wood));
    const items = list();
    count.textContent = `${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`;
    grid.innerHTML = items.length
      ? items.map((p, i) => productCard(p).replace('class="card ', `style="--d:${Math.min(i, 12) * 35}ms" class="card rv `)).join('')
      : `<div class="empty"><p>No pieces match that yet.</p><button type="button" class="btn btn-ghost reset">Clear filters</button></div>`;
    reveal(grid);
    const params = new URLSearchParams();
    if (state.room !== 'all') params.set('room', state.room);
    if (state.wood !== 'any') params.set('wood', state.wood);
    if (state.sort !== 'featured') params.set('sort', state.sort);
    if (state.q) params.set('q', state.q);
    history.replaceState(null, '', `#/shop${params.size ? '?' + params : ''}`);
  }

  root.querySelector('.chips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-room]');
    if (b) { state.room = b.dataset.room; render(); }
  });
  root.querySelector('.seg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-wood]');
    if (b) { state.wood = b.dataset.wood; render(); }
  });
  root.querySelector('.sort select').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
  let t;
  root.querySelector('.search input').addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = e.target.value; render(); }, 160);
  });
  grid.addEventListener('click', (e) => {
    if (e.target.closest('.reset')) {
      Object.assign(state, { room: 'all', wood: 'any', q: '' });
      root.querySelector('.search input').value = '';
      render();
    }
  });
  render();
}
