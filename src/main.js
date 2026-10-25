import '@fontsource-variable/inter';
import '@fontsource-variable/archivo/wdth.css';
import './style.css';
import { cart } from './store.js';
import { inr, thumb } from './catalogue.js';
import { logo, icon, esc, toast, reveal } from './ui.js';
import home from './pages/home.js';
import shop from './pages/shop.js';
import product from './pages/product.js';
import moodboard from './pages/moodboard.js';
import checkout from './pages/checkout.js';
import order from './pages/order.js';
import story from './pages/story.js';

const app = document.getElementById('app');

app.innerHTML = `
  <a class="skip" href="#view">Skip to content</a>
  <div class="sheet">
    <header class="head">
      <a class="head-logo" href="#/" aria-label="subtle. home">${logo()}</a>
      <nav class="head-nav" aria-label="Main">
        <a href="#/" data-nav="home">Home</a><i></i>
        <a href="#/shop" data-nav="shop">Shop</a><i></i>
        <a href="#/board" data-nav="board">Mood board</a><i></i>
        <a href="#/story" data-nav="story">Story</a><i></i>
        <a href="#/story?s=visit" data-nav="visit">Contact</a>
      </nav>
      <button class="head-cart" type="button" aria-label="Open cart">${icon.bag}<span>Cart</span><b class="cart-count">0</b></button>
      <button class="head-menu" type="button" aria-label="Menu" aria-expanded="false">${icon.menu}</button>
    </header>
    <main id="view" tabindex="-1"></main>
    <footer class="foot">
      <div class="foot-photo"><img src="${import.meta.env.BASE_URL}rooms/Home-banner-4.jpg" alt="" loading="lazy"></div>
      <div class="foot-word">${logo()}</div>
      <div class="foot-panel">
        <div class="foot-cols">
          <div><h4>Shop</h4><a href="#/shop?room=sofas">Sofas</a><a href="#/shop?room=chairs">Chairs</a><a href="#/shop?room=dining">Dining</a><a href="#/shop?room=bedroom">Bedroom</a><a href="#/shop?room=decor">Home decor</a></div>
          <div><h4>Subtle</h4><a href="#/story">Our story</a><a href="#/story?s=store">Experience store</a><a href="#/board">Mood board</a><a href="https://subtleconcepts.in/our-favourite-types-of-modern-dining-chairs/" target="_blank" rel="noopener">Journal</a></div>
          <div><h4>Help</h4><a href="https://subtleconcepts.in/shipping-policy/" target="_blank" rel="noopener">Shipping</a><a href="https://subtleconcepts.in/return-and-refund/" target="_blank" rel="noopener">Returns &amp; refunds</a><a href="https://subtleconcepts.in/warranty-policy/" target="_blank" rel="noopener">Warranty</a><a href="https://subtleconcepts.in/terms-of-use/" target="_blank" rel="noopener">Terms</a></div>
          <div class="foot-news">
            <h4>Join the list</h4>
            <p>New pieces, finishes and studio notes. No noise.</p>
            <form class="news" novalidate><label class="sr" for="news-mail">Email</label><input id="news-mail" type="email" placeholder="Enter your email" autocomplete="email"><button type="submit" aria-label="Subscribe">${icon.arrow}</button></form>
            <p class="foot-call">${icon.phone}<a href="tel:+918590777808">(+91) 8590 777 808</a><span>Mon–Sat · 10 AM – 8 PM</span></p>
          </div>
        </div>
        <div class="foot-base">
          <span>© ${new Date().getFullYear()} Subtle Concepts</span>
          <span class="foot-social"><a href="https://www.instagram.com/subtleconcepts/" target="_blank" rel="noopener">Instagram</a><a href="https://subtleconcepts.in/privacy-policy/" target="_blank" rel="noopener">Privacy</a></span>
          <span>Concept redesign · prices from subtleconcepts.in</span>
        </div>
      </div>
    </footer>
  </div>

  <div class="drawer" aria-hidden="true">
    <button class="drawer-scrim" type="button" aria-label="Close cart" tabindex="-1"></button>
    <aside class="drawer-panel" role="dialog" aria-modal="true" aria-label="Cart">
      <div class="drawer-head"><h2>Your cart <span class="cart-count">0</span></h2><button class="drawer-x" type="button" aria-label="Close">${icon.close}</button></div>
      <div class="drawer-body"></div>
      <div class="drawer-foot"></div>
    </aside>
  </div>
  <div class="mnav" aria-hidden="true">
    <nav aria-label="Mobile">
      <a href="#/">Home</a><a href="#/shop">Shop</a><a href="#/board">Mood board</a><a href="#/story">Story</a><a href="#/story?s=visit">Contact</a>
    </nav>
  </div>
`;

/* ---------- cart drawer ---------- */
const drawer = app.querySelector('.drawer');
const drawerBody = drawer.querySelector('.drawer-body');
const drawerFoot = drawer.querySelector('.drawer-foot');
let lastFocus = null;

