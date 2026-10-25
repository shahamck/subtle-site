import { inr, thumb } from '../catalogue.js';
import { cart, orders } from '../store.js';
import { icon, esc } from '../ui.js';

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
const SLOTS = [['morning', 'Morning', '10 AM – 1 PM'], ['afternoon', 'Afternoon', '1 – 4 PM'], ['evening', 'Evening', '4 – 8 PM']];
const PAY = [['upi', 'UPI', 'Any UPI app'], ['card', 'Card', 'Credit or debit'], ['cod', 'Pay on delivery', 'Cash or UPI at the door']];

const day = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export default function checkout(root) {
  const lines = cart.lines();
  if (!lines.length) {
    root.innerHTML = `<section class="wrap notfound"><h1 class="display">Your cart is empty.</h1><p>Add a piece or two, then come back to check out.</p><a class="btn" href="#/shop">Shop the collection ${icon.arrow}</a></section>`;
    return;
  }
  // furniture is made to order: first delivery date ~3 weeks out, decor-only carts sooner
  const decorOnly = lines.every((l) => l.product.dept === 'decor');
  const first = new Date();
  first.setDate(first.getDate() + (decorOnly ? 5 : 21));
  const dates = Array.from({ length: 8 }, (_, i) => { const d = new Date(first); d.setDate(d.getDate() + i); return d; }).filter((d) => d.getDay() !== 0).slice(0, 6);

  root.innerHTML = `
  <section class="co wrap">
    <a class="link back" href="#/shop">${icon.left} Keep shopping</a>
    <h1 class="display">Checkout</h1>
    <p class="notice">${icon.check} Concept store — this checkout is a working prototype. Nothing is charged and no details leave your browser.</p>
    <div class="co-grid">
      <form class="co-form" novalidate>
        <fieldset>
          <legend><b>1</b> Contact</legend>
          <div class="row2">
            ${field('name', 'Full name', 'text', 'name')}
            ${field('phone', 'Mobile number', 'tel', 'tel', 'pattern="[0-9 +]{10,14}" inputmode="tel"')}
          </div>
          ${field('email', 'Email', 'email', 'email')}
        </fieldset>
        <fieldset>
          <legend><b>2</b> Delivery address</legend>
          ${field('addr', 'House, street, area', 'text', 'street-address')}
          <div class="row3">
            ${field('city', 'City', 'text', 'address-level2')}
            <label class="f"><span>State</span><select name="state" required autocomplete="address-level1"><option value="">Select</option>${STATES.map((s) => `<option${s === 'Kerala' ? ' selected' : ''}>${s}</option>`).join('')}</select><em class="err">Choose a state</em></label>
            ${field('pin', 'PIN code', 'text', 'postal-code', 'pattern="[1-9][0-9]{5}" inputmode="numeric" maxlength="6"')}
          </div>
        </fieldset>
        <fieldset>
          <legend><b>3</b> Delivery slot</legend>
          <p class="muted small">${decorOnly ? 'Decor ships within the week.' : 'Pieces are finished to order — the first available slot is about three weeks out.'}</p>
          <div class="dates" role="radiogroup" aria-label="Delivery date">${dates.map((d, i) => `<label class="tile"><input type="radio" name="date" value="${d.toISOString()}" ${i ? '' : 'checked'}><span><b>${d.toLocaleDateString('en-IN', { weekday: 'short' })}</b>${d.getDate()} ${d.toLocaleDateString('en-IN', { month: 'short' })}</span></label>`).join('')}</div>
          <div class="slots" role="radiogroup" aria-label="Time">${SLOTS.map(([v, l, t], i) => `<label class="tile wide"><input type="radio" name="slot" value="${v}" ${i ? '' : 'checked'}><span><b>${l}</b>${t}</span></label>`).join('')}</div>
        </fieldset>
        <fieldset>
          <legend><b>4</b> Payment</legend>
          <div class="pays">${PAY.map(([v, l, t], i) => `<label class="tile wide"><input type="radio" name="pay" value="${v}" ${i ? '' : 'checked'}><span><b>${l}</b>${t}</span></label>`).join('')}</div>
          <p class="muted small">In this prototype the order is placed without taking payment.</p>
        </fieldset>
        <button type="submit" class="btn btn-block btn-lg">Place order · ${inr(cart.subtotal())}</button>
      </form>
      <aside class="co-sum">
        <h2>Order summary</h2>
        <div class="co-lines">${lines.map((l) => `<div class="co-line"><span class="co-img"><img src="${thumb(l.image)}" alt=""><b>${l.qty}</b></span><span><b>${esc(l.product.name)}</b><small>${esc(l.detail)}</small></span><span>${inr(l.price * l.qty)}</span></div>`).join('')}</div>
        <div class="sum-row"><span>Subtotal</span><span>${inr(cart.subtotal())}</span></div>
        <div class="sum-row"><span>Delivery</span><span>Free in selected areas</span></div>
        <div class="sum-row total"><span>Total</span><b>${inr(cart.subtotal())}</b></div>
        <p class="muted small">Prices include GST.</p>
      </aside>
    </div>
  </section>`;

  const form = root.querySelector('.co-form');
  form.addEventListener('input', (e) => e.target.closest('.f')?.classList.remove('bad'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstBad = null;
    form.querySelectorAll('input[required], select[required]').forEach((el) => {
      const ok = el.checkValidity() && el.value.trim() !== '';
      el.closest('.f').classList.toggle('bad', !ok);
      if (!ok && !firstBad) firstBad = el;
    });
    if (firstBad) { firstBad.focus(); return; }
    const data = Object.fromEntries(new FormData(form));
    const id = 'SBT-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    orders.save({
      id, placed: new Date().toISOString(), name: data.name, city: data.city, state: data.state,
      date: data.date, slot: SLOTS.find((s) => s[0] === data.slot)[1], pay: PAY.find((p) => p[0] === data.pay)[1],
      total: cart.subtotal(),
      lines: cart.lines().map((l) => ({ id: l.id, name: l.product.name, detail: l.detail, qty: l.qty, price: l.price, image: l.image, decor: l.product.dept === 'decor' })),
    });
    cart.clear();
    location.hash = `#/order/${id}`;
  });
}

function field(name, label, type, auto, extra = '') {
  return `<label class="f"><span>${label}</span><input name="${name}" type="${type}" required autocomplete="${auto}" ${extra}><em class="err">${type === 'email' ? 'Enter a valid email' : name === 'pin' ? 'Enter a 6-digit PIN code' : name === 'phone' ? 'Enter a 10-digit mobile number' : 'Required'}</em></label>`;
}

export { day };
