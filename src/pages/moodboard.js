import { products, byId, thumb, cover, inr, buyable, defaultSelection, priceOf, ROOMS } from '../catalogue.js';
import { cart, board } from '../store.js';
import { icon, esc, toast } from '../ui.js';

const SWATCHES = [
  { id: 'teak', label: 'Teak', group: 'Ashwood finish', c: '#B47C46', wood: true },
  { id: 'vintage-walnut', label: 'Vintage walnut', group: 'Ashwood finish', c: '#5E3B27', wood: true },
  { id: 'caramel-brown', label: 'Caramel brown', group: 'Mahogany finish', c: '#8E5A2E', wood: true },
  { id: 'cherry-red', label: 'Cherry red', group: 'Mahogany finish', c: '#7B2A22', wood: true },
  { id: 'jute-beige', label: 'Beige', group: 'Urban Jute', c: '#D9C8A9' },
  { id: 'jute-white', label: 'Soft white', group: 'Urban Jute', c: '#EFE9DD' },
  { id: 'jute-grey', label: 'Warm grey', group: 'Urban Jute', c: '#A59C90' },
  { id: 'touch-grey', label: 'Cool grey', group: 'Touch', c: '#9BA1A7' },
  { id: 'touch-oyster', label: 'Pale oyster', group: 'Touch', c: '#D8CDBD' },
  { id: 'velvet-wine', label: 'Dark wine', group: 'Velvet', c: '#5C1F2B' },
  { id: 'velvet-navy', label: 'Navy blue', group: 'Velvet', c: '#1F2F52' },
  { id: 'leather-green', label: 'Battle green', group: 'Leather', c: '#3E4B36' },
  { id: 'terracotta', label: 'Natural', group: 'Terracotta', c: '#B7663F' },
];
const swatchById = Object.fromEntries(SWATCHES.map((s) => [s.id, s]));

const WALLS = [
  ['cream', 'Cream', '#F3E9DC'], ['sage', 'Sage', '#C9CDB8'], ['clay', 'Clay', '#D9B9A0'], ['ash', 'Ash', '#D6D3CE'], ['navy', 'Navy', '#1B3A5C'],
];

const SEED = () => ({
  name: 'My living room',
  wall: 'cream',
  items: [
    { u: 1, k: 'p', id: 'kairo-sofa', x: 0.36, y: 0.36, r: -3, s: 1.15, z: 1 },
    { u: 2, k: 'p', id: 'ethos-chandigarh-chair', x: 0.7, y: 0.3, r: 4, s: 0.95, z: 2 },
    { u: 3, k: 'p', id: 'evolve-coffee-table', x: 0.52, y: 0.7, r: 2, s: 0.95, z: 3 },
    { u: 4, k: 'p', id: 'hoop-12in', x: 0.86, y: 0.68, r: -5, s: 0.75, z: 4 },
    { u: 5, k: 's', id: 'vintage-walnut', x: 0.14, y: 0.72, r: 0, s: 1, z: 5 },
    { u: 6, k: 's', id: 'jute-beige', x: 0.24, y: 0.82, r: 0, s: 1, z: 6 },
  ],
});

