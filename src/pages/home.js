import { products, byId, ROOMS, inr, photo, thumb, asset, cover, priceLabel, defaultSelection, priceOf, buyable, edition, WOODS } from '../catalogue.js';
import { cart } from '../store.js';
import { logo, icon, badge, esc, reveal } from '../ui.js';

// Hero scenes: a room photo + a full-frame Vision cutout of the chair in it, so the chair can
// rise out of the photo card into the wordmark (layout solved per viewport in fitHero).
const SCENES = [
  { id: 'ethos-chandigarh-chair', file: 'ETHOS-WALNUT-1', label: 'Ethos · Ashwood', tone: 'dark', x: 0.56 },
  { id: 'cadera-chair', file: 'CADERA-TEAK-2', label: 'Cadera · Teak', tone: 'dark', x: 0.6 },
  { id: 'dallas-armchair', file: 'DALLAS-MAHOGANY-1', label: 'Dallas · Mahogany', tone: 'light', x: 0.58 },
];

// Rooms for "Handpicked favourites" — hotspots sit on pieces from the catalogue in the shop's own renders.
const SPACES = [
  { id: 'living', label: 'Living room', img: 'rooms/Home-banner.jpg', spots: [
    { id: 'kairo-sofa', x: 52, y: 66 }, { id: 'ethos-chandigarh-chair', x: 9, y: 71 }, { id: 'crate-nightstand', x: 24, y: 74 } ] },
  { id: 'lounge', label: 'Lounge', img: 'rooms/Home-banner-4.jpg', spots: [
    { id: 'bounce-sofa', x: 58, y: 52 }, { id: 'evolve-coffee-table', x: 47, y: 68 } ] },
  { id: 'dining', label: 'Dining', img: 'rooms/Home-banner-5.jpg', spots: [
    { id: 'dublin-armchair', x: 38, y: 72 }, { id: 'dublin-chair', x: 70, y: 70 } ] },
  { id: 'bedroom', label: 'Bedroom', img: 'rooms/Home-banner-3.jpg', spots: [
    { id: 'solace-bed', x: 40, y: 70 }, { id: 'cross-nightstand', x: 74, y: 64 } ] },
  { id: 'suite', label: 'Guest suite', img: 'rooms/Home-banner-2.webp', spots: [
    { id: 'ruya-bed', x: 52, y: 76 }, { id: 'dublin-chair', x: 21, y: 80 } ] },
];

const SOFAS = ['kairo-sofa', 'bounce-sofa', 'mellow-sofa', 'pluto-sofa', 'tiffany-sofa', 'skid-sofa', 'ralph-sofa', 'azure-sofa'].map((id) => byId[id]).filter(Boolean);

const FINISHES = [
  { wood: 'Ashwood', items: [['Teak', '#B47C46'], ['Vintage walnut', '#5E3B27']] },
  { wood: 'Mahogany', items: [['Caramel brown', '#8E5A2E'], ['Cherry red', '#7B2A22']] },
];
const FABRICS = [
  { name: 'Urban Jute', items: [['Beige', '#D9C8A9'], ['Soft white', '#EFE9DD'], ['Warm grey', '#A59C90']] },
  { name: 'Touch', items: [['Cool grey', '#9BA1A7'], ['Pale oyster', '#D8CDBD']] },
  { name: 'Velvet', items: [['Dark wine', '#5C1F2B'], ['Navy blue', '#1F2F52']] },
];

const JOURNAL = [
  { t: 'Our favourite types of modern dining chairs', tag: 'Kitchen & dining', img: 'rooms/Home-banner-5.jpg', url: 'https://subtleconcepts.in/our-favourite-types-of-modern-dining-chairs/' },
  { t: 'Modern furniture for the guest bedroom', tag: 'Bedroom', img: 'rooms/Home-banner-3.jpg', url: 'https://subtleconcepts.in/modern-furniture-for-the-guest-bedroom/' },
  { t: 'Spring trends you can use in your home', tag: 'Bedroom', img: 'rooms/Home-banner-2.webp', url: 'https://subtleconcepts.in/spring-trends-you-can-use-in-your-home/' },
];

const firstSentence = (t = '') => {
  const s = t.split(/(?<=\.)\s/)[0] || '';
  return s.length > 190 ? s.slice(0, 186).replace(/\s\S*$/, '') + '…' : s;
};

