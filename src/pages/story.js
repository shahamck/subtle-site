import { asset } from '../catalogue.js';
import { icon, badge, reveal } from '../ui.js';

export default function story(root) {
  root.innerHTML = `
  <section class="story wrap">
    <header class="story-head">
      <p class="eyebrow rv">Our story</p>
      <h1 class="display rv">Design meets purpose.<br>Passion meets innovation.</h1>
    </header>
    <div class="story-grid">
      <div class="story-img rv"><img src="${asset('rooms/Home-banner-3.jpg')}" alt="Bedroom with the Solace bed and Cross nightstand"></div>
      <div class="story-copy rv">
        <p class="lead">Subtle is a furniture and home decor brand. We design, create and craft pieces that lift the quality of everyday life.</p>
        <p>We travelled across India to understand raw materials, then selected and developed them through trial and error. Our ashwood is imported from Europe and America; our mahogany is finished in imported stains.</p>
        <p>We also partner with architects in our segment — a community built on collaboration, not competition.</p>
        <ul class="values">
          <li><b>Value for money</b><span>Quality pieces at prices that fit your budget.</span></li>
          <li><b>Free shipping</b><span>Fast, safe delivery in selected areas.</span></li>
          <li><b>Expert service</b><span>Our team is on hand seven days a week.</span></li>
          <li><b>Unique selection</b><span>Naturally crafted, designed in-house.</span></li>
        </ul>
      </div>
    </div>
  </section>

  <section class="store store-page" id="store">
    <div class="wrap store-in">
      <div class="store-copy">
        <p class="eyebrow light">The experience store</p>
        <h2 class="display">Not a showroom.<br>An experience store.</h2>
        <p>We don't keep a conventional retail store. Instead you can see, feel and understand the types of wood, the finishes, the fabrics — every material we blend into a piece — and how it will sit in your space.</p>
      </div>
      <div class="store-photo"><img src="${asset('rooms/Home-banner.jpg')}" alt="Living room with the Kairo sofa and Ethos chair" loading="lazy">${badge('Book a visit', '#/story?s=visit', 'store-badge')}</div>
    </div>
  </section>

  <section class="visit wrap" id="visit">
    <h2 class="display rv">Visit or call</h2>
    <div class="visit-grid">
      <a class="visit-card rv" href="tel:+918590777808">${icon.phone}<b>(+91) 8590 777 808</b><span>Monday – Saturday · 10:00 AM – 8:00 PM</span></a>
      <a class="visit-card rv" href="https://www.instagram.com/subtleconcepts/" target="_blank" rel="noopener">${icon.heart}<b>@subtleconcepts</b><span>New pieces and rooms, first on Instagram</span></a>
      <a class="visit-card rv" href="https://subtleconcepts.in/contact-us/" target="_blank" rel="noopener">${icon.pin}<b>Book the experience store</b><span>Send us a note and we'll set a time</span></a>
    </div>
  </section>`;
  reveal(root);
}