export default function moodboard(root) {
  let st = board.load() || SEED();
  st.items = st.items.filter((it) => (it.k === 'p' ? byId[it.id] : swatchById[it.id]));
  let tab = 'pieces';
  let roomFilter = 'all';
  let selected = null;
  const nextU = () => Math.max(0, ...st.items.map((i) => i.u)) + 1;
  const nextZ = () => Math.max(0, ...st.items.map((i) => i.z)) + 1;

  root.innerHTML = `
  <section class="mb wrap">
    <header class="mb-head">
      <div>
        <p class="eyebrow">Mood board</p>
        <h1 class="display">Make your own space.</h1>
      </div>
      <p class="muted">Drag pieces, finishes and fabrics onto the board. Move, tilt and resize them, then send every piece to your cart in one go. Your board is saved in this browser.</p>
    </header>
    <div class="mb-grid">
      <aside class="tray" aria-label="Add to board">
        <div class="tray-tabs" role="tablist">
          <button type="button" role="tab" data-tab="pieces">Pieces</button>
          <button type="button" role="tab" data-tab="materials">Materials</button>
        </div>
        <div class="tray-filter"></div>
        <div class="tray-list"></div>
      </aside>
      <div class="mb-main">
        <div class="mb-bar">
          <label class="mb-name"><span class="sr">Board name</span><input type="text" maxlength="40" value="${esc(st.name)}"></label>
          <div class="walls" role="radiogroup" aria-label="Wall colour">${WALLS.map(([id, l, c]) => `<button type="button" role="radio" data-wall="${id}" style="--c:${c}" title="${l} wall"><span class="sr">${l}</span></button>`).join('')}</div>
        </div>
        <div class="board" aria-label="Board — select an item and use the toolbar or arrow keys">
          <div class="board-floor"></div>
          <div class="board-items"></div>
          <div class="board-empty"><p>Drop pieces here.</p><p class="muted">Or tap any piece in the list.</p></div>
        </div>
        <div class="tools" hidden>
          <button type="button" data-tool="rl" aria-label="Tilt left">${icon.rotate.replace('class="ic"', 'class="ic flip"')}</button>
          <button type="button" data-tool="rr" aria-label="Tilt right">${icon.rotate}</button>
          <button type="button" data-tool="sm" aria-label="Smaller">${icon.minus}</button>
          <button type="button" data-tool="lg" aria-label="Larger">${icon.plus}</button>
          <a class="tool-link" data-tool="open">View piece</a>
          <button type="button" data-tool="rm" class="danger" aria-label="Remove">${icon.close}</button>
        </div>
        <div class="mb-sum">
          <div><span class="muted">On the board</span><b class="mb-count"></b></div>
          <div><span class="muted">Total</span><b class="mb-total"></b></div>
          <button type="button" class="btn btn-ghost mb-clear">Clear</button>
          <button type="button" class="btn mb-buy">Add all to cart ${icon.arrow}</button>
        </div>
      </div>
    </div>
  </section>`;

  const boardEl = root.querySelector('.board');
  const itemsEl = root.querySelector('.board-items');
  const trayList = root.querySelector('.tray-list');
  const trayFilter = root.querySelector('.tray-filter');
  const tools = root.querySelector('.tools');
  const save = () => board.save(st);

  function itemHTML(it) {
    const style = `left:${it.x * 100}%;top:${it.y * 100}%;--r:${it.r}deg;--s:${it.s};z-index:${it.z}`;
    if (it.k === 'p') {
      const p = byId[it.id];
      return `<div class="it pin ${selected === it.u ? 'sel' : ''}" data-u="${it.u}" style="${style}" tabindex="0" role="button" aria-label="${esc(p.name)}">
        <img src="${thumb(cover(p))}" alt="" draggable="false"><span>${esc(p.name)}</span><em>${buyable(p) ? inr(priceOf(p, 0, defaultSelection(p, 0))) : 'Soon'}</em></div>`;
    }
    const s = swatchById[it.id];
    return `<div class="it chip-it ${s.wood ? 'wood' : ''} ${selected === it.u ? 'sel' : ''}" data-u="${it.u}" style="${style};--c:${s.c}" tabindex="0" role="button" aria-label="${esc(s.group + ' ' + s.label)}"><i></i><span>${esc(s.label)}<small>${esc(s.group)}</small></span></div>`;
  }

  function renderBoard() {
    const wall = WALLS.find((w) => w[0] === st.wall) || WALLS[0];
    boardEl.style.setProperty('--wall', wall[2]);
    boardEl.classList.toggle('dark', st.wall === 'navy');
    root.querySelectorAll('[data-wall]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.wall === st.wall)));
    itemsEl.innerHTML = st.items.map(itemHTML).join('');
    root.querySelector('.board-empty').hidden = st.items.length > 0;
    const pieces = st.items.filter((i) => i.k === 'p').map((i) => byId[i.id]);
    root.querySelector('.mb-count').textContent = `${pieces.length} ${pieces.length === 1 ? 'piece' : 'pieces'} · ${st.items.length - pieces.length} materials`;
    root.querySelector('.mb-total').textContent = inr(pieces.filter(buyable).reduce((s, p) => s + priceOf(p, 0, defaultSelection(p, 0)), 0));
    root.querySelector('.mb-buy').disabled = !pieces.some(buyable);
    placeTools();
  }

  function placeTools() {
    const it = st.items.find((i) => i.u === selected);
    tools.hidden = !it;
    if (!it) return;
    const link = tools.querySelector('[data-tool="open"]');
    link.hidden = it.k !== 'p';
    if (it.k === 'p') link.href = `#/p/${it.id}`;
  }

  function renderTray() {
    root.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    if (tab === 'pieces') {
      trayFilter.innerHTML = `<div class="chips chips-sm">${[['all', 'All'], ...ROOMS.map((r) => [r.id, r.label])].map(([id, l]) => `<button type="button" data-rf="${id}" aria-selected="${id === roomFilter}">${l}</button>`).join('')}</div>`;
      const room = ROOMS.find((r) => r.id === roomFilter);
      const list = products.filter((p) => buyable(p) && (!room || room.match(p)));
      trayList.innerHTML = list.map((p) => `<button type="button" class="tray-item" draggable="true" data-add="p:${p.id}"><img src="${thumb(cover(p))}" alt="" loading="lazy"><span>${esc(p.name)}<small>${inr(priceOf(p, 0, defaultSelection(p, 0)))}</small></span>${icon.plus}</button>`).join('');
    } else {
      trayFilter.innerHTML = '';
      const groups = [...new Set(SWATCHES.map((s) => s.group))];
      trayList.innerHTML = groups.map((g) => `<h4>${g}</h4><div class="tray-sw">${SWATCHES.filter((s) => s.group === g).map((s) => `<button type="button" class="tray-chip ${s.wood ? 'wood' : ''}" draggable="true" data-add="s:${s.id}" style="--c:${s.c}"><i></i>${esc(s.label)}</button>`).join('')}</div>`).join('');
    }
  }

  function add(spec, x, y) {
    const [k, id] = spec.split(':');
    const it = { u: nextU(), k, id, x: x ?? 0.25 + Math.random() * 0.5, y: y ?? 0.25 + Math.random() * 0.5, r: Math.round(Math.random() * 10 - 5), s: k === 'p' ? 1 : 1, z: nextZ() };
    st.items.push(it);
    selected = it.u;
    save();
    renderBoard();
  }

  root.querySelector('.tray').addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (t) { tab = t.dataset.tab; renderTray(); return; }
    const rf = e.target.closest('[data-rf]');
    if (rf) { roomFilter = rf.dataset.rf; renderTray(); return; }
    const a = e.target.closest('[data-add]');
    if (a) {
      add(a.dataset.add);
      if (matchMedia('(max-width: 900px)').matches) boardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  trayList.addEventListener('dragstart', (e) => {
    const a = e.target.closest('[data-add]');
    if (a) { e.dataTransfer.setData('text/plain', a.dataset.add); e.dataTransfer.effectAllowed = 'copy'; }
  });
  boardEl.addEventListener('dragover', (e) => { e.preventDefault(); boardEl.classList.add('over'); });
  boardEl.addEventListener('dragleave', () => boardEl.classList.remove('over'));
  boardEl.addEventListener('drop', (e) => {
    e.preventDefault();
    boardEl.classList.remove('over');
    const spec = e.dataTransfer.getData('text/plain');
    if (!/^[ps]:/.test(spec)) return;
    const r = boardEl.getBoundingClientRect();
    add(spec, clamp((e.clientX - r.left) / r.width), clamp((e.clientY - r.top) / r.height));
  });

  // move items with the pointer
  let drag = null;
  itemsEl.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.it');
    if (!el) return;
    const it = st.items.find((i) => i.u === Number(el.dataset.u));
    selected = it.u;
    it.z = nextZ();
    el.style.zIndex = it.z;
    itemsEl.querySelectorAll('.it').forEach((n) => n.classList.toggle('sel', n === el));
    placeTools();
    const r = boardEl.getBoundingClientRect();
    drag = { el, it, r, ox: e.clientX - it.x * r.width, oy: e.clientY - it.y * r.height, moved: false };
    el.setPointerCapture(e.pointerId);
    el.classList.add('lift');
  });
  itemsEl.addEventListener('pointermove', (e) => {
    if (!drag) return;
    drag.moved = true;
    drag.it.x = clamp((e.clientX - drag.ox) / drag.r.width);
    drag.it.y = clamp((e.clientY - drag.oy) / drag.r.height);
    drag.el.style.left = `${drag.it.x * 100}%`;
    drag.el.style.top = `${drag.it.y * 100}%`;
  });
  const drop = () => { if (!drag) return; drag.el.classList.remove('lift'); drag = null; save(); };
  itemsEl.addEventListener('pointerup', drop);
  itemsEl.addEventListener('pointercancel', drop);
  boardEl.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.it')) { selected = null; itemsEl.querySelectorAll('.it').forEach((n) => n.classList.remove('sel')); placeTools(); }
  });
  itemsEl.addEventListener('keydown', (e) => {
    const el = e.target.closest('.it');
    if (!el) return;
    const it = st.items.find((i) => i.u === Number(el.dataset.u));
    selected = it.u;
    const step = e.shiftKey ? 0.05 : 0.01;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      it.x = clamp(it.x + moves[e.key][0]); it.y = clamp(it.y + moves[e.key][1]);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      st.items = st.items.filter((i) => i !== it); selected = null;
    } else return;
    save(); renderBoard();
    itemsEl.querySelector(`[data-u="${it.u}"]`)?.focus();
  });

  tools.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tool]');
    const it = st.items.find((i) => i.u === selected);
    if (!b || !it) return;
    const t = b.dataset.tool;
    if (t === 'rl') it.r -= 6;
    if (t === 'rr') it.r += 6;
    if (t === 'sm') it.s = Math.max(0.6, +(it.s - 0.15).toFixed(2));
    if (t === 'lg') it.s = Math.min(1.6, +(it.s + 0.15).toFixed(2));
    if (t === 'rm') { st.items = st.items.filter((i) => i !== it); selected = null; }
    if (t === 'open') return;
    save();
    renderBoard();
  });

  root.querySelector('.walls').addEventListener('click', (e) => {
    const b = e.target.closest('[data-wall]');
    if (b) { st.wall = b.dataset.wall; save(); renderBoard(); }
  });
  root.querySelector('.mb-name input').addEventListener('input', (e) => { st.name = e.target.value; save(); });
  root.querySelector('.mb-clear').addEventListener('click', () => {
    if (!st.items.length) return;
    const prev = structuredClone(st);
    st.items = []; selected = null; save(); renderBoard();
    toast(`<span>Board cleared.</span><button type="button" class="link toast-undo">Undo</button>`);
    const undo = (ev) => { if (ev.target.closest('.toast-undo')) { st = prev; save(); renderBoard(); document.removeEventListener('click', undo); } };
    document.addEventListener('click', undo);
    setTimeout(() => document.removeEventListener('click', undo), 3000);
  });
  root.querySelector('.mb-buy').addEventListener('click', () => {
    const ids = st.items.filter((i) => i.k === 'p').map((i) => byId[i.id]).filter(buyable);
    ids.forEach((p) => cart.add(p.id, 0, defaultSelection(p, 0)));
  });

  renderTray();
  renderBoard();
}

const clamp = (v) => Math.min(0.97, Math.max(0.03, v));