function renderCart() {
  const lines = cart.lines();
  app.querySelectorAll('.cart-count').forEach((el) => { el.textContent = cart.count(); });
  app.querySelector('.head-cart').classList.toggle('has', cart.count() > 0);
  if (!lines.length) {
    drawerBody.innerHTML = `<div class="drawer-empty"><p>Your cart is empty.</p><p class="muted">Every piece is designed, crafted and produced by Subtle.</p><a class="btn" href="#/shop">Browse the collection ${icon.arrow}</a></div>`;
    drawerFoot.innerHTML = '';
    return;
  }
  drawerBody.innerHTML = lines.map((l) => `
    <div class="line">
      <a href="#/p/${l.id}" class="line-img"><img src="${thumb(l.image)}" alt=""></a>
      <div class="line-info">
        <a href="#/p/${l.id}" class="line-name">${esc(l.product.name)}</a>
        <p class="muted">${esc(l.detail)}</p>
        <div class="qty" data-key="${esc(l.key)}">
          <button type="button" data-d="-1" aria-label="Decrease">${icon.minus}</button><span>${l.qty}</span><button type="button" data-d="1" aria-label="Increase">${icon.plus}</button>
        </div>
      </div>
      <div class="line-end"><b>${inr(l.price * l.qty)}</b><button class="link" type="button" data-remove="${esc(l.key)}">Remove</button></div>
    </div>`).join('');
  drawerFoot.innerHTML = `
    <div class="sum-row"><span>Subtotal</span><b>${inr(cart.subtotal())}</b></div>
    <p class="muted small">${icon.truck} Free delivery in selected areas · GST included</p>
    <a class="btn btn-block" href="#/checkout">Checkout ${icon.arrow}</a>`;
}

drawer.addEventListener('click', (e) => {
  const q = e.target.closest('.qty button');
  if (q) {
    const key = q.parentElement.dataset.key;
    const line = cart.lines().find((l) => l.key === key);
    cart.setQty(key, line.qty + Number(q.dataset.d));
  }
  const rm = e.target.closest('[data-remove]');
  if (rm) cart.setQty(rm.dataset.remove, 0);
  if (e.target.closest('.drawer-x, .drawer-scrim') || e.target.closest('.drawer a')) closeCart();
});

export function openCart() {
  lastFocus = document.activeElement;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('locked');
  setTimeout(() => drawer.querySelector('.drawer-x').focus(), 50);
}
function closeCart() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('locked');
  lastFocus?.focus?.();
}
app.querySelector('.head-cart').addEventListener('click', openCart);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCart(); closeMenu(); } });
cart.on(renderCart);
cart.onAdded(() => {
  const btn = app.querySelector('.head-cart');
  btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  toast(`${icon.check}<span>Added to cart</span><button type="button" class="link toast-open">View cart</button>`);
});
document.addEventListener('click', (e) => { if (e.target.closest('.toast-open')) openCart(); });
renderCart();

/* ---------- mobile menu ---------- */
const mnav = app.querySelector('.mnav');
const menuBtn = app.querySelector('.head-menu');
function closeMenu() { mnav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('menu-open'); }
menuBtn.addEventListener('click', () => {
  const open = !mnav.classList.contains('open');
  mnav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  document.documentElement.classList.toggle('menu-open', open);
});
mnav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });

/* ---------- newsletter (concept: nothing is sent) ---------- */
app.querySelector('.news').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (!/^\S+@\S+\.\S+$/.test(input.value)) { input.focus(); input.classList.add('bad'); return; }
  input.classList.remove('bad');
  input.value = '';
  toast(`${icon.check}<span>You're on the list.</span>`);
});

/* ---------- router ---------- */
const view = app.querySelector('#view');
let cleanup = null;

export function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(qs || '') };
}

function route() {
  const { parts, query } = parseHash();
  const [head, arg] = parts;
  cleanup?.();
  cleanup = null;
  view.classList.remove('enter');
  void view.offsetWidth;
  view.classList.add('enter');
  let page = 'home';
  if (!head) cleanup = home(view);
  else if (head === 'shop') { page = 'shop'; cleanup = shop(view, query); }
  else if (head === 'p' && arg) { page = 'shop'; cleanup = product(view, arg, { openCart }); }
  else if (head === 'board') { page = 'board'; cleanup = moodboard(view); }
  else if (head === 'checkout') { page = 'checkout'; cleanup = checkout(view); }
  else if (head === 'order' && arg) { page = 'order'; cleanup = order(view, arg); }
  else if (head === 'story') { page = query.get('s') === 'visit' ? 'visit' : 'story'; cleanup = story(view, query); }
  else view.innerHTML = `<section class="wrap notfound"><h1 class="display">Nothing here.</h1><p>That page doesn't exist — but the collection does.</p><a class="btn" href="#/shop">Shop the collection ${icon.arrow}</a></section>`;
  app.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === page));
  document.body.dataset.page = page;
  const target = query.get('s') && document.getElementById(query.get('s'));
  if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 60);
  else window.scrollTo({ top: 0, behavior: 'instant' });
  reveal(view);
}

window.addEventListener('hashchange', route);
route();