const featureList = (p) => {
  const e = edition(p, 0);
  const out = [];
  for (const o of e.options) {
    if (o.key === 'seater') out.push(o.values.map((v) => v.label.replace(' seater', '')).join(', ') + ' seater');
    else if (o.key !== 'finish') out.push(`${o.label.replace('Fabric · ', '')} in ${o.values.length} shades`);
  }
  out.push('Designed & crafted by Subtle');
  return out.slice(0, 3);
};

export default function home(root) {
  const counts = { pieces: products.length };
  root.innerHTML = `
  <section class="hero" aria-label="Featured">
    <h1 class="hero-word">${logo()}<span class="sr">subtle. — furniture &amp; home decor</span></h1>
    <div class="hero-stage">
      <div class="hero-card">
        ${SCENES.map((s, i) => `<img class="hero-photo ${i ? '' : 'on'}" data-i="${i}" src="${asset(`hero/${s.file}.jpg`)}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>`).join('')}
        <div class="hero-shade"></div>
      </div>
      <div class="hero-cuts" aria-hidden="true">
        ${SCENES.map((s, i) => `<img class="hero-cut ${i ? '' : 'on'}" data-i="${i}" src="${asset(`hero/${s.file}.png`)}" alt="">`).join('')}
      </div>
      <p class="hero-glass" data-tone="${SCENES[0].tone}">Solid Ashwood &amp; Mahogany, shaped by hand and finished in imported stains — furniture that feels effortless and timeless.</p>
      <a class="hero-tag" href="#/p/${SCENES[0].id}"><span>${esc(byId[SCENES[0].id].name)}</span><b>${priceLabel(byId[SCENES[0].id])}</b>${icon.arrow}</a>
      <div class="hero-thumbs" role="tablist" aria-label="Featured pieces">
        ${SCENES.map((s, i) => `<button type="button" role="tab" aria-selected="${!i}" data-i="${i}" title="${esc(s.label)}"><img src="${asset(`hero/${s.file}.jpg`)}" alt="${esc(s.label)}"></button>`).join('')}
      </div>
      ${badge('Shop furniture', '#/shop', 'hero-badge')}
    </div>
  </section>

  <section class="rooms wrap" aria-labelledby="rooms-h">
    <p class="eyebrow rv" id="rooms-h">Designed for every space</p>
    <div class="rooms-stage">
      <ul class="rooms-list" role="list">
        ${ROOMS.map((r, i) => `<li><a href="#/shop?room=${r.id}" data-room="${r.id}" class="${i === 1 ? 'on' : ''}">${r.label}</a></li>`).join('')}
        <li><a href="#/shop" data-room="all">All</a></li>
      </ul>
      <div class="rooms-cards" aria-hidden="true">${[0, 1, 2, 3].map((i) => `<a class="float f${i}" tabindex="-1" href="#/shop"><img alt=""><span></span></a>`).join('')}</div>
    </div>
  </section>

  <section class="lasts wrap" aria-labelledby="lasts-h">
    <div class="lasts-frame rv">
      <div class="lasts-photo"><img src="${asset('rooms/Home-banner-5.jpg')}" alt="Dining room furnished with Dublin armchairs" loading="lazy"></div>
      <h2 class="display tab tab-tl" id="lasts-h">Furniture that lasts</h2>
      <div class="tab tab-tr stat"><b>2</b><span>Solid woods<br>Ashwood · Mahogany</span></div>
      <div class="tab tab-bl stat"><b>${counts.pieces}</b><span>Pieces designed<br>in-house</span></div>
      <div class="stat-bubble stat"><b>4</b><span>Hand-applied<br>imported stains</span></div>
      ${badge('Shop furniture', '#/shop', 'lasts-badge')}
    </div>
    <p class="lasts-copy rv">We travelled across India to understand raw materials, chose the best ashwood from Europe and America, and finish every piece in imported stains. Then we build it to be lived with — for years, not seasons.</p>
  </section>

  <section class="comfort wrap" aria-labelledby="comfort-h">
    <div class="comfort-head">
      <h2 class="display rv" id="comfort-h">Modern comfort<br>starts here</h2>
      <div class="arrows"><button type="button" class="arrow" data-step="-1" aria-label="Previous sofa">${icon.left}</button><button type="button" class="arrow solid" data-step="1" aria-label="Next sofa">${icon.right}</button></div>
    </div>
    <div class="comfort-body">
      <div class="comfort-img"><img alt=""></div>
      <div class="comfort-info">
        <h3 class="comfort-name"></h3>
        <ul class="ticks"></ul>
        <div class="comfort-buy"><span class="price"></span><button type="button" class="btn btn-sm add">Add to cart</button><a class="link more">Details ${icon.arrow}</a></div>
        <div class="comfort-band"></div>
      </div>
    </div>
  </section>

  <section class="picks wrap" aria-labelledby="picks-h">
    <div class="picks-head">
      <h2 class="display rv" id="picks-h">Handpicked<br>favourites</h2>
      <p class="rv">Every room below is furnished with pieces from the collection. Tap a marker to see what's in the shot.</p>
    </div>
    <div class="picks-body">
      <div class="picks-room">
        <img class="picks-img" alt="">
        <div class="spots"></div>
        <div class="picks-tabs" role="tablist" aria-label="Rooms">${SPACES.map((s, i) => `<button type="button" role="tab" data-i="${i}" aria-selected="${!i}">${s.label}</button>`).join('')}</div>
      </div>
      <article class="picks-card" aria-live="polite"></article>
    </div>
  </section>

  <section class="store" id="store" aria-labelledby="store-h">
    <div class="wrap store-in">
      <div class="store-copy">
        <p class="eyebrow light rv">The experience store</p>
        <h2 class="display rv" id="store-h">See it. Touch it.<br>Then decide.</h2>
        <p class="rv">We don't run a conventional showroom. Our experience store is where you see, feel and understand the woods, finishes and fabrics we blend into every piece.</p>
        <div class="store-cta rv"><a class="btn btn-cream" href="#/story?s=visit">Book a visit ${icon.arrow}</a><a class="link light" href="tel:+918590777808">${icon.phone} (+91) 8590 777 808</a></div>
      </div>
      <div class="swatches rv">
        ${FINISHES.map((g) => `<div class="sw-group"><h4>${g.wood}</h4><div class="sw-row">${g.items.map(([n, c]) => `<span class="sw wood" style="--c:${c}"><i></i>${n}</span>`).join('')}</div></div>`).join('')}
        ${FABRICS.map((g) => `<div class="sw-group"><h4>${g.name}</h4><div class="sw-row">${g.items.map(([n, c]) => `<span class="sw" style="--c:${c}"><i></i>${n}</span>`).join('')}</div></div>`).join('')}
      </div>
    </div>
  </section>

  <section class="space wrap" aria-labelledby="space-h">
    <div class="space-card rv">
      <div class="space-copy">
        <h2 class="display" id="space-h">Make your<br>own space.</h2>
        <p>Pin pieces, finishes and fabrics to a mood board, see the total add up, then send the whole room to your cart.</p>
        <a class="btn" href="#/board">Open the mood board ${icon.arrow}</a>
      </div>
      <div class="space-collage" aria-hidden="true">
        ${['kairo-sofa', 'ethos-chandigarh-chair', 'evolve-coffee-table', 'hoop-12in'].map((id, i) => `<figure class="pin p${i}"><img src="${thumb(cover(byId[id]))}" alt="" loading="lazy"><figcaption>${esc(byId[id].name)}</figcaption></figure>`).join('')}
        <span class="chip c0" style="--c:#5E3B27">Vintage walnut</span><span class="chip c1" style="--c:#D9C8A9">Urban Jute · Beige</span>
      </div>
    </div>
  </section>

  <section class="journal wrap" aria-labelledby="journal-h">
    <h2 class="display rv" id="journal-h">Homes that<br>tell a story</h2>
    <div class="journal-grid">
      ${JOURNAL.map((j) => `<a class="post rv" href="${j.url}" target="_blank" rel="noopener"><div class="post-img"><img src="${asset(j.img)}" alt="" loading="lazy"></div><span class="eyebrow">${j.tag}</span><h3>${j.t}</h3><span class="link">Read on the journal ${icon.arrow}</span></a>`).join('')}
    </div>
  </section>`;

  const offs = [];
  offs.push(initHero(root));
  initRooms(root);
  initComfort(root);
  initPicks(root);
  reveal(root);
  return () => offs.forEach((f) => f?.());
}

/* ---------- hero ---------- */
function initHero(root) {
  const stage = root.querySelector('.hero-stage');
  const card = root.querySelector('.hero-card');
  const photos = [...root.querySelectorAll('.hero-photo')];
  const cuts = [...root.querySelectorAll('.hero-cut')];
  const thumbs = [...root.querySelectorAll('.hero-thumbs button')];
  const glass = root.querySelector('.hero-glass');
  const tag = root.querySelector('.hero-tag');
  const boxes = SCENES.map(() => null);
  let current = 0;

  // alpha bounds of each cutout (fractions of the frame), measured once on a small canvas
  const measure = (img, i) => new Promise((done) => {
    const go = () => {
      const n = 160;
      const c = document.createElement('canvas');
      c.width = c.height = n;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0, n, n);
      const a = g.getImageData(0, 0, n, n).data;
      let l = n, r = 0, t = n, b = 0;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        if (a[(y * n + x) * 4 + 3] > 40) { if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; if (y > b) b = y; }
      }
      boxes[i] = { l: l / n, r: (r + 1) / n, t: t / n, b: (b + 1) / n };
      done();
    };
    img.complete && img.naturalWidth ? go() : img.addEventListener('load', go, { once: true });
  });

  function fit() {
    const W = card.clientWidth, H = card.clientHeight;
    const word = root.querySelector('.hero-word svg').getBoundingClientRect().height;
    SCENES.forEach((s, i) => {
      const box = boxes[i];
      if (!box) return;
      const chairH = box.b - box.t;
      // scale so the chair stands ~1.18× the card height, but never smaller than cover
      let S = Math.max(W, H, (H * 1.18) / chairH);
      S = Math.min(S, (H + word * 0.62) / chairH);
      S = Math.max(S, W, H);
      const cx = (box.l + box.r) / 2;
      let x = W * s.x - cx * S;
      x = Math.min(0, Math.max(W - S, x));
      let y = H - (box.b + 0.015) * S;
      y = Math.min(0, Math.max(H - S, y));
      for (const el of [photos[i], cuts[i]]) {
        el.style.width = el.style.height = `${S}px`;
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  }

  function show(i) {
    current = i;
    photos.forEach((p, k) => p.classList.toggle('on', k === i));
    cuts.forEach((p, k) => p.classList.toggle('on', k === i));
    thumbs.forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
    const s = SCENES[i];
    const p = byId[s.id];
    glass.dataset.tone = s.tone;
    tag.href = `#/p/${p.id}`;
    tag.innerHTML = `<span>${esc(p.name)}</span><b>${priceLabel(p)}</b>${icon.arrow}`;
  }
  thumbs.forEach((b, i) => b.addEventListener('click', () => { show(i); restart(); }));

  let timer;
  const restart = () => { clearInterval(timer); timer = setInterval(() => show((current + 1) % SCENES.length), 6500); };
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) restart();

  Promise.all(cuts.map(measure)).then(() => { fit(); stage.classList.add('ready'); });
  const ro = new ResizeObserver(fit);
  ro.observe(card);
  return () => { clearInterval(timer); ro.disconnect(); };
}

