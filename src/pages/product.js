import { byId, WOODS, edition, defaultSelection, priceOf, imageFor, inr, photo, thumb, buyable, related, ROOMS } from '../catalogue.js';
import { cart } from '../store.js';
import { productCard, icon, esc, reveal } from '../ui.js';

const CARE = {
  fabric: ['For indoor use only.', 'Brush or vacuum gently; lift stains with a damp cloth and dry promptly.', 'Keep away from direct heat and sunlight.', 'Avoid strong cleaning agents.'],
  wood: ['For indoor use only.', 'Wipe with a soft damp cloth and dry promptly.', 'Keep away from direct heat and sunlight.', 'Avoid strong cleaning agents on the surface.'],
  decor: ['Handmade — small variations in glaze and form are part of each piece.', 'Wipe clean with a dry or slightly damp cloth.'],
};

export default function product(root, id, { openCart }) {
  const p = byId[id];
  if (!p) {
    root.innerHTML = `<section class="wrap notfound"><h1 class="display">Piece not found.</h1><a class="btn" href="#/shop">Back to the shop ${icon.arrow}</a></section>`;
    return;
  }
  const room = ROOMS.find((r) => r.match(p));
  const state = { wood: 0, sel: defaultSelection(p, 0), img: 0, qty: 1 };
  const care = p.dept === 'decor' ? CARE.decor : p.editions[0].options.some((o) => /jute|touch|velvet|leather/.test(o.key)) || p.type === 'sofa' ? CARE.fabric : CARE.wood;

  root.innerHTML = `
  <section class="pdp wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/shop">Shop</a><span>/</span>${room ? `<a href="#/shop?room=${room.id}">${room.label}</a><span>/</span>` : ''}<span aria-current="page">${esc(p.name)}</span></nav>
    <div class="pdp-grid">
      <div class="gallery">
        <div class="stage" tabindex="0" aria-label="Product photos — drag or use arrow keys">
          <div class="stage-track"></div>
          <button type="button" class="stage-nav prev" aria-label="Previous photo">${icon.left}</button>
          <button type="button" class="stage-nav next" aria-label="Next photo">${icon.right}</button>
          <span class="stage-count"></span>
        </div>
        <div class="thumbs" role="tablist" aria-label="Photos"></div>
      </div>
      <div class="buybox">
        <p class="eyebrow">${esc(p.typeLabel)}</p>
        <h1 class="pdp-name">${esc(p.name)}</h1>
        <p class="pdp-price" aria-live="polite"></p>
        ${p.editions.length > 1 ? `
        <div class="opt">
          <div class="opt-head"><span>Wood</span><em class="wood-note"></em></div>
          <div class="woods" role="radiogroup" aria-label="Wood">
            ${p.editions.map((e, i) => `<button type="button" role="radio" data-wood="${i}"><b>${WOODS[e.wood].label}</b><span>from ${inr(e.priceFrom)}</span></button>`).join('')}
          </div>
        </div>` : ''}
        <div class="opts"></div>
        <div class="buy-row">
          <div class="qty qty-lg"><button type="button" data-d="-1" aria-label="Decrease">${icon.minus}</button><span class="q">1</span><button type="button" data-d="1" aria-label="Increase">${icon.plus}</button></div>
          <button type="button" class="btn btn-block add" ${buyable(p) ? '' : 'disabled'}>${buyable(p) ? 'Add to cart' : 'Coming soon'}</button>
        </div>
        <ul class="perks">
          <li>${icon.truck}<span>Free delivery in selected areas</span></li>
          <li>${icon.pin}<span>See the woods &amp; fabrics at our <a href="#/story?s=store">experience store</a></span></li>
          <li>${icon.check}<span>Designed, crafted &amp; produced by Subtle</span></li>
        </ul>
        <div class="acc">
          ${p.description ? `<details open><summary>About</summary><p>${esc(p.description)}</p></details>` : ''}
          <details ${p.description ? '' : 'open'}><summary>Specifications</summary><dl class="specs"></dl></details>
          <details><summary>Care</summary><ul class="dots">${care.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></details>
          <details><summary>Delivery &amp; warranty</summary><p>Most furniture is ready to use on arrival — no assembly. Delivery timelines are confirmed after you order; see the <a href="https://subtleconcepts.in/shipping-policy/" target="_blank" rel="noopener">shipping</a> and <a href="https://subtleconcepts.in/warranty-policy/" target="_blank" rel="noopener">warranty</a> policies.</p></details>
        </div>
        <p class="muted small">Photographs are renders — the actual finish may vary with lighting and screen.</p>
      </div>
    </div>
  </section>
  <section class="wrap pdp-more">
    <div class="pdp-more-head"><h2 class="display">Complete the room</h2><a class="link" href="#/shop${room ? '?room=' + room.id : ''}">View all ${icon.arrow}</a></div>
    <div class="grid grid-4">${related(p).map((q) => productCard(q)).join('')}</div>
  </section>`;

  const track = root.querySelector('.stage-track');
  const thumbsEl = root.querySelector('.thumbs');
  const counter = root.querySelector('.stage-count');
  const priceEl = root.querySelector('.pdp-price');
  const optsEl = root.querySelector('.opts');
  const specs = root.querySelector('.specs');
  const addBtn = root.querySelector('.add');

  const images = () => edition(p, state.wood).images;

  function renderGallery() {
    const imgs = images();
    track.innerHTML = imgs.map((n, i) => `<img src="${photo(n)}" alt="${esc(p.name)} — photo ${i + 1}" ${i ? 'loading="lazy"' : ''} draggable="false">`).join('');
    thumbsEl.innerHTML = imgs.map((n, i) => `<button type="button" role="tab" data-i="${i}" aria-label="Photo ${i + 1}"><img src="${thumb(n)}" alt=""></button>`).join('');
    root.querySelectorAll('.stage-nav').forEach((b) => { b.hidden = imgs.length < 2; });
    go(Math.min(state.img, imgs.length - 1), false);
  }
  function go(i, animate = true) {
    const n = images().length;
    state.img = (i + n) % n;
    track.style.transition = animate ? '' : 'none';
    track.style.transform = `translateX(${-100 * state.img}%)`;
    thumbsEl.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-selected', String(k === state.img)));
    counter.textContent = n > 1 ? `${state.img + 1} / ${n}` : '';
  }

  function renderOptions() {
    const e = edition(p, state.wood);
    root.querySelectorAll('[data-wood]').forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.wood) === state.wood)));
    const note = root.querySelector('.wood-note');
    if (note) note.textContent = WOODS[e.wood].note;
    optsEl.innerHTML = e.options.map((o) => {
      const cur = o.values.find((v) => v.id === state.sel[o.key]);
      const swatchy = o.values.every((v) => v.swatch);
      return `<div class="opt"><div class="opt-head"><span>${esc(o.label)}</span><em>${esc(cur?.label || '')}</em></div>
        <div class="${swatchy ? 'swatch-row' : 'pill-row'}" role="radiogroup" aria-label="${esc(o.label)}">
        ${o.values.map((v) => swatchy
          ? `<button type="button" role="radio" class="swatch" data-k="${o.key}" data-v="${v.id}" aria-checked="${v.id === state.sel[o.key]}" style="--c:${v.swatch}" title="${esc(v.label)}"><span class="sr">${esc(v.label)}</span></button>`
          : `<button type="button" role="radio" class="pill" data-k="${o.key}" data-v="${v.id}" aria-checked="${v.id === state.sel[o.key]}">${esc(v.label)}</button>`).join('')}
        </div></div>`;
    }).join('');
    renderPrice();
    const rows = [];
    if (e.wood) rows.push(['Wood', WOODS[e.wood].label]);
    rows.push(['Dimensions', e.dimensions || 'Shared on request']);
    if (p.spec) rows.push(['Size', p.spec]);
    for (const o of e.options) rows.push([o.label, o.values.map((v) => v.label).join(', ')]);
    rows.push(['Assembly', p.dept === 'decor' ? '—' : 'Ready to use']);
    specs.innerHTML = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  }

  function renderPrice() {
    const price = priceOf(p, state.wood, state.sel);
    priceEl.innerHTML = buyable(p) ? `${inr(price * state.qty)}${state.qty > 1 ? `<small>${inr(price)} each</small>` : ''}<small>Incl. GST</small>` : 'Coming soon';
  }

  // option changes jump the gallery to the matching photo when the shop has one
  function syncImage() {
    const want = imageFor(p, state.wood, state.sel);
    const i = images().indexOf(want);
    if (i >= 0) go(i);
  }

  root.querySelector('.buybox').addEventListener('click', (ev) => {
    const w = ev.target.closest('[data-wood]');
    if (w) {
      state.wood = Number(w.dataset.wood);
      state.sel = { ...defaultSelection(p, state.wood), ...Object.fromEntries(Object.entries(state.sel).filter(([k]) => k !== 'finish' && edition(p, state.wood).options.some((o) => o.key === k))) };
      state.img = 0;
      renderGallery();
      renderOptions();
      return;
    }
    const o = ev.target.closest('[data-k]');
    if (o) { state.sel[o.dataset.k] = o.dataset.v; renderOptions(); syncImage(); return; }
    const q = ev.target.closest('.qty button');
    if (q) {
      state.qty = Math.max(1, Math.min(20, state.qty + Number(q.dataset.d)));
      root.querySelector('.q').textContent = state.qty;
      renderPrice();
    }
  });

  addBtn.addEventListener('click', () => {
    if (!buyable(p)) return;
    cart.add(p.id, state.wood, { ...state.sel }, state.qty);
    addBtn.classList.add('done');
    addBtn.innerHTML = `${icon.check} Added`;
    setTimeout(() => { addBtn.classList.remove('done'); addBtn.textContent = 'Add to cart'; }, 1600);
    openCart();
  });

  root.querySelector('.prev').addEventListener('click', () => go(state.img - 1));
  root.querySelector('.next').addEventListener('click', () => go(state.img + 1));
  thumbsEl.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) go(Number(b.dataset.i)); });
  const stage = root.querySelector('.stage');
  stage.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') go(state.img - 1); if (e.key === 'ArrowRight') go(state.img + 1); });

  // drag / swipe between photos
  let x0 = null, dx = 0;
  stage.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; x0 = e.clientX; dx = 0; stage.setPointerCapture(e.pointerId); track.style.transition = 'none'; });
  stage.addEventListener('pointermove', (e) => {
    if (x0 == null) return;
    dx = e.clientX - x0;
    track.style.transform = `translateX(calc(${-100 * state.img}% + ${dx}px))`;
  });
  const end = () => {
    if (x0 == null) return;
    x0 = null;
    track.style.transition = '';
    if (Math.abs(dx) > 50) go(state.img + (dx < 0 ? 1 : -1)); else go(state.img);
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  renderGallery();
  renderOptions();
  document.title = `${p.name} — subtle.`;
  reveal(root);
  return () => { document.title = 'subtle. — furniture & home decor'; };
}
