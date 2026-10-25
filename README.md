# subtle. — concept store

A redesign concept for [subtleconcepts.in](https://subtleconcepts.in): the live Subtle catalogue
(72 products, real prices, copy, options and renders) in a new storefront whose layout follows the
Furnio reference — giant wordmark with the chair breaking out of the hero photo, framed sheet,
notched stat card, rotating "shop furniture" badge, floating category cards, hotspot rooms.

```
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ (relative paths, hash routing — host anywhere)
```

## Pages
- `#/` home · `#/shop` collection (room, wood, search, sort) · `#/p/:id` product (Ashwood/Mahogany,
  finish, fabric, size, live price, gallery with swipe) · `#/board` mood board · `#/checkout` ·
  `#/order/:id` · `#/story`
- Cart, mood board and orders are saved in the browser only. Checkout is a prototype — no payment,
  nothing is sent.

## Data pipeline
- `scripts/scrape.py` → `raw/catalogue.json` (every product page on the live site)
- `scripts/build-catalogue.py` → `src/data/catalogue.json` (Ashwood/Mahogany twins merged into one
  product, option swatches, per-combination prices) and resized photos in `public/p` (1000px) / `public/t` (560px)
- `scripts/cutout.swift` — macOS Vision subject cutouts for the hero (`public/hero/*.png`, full-frame so
  they overlay the photo exactly)
- `scripts/trace-logo.swift` — traces the raster logo into `src/assets/subtle.svg`

Brand: navy `#0C3052`, cream `#F8F0E6`, ashwood frame `#C9A27C`; Inter + Archivo Expanded.
