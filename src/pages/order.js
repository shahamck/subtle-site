import { inr, thumb } from '../catalogue.js';
import { orders } from '../store.js';
import { icon, esc, logo } from '../ui.js';
import { day } from './checkout.js';

export default function order(root, id) {
  const o = orders.get(id);
  if (!o) {
    root.innerHTML = `<section class="wrap notfound"><h1 class="display">Order not found.</h1><p>Orders live in the browser they were placed in.</p><a class="btn" href="#/shop">Back to the shop ${icon.arrow}</a></section>`;
    return;
  }
  const placed = new Date(o.placed);
  const delivery = new Date(o.date);
  const crafted = new Date(placed); crafted.setDate(crafted.getDate() + Math.max(1, Math.round((delivery - placed) / 864e5) - 4));
  const steps = [
    ['Order confirmed', day(placed), true],
    ['Finishing & quality check', `by ${day(crafted)}`, false],
    ['Out for delivery', day(delivery), false],
    ['Delivered & placed', `${day(delivery)} · ${o.slot.toLowerCase()}`, false],
  ];
  root.innerHTML = `
  <section class="done wrap">
    <div class="done-card">
      <div class="done-mark">${icon.check}</div>
      <p class="eyebrow">Order ${esc(o.id)}</p>
      <h1 class="display">Thank you, ${esc(o.name.split(' ')[0])}.</h1>
      <p>Your order is confirmed. We'll call before we deliver to ${esc(o.city)}, ${esc(o.state)}.</p>
      <ol class="timeline">${steps.map(([t, d, on]) => `<li class="${on ? 'on' : ''}"><i></i><b>${t}</b><span>${d}</span></li>`).join('')}</ol>
      <div class="done-lines">${o.lines.map((l) => `<div class="co-line"><span class="co-img"><img src="${thumb(l.image)}" alt=""><b>${l.qty}</b></span><span><b>${esc(l.name)}</b><small>${esc(l.detail)}</small></span><span>${inr(l.price * l.qty)}</span></div>`).join('')}</div>
      <div class="sum-row total"><span>Total · ${esc(o.pay)}</span><b>${inr(o.total)}</b></div>
      <div class="done-cta"><a class="btn" href="#/shop">Keep shopping ${icon.arrow}</a><a class="btn btn-ghost" href="#/board">Plan the next room</a></div>
    </div>
    <div class="done-word" aria-hidden="true">${logo()}</div>
  </section>`;
}