/* ---------- "designed for every space" ---------- */
function initRooms(root) {
  const links = [...root.querySelectorAll('.rooms-list a')];
  const floats = [...root.querySelectorAll('.float')];
  const pool = (id) => {
    const room = ROOMS.find((r) => r.id === id);
    const list = products.filter((p) => buyable(p) && (!room || room.match(p)));
    // spread picks across the list so the four cards differ in shape
    const step = Math.max(1, Math.floor(list.length / 4));
    return [0, 1, 2, 3].map((k) => list[(k * step) % list.length]);
  };
  function set(id) {
    links.forEach((a) => a.classList.toggle('on', a.dataset.room === id));
    pool(id).forEach((p, i) => {
      const f = floats[i];
      f.classList.remove('swap'); void f.offsetWidth; f.classList.add('swap');
      f.href = `#/p/${p.id}`;
      f.querySelector('img').src = thumb(cover(p));
      f.querySelector('span').textContent = p.name;
    });
  }
  links.forEach((a) => {
    a.addEventListener('mouseenter', () => set(a.dataset.room));
    a.addEventListener('focus', () => set(a.dataset.room));
  });
  set('chairs');
}

/* ---------- sofa slider ---------- */
function initComfort(root) {
  let i = 0;
  const img = root.querySelector('.comfort-img img');
  const name = root.querySelector('.comfort-name');
  const ticks = root.querySelector('.ticks');
  const price = root.querySelector('.comfort-buy .price');
  const more = root.querySelector('.comfort-buy .more');
  const band = root.querySelector('.comfort-band');
  const add = root.querySelector('.comfort-buy .add');
  function render() {
    const p = SOFAS[i];
    const pic = edition(p, 0).images.find((n) => /3S|3-2|2S/i.test(n)) || cover(p);
    img.classList.remove('swap'); void img.offsetWidth; img.classList.add('swap');
    img.src = photo(pic);
    img.alt = p.name;
    name.textContent = p.name;
    ticks.innerHTML = featureList(p).map((t) => `<li>${icon.check}${esc(t)}</li>`).join('');
    price.textContent = priceLabel(p);
    more.href = `#/p/${p.id}`;
    const next = [1, 2, 3].map((k) => SOFAS[(i + k) % SOFAS.length]);
    band.innerHTML = next.map((q) => `<button type="button" class="mini" data-id="${q.id}"><img src="${thumb(cover(q))}" alt=""><span>${esc(q.name.replace(' Sofa', ''))}</span></button>`).join('');
  }
  root.querySelectorAll('.comfort .arrow').forEach((b) => b.addEventListener('click', () => {
    i = (i + Number(b.dataset.step) + SOFAS.length) % SOFAS.length;
    render();
  }));
  band.addEventListener('click', (e) => {
    const m = e.target.closest('.mini');
    if (m) { i = SOFAS.findIndex((p) => p.id === m.dataset.id); render(); }
  });
  add.addEventListener('click', () => {
    const p = SOFAS[i];
    cart.add(p.id, 0, defaultSelection(p, 0));
  });
  render();
}

