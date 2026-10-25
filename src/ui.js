// Shared markup: the traced wordmark, icons, the rotating shop badge and product cards.
import logoSvg from './assets/subtle.svg?raw';
import { thumb, cover, secondImage, priceLabel, WOODS, buyable } from './catalogue.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const logo = (cls = '') => logoSvg.replace('<svg ', `<svg class="${cls}" role="img" aria-label="subtle." `);

const path = (d, extra = '') => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" ${extra}><path d="${d}"/></svg>`;
export const icon = {
  arrow: path('M7 17 17 7M8 7h9v9'),
  right: path('M5 12h14M13 6l6 6-6 6'),
  left: path('M19 12H5M11 6l-6 6 6 6'),
  bag: path('M5 8h14l-1 12H6L5 8Zm4 0a3 3 0 0 1 6 0'),
  close: path('M6 6l12 12M18 6 6 18'),
  plus: path('M12 5v14M5 12h14'),
  minus: path('M5 12h14'),
  check: path('m5 12 4.5 4.5L19 7'),
  menu: path('M4 8h16M4 16h16'),
  phone: path('M6.6 3h3l1.5 4.5-2.2 1.4a12 12 0 0 0 6.2 6.2l1.4-2.2L21 14.4v3A2.6 2.6 0 0 1 18.4 20 15.4 15.4 0 0 1 4 5.6 2.6 2.6 0 0 1 6.6 3Z'),
  pin: path('M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'),
  tree: path('M12 3 6 11h3l-4 6h14l-4-6h3l-6-8Zm0 14v4'),
  ruler: path('M3 16 16 3l5 5L8 21l-5-5Zm4-1 2 2m1-5 2 2m1-5 2 2'),
  drop: path('M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z'),
  sofa: path('M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2v-5Zm2 5v2m16-2v2'),
  truck: path('M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'),
  rotate: path('M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5'),
  heart: path('M12 20s-8-4.6-8-10.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.4 12 20 12 20Z'),
};

let badgeId = 0;
export function badge(text = 'Shop furniture', href = '#/shop', cls = '') {
  const id = `bp${++badgeId}`;
  const label = `${text} • ${text} • `.toUpperCase();
  return `<a class="badge ${cls}" href="${href}" aria-label="${esc(text)}">
    <svg class="badge-ring" viewBox="0 0 200 200" aria-hidden="true">
      <defs><path id="${id}" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/></defs>
      <text><textPath href="#${id}" textLength="462">${esc(label)}</textPath></text>
    </svg>
    <span class="badge-core">${icon.arrow}</span>
  </a>`;
}

export function productCard(p, { tilt = false } = {}) {
  const second = secondImage(p);
  const woods = p.editions.map((e) => e.wood).filter(Boolean);
  return `<a class="card ${tilt ? 'card-tilt' : ''}" href="#/p/${p.id}" data-id="${p.id}">
    <div class="card-img">
      <img src="${thumb(cover(p))}" alt="${esc(p.name)}" loading="lazy" decoding="async">
      ${second ? `<img class="card-alt" src="${thumb(second)}" alt="" loading="lazy" decoding="async">` : ''}
      ${!buyable(p) ? '<span class="card-flag">Coming soon</span>' : ''}
    </div>
    <div class="card-meta">
      <div><h3>${esc(p.name)}</h3><p>${esc(p.typeLabel)}${woods.length ? ' · ' + woods.map((w) => WOODS[w].label).join(' / ') : ''}</p></div>
      <span class="card-price">${priceLabel(p)}</span>
    </div>
  </a>`;
}

// fade/rise elements in as they scroll into view
let io;
export function reveal(root = document) {
  io ??= new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  root.querySelectorAll('.rv:not(.in)').forEach((el) => io.observe(el));
}

export function toast(html) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  document.body.append(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 2600);
}