/* ---------- hotspot rooms ---------- */
function initPicks(root) {
  const img = root.querySelector('.picks-img');
  const spots = root.querySelector('.spots');
  const cardEl = root.querySelector('.picks-card');
  const tabs = [...root.querySelectorAll('.picks-tabs button')];
  let space = 0;
  function pick(id) {
    const p = byId[id];
    spots.querySelectorAll('.spot').forEach((s) => s.classList.toggle('on', s.dataset.id === id));
    const e = edition(p, 0);
    const rows = [];
    if (p.editions.some((x) => x.wood)) rows.push([icon.tree, p.editions.map((x) => WOODS[x.wood]?.label).filter(Boolean).join(' or ')]);
    const fin = e.options.find((o) => o.key === 'finish');
    if (fin) rows.push([icon.drop, fin.values.map((v) => v.label).join(' / ') + ' finish']);
    const fab = e.options.find((o) => /jute|touch|velvet|leather/.test(o.key));
    if (fab) rows.push([icon.sofa, `${fab.label.replace('Fabric · ', '')} — ${fab.values.length} shades`]);
    const size = e.options.find((o) => /seater|size/.test(o.key));
    if (size) rows.push([icon.ruler, size.values.map((v) => v.label).join(' · ')]);
    if (e.dimensions) rows.push([icon.ruler, e.dimensions]);
    if (rows.length < 2) rows.push([icon.check, 'Designed, crafted & produced by Subtle']);
    const sel = defaultSelection(p, 0);
    cardEl.innerHTML = `
      <h3>${esc(p.name)}</h3>
      <p class="muted">${esc(firstSentence(p.description))}</p>
      <ul class="spec">${rows.map(([ic, t]) => `<li>${ic}<span>${esc(t)}</span></li>`).join('')}</ul>
      <div class="picks-buy"><b>${inr(priceOf(p, 0, sel))}</b><button type="button" class="btn btn-sm" data-add="${p.id}">Add to cart ${icon.arrow}</button></div>
      <a class="link" href="#/p/${p.id}">See every option ${icon.arrow}</a>`;
    cardEl.classList.remove('swap'); void cardEl.offsetWidth; cardEl.classList.add('swap');
  }
  function setSpace(i) {
    space = i;
    const s = SPACES[i];
    tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
    img.src = asset(s.img);
    img.alt = `${s.label} furnished by Subtle`;
    spots.innerHTML = s.spots.map((sp) => `<button type="button" class="spot" data-id="${sp.id}" style="left:${sp.x}%;top:${sp.y}%" aria-label="${esc(byId[sp.id].name)}"><i>${icon.plus}</i><span>${esc(byId[sp.id].name)}</span></button>`).join('');
    pick(s.spots[0].id);
  }
  spots.addEventListener('click', (e) => { const b = e.target.closest('.spot'); if (b) pick(b.dataset.id); });
  tabs.forEach((t, i) => t.addEventListener('click', () => setSpace(i)));
  cardEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (b) { const p = byId[b.dataset.add]; cart.add(p.id, 0, defaultSelection(p, 0)); }
  });
  setSpace(space);
}
