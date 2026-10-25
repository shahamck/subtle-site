# Turns raw/catalogue.json (scraped from subtleconcepts.in) into src/data/catalogue.json:
# Ashwood / Mahogany twins merged into one product with two "woods", option groups with
# swatches and per-combination prices, and images resized into public/p/.
# Run: python3 -I scripts/build-catalogue.py
import json, os, re, subprocess
from concurrent.futures import ThreadPoolExecutor

RAW = json.load(open('raw/catalogue.json'))
OUT_IMG = 'public/p'
os.makedirs(OUT_IMG, exist_ok=True)

# category slug on the live site -> (department, room, label)
CATS = {
    'chair': ('seating', 'dining', 'Chairs'),
    'sofa': ('seating', 'living', 'Sofas'),
    'dining-table': ('tables', 'dining', 'Dining tables'),
    'coffee-table': ('tables', 'living', 'Coffee tables'),
    'work-study-table': ('tables', 'work', 'Study tables'),
    'media-console': ('storage', 'living', 'Media consoles'),
    'storage-console': ('storage', 'living', 'Storage consoles'),
    'crockery-unit': ('storage', 'dining', 'Crockery units'),
    'shoerack': ('storage', 'entryway', 'Shoe racks'),
    'bed': ('bedroom', 'bedroom', 'Beds'),
    'night-stand': ('bedroom', 'bedroom', 'Nightstands'),
    'ceramic': ('decor', 'living', 'Ceramics'),
    'terracotta': ('decor', 'living', 'Terracotta'),
    'decor': ('decor', 'living', 'Ceramics'),
}
PRIORITY = list(CATS)

OPTION_LABEL = {
    'finish': 'Finish', 'urban-jute': 'Fabric · Urban Jute', 'touch': 'Fabric · Touch',
    'velvet': 'Fabric · Velvet', 'artificial-leather': 'Leather', 'seater': 'Seater',
    'table-size': 'Table size', 'bed-size': 'Bed size', 'size': 'Size', 'color': 'Colour',
}
SWATCH = {
    'teak': '#B47C46', 'vintage-walnut': '#5E3B27', 'caramel-brown': '#8E5A2E', 'cherry-red': '#7B2A22',
    'ebony-black': '#2B2522', 'beige': '#D9C8A9', 'soft-white': '#EFE9DD', 'warm-grey': '#A59C90',
    'cool-grey': '#9BA1A7', 'pale-oyster': '#D8CDBD', 'dark-wine': '#5C1F2B', 'navy-blue': '#1F2F52',
    'battle-green': '#3E4B36', 'brown': '#6C4A35', 'black': '#232323', 'natural': '#B7663F',
    'white': '#F4F2EE', 'off-white': '#ECE6DB', 'grey': '#9B9B9B', 'ice-blue': '#BDD2DB',
    'pink': '#E6C2BC', 'green': '#7F8F6E', 'blue': '#5D7FA6', 'yellow': '#E2C15A',
    'ocean-green': '#2F5D5A', 'slate-black': '#34383C', 'pastel-pink': '#EBC9C3', 'sage-green': '#A9B49A',
    'white-grey': 'linear-gradient(135deg, #F4F2EE 50%, #A7A7A7 50%)', 'pebble-blue': '#8E9FAE', 'soft-amber': '#C99A5B',
    'star-dust': '#B9B4AC', 'olive-green': '#6B6B3A',
}
NICE = {'1': '1 seater', '2': '2 seater', '3': '3 seater', '3-2': '3 + 2 seater', '3+2': '3 + 2 seater',
        '4-seater': '4 seater', '6-seater': '6 seater', '8-seater': '8 seater'}


def nice(v):
    return NICE.get(v, v.replace('-', ' ').capitalize())


def local(url):
    return os.path.join('raw/img', url.split('/uploads/')[1].replace('/', '_'))


def out_name(url):
    base = os.path.splitext(url.split('/uploads/')[1].replace('/', '_'))[0]
    return re.sub(r'[^A-Za-z0-9_-]+', '-', base) + '.jpg'


def family_name(name):
    n = re.sub(r'\s*[-–]?\s*(Ashwood|Mahogany)\s*$', '', name).strip(' -–')
    n = n.replace('Arm Chair', 'Armchair').replace('Olyn Dining', 'Olyn Dining Table').replace('Hane Table', 'Hane Dining Table')
    if n.isupper():
        n = n.title().replace('″', '″')
    return n


def wood_of(name):
    return 'ashwood' if 'Ashwood' in name else 'mahogany' if 'Mahogany' in name else None


def prices(text):
    return [int(x.replace(',', '')) for x in re.findall(r'₹\s*([\d,]+)', text)]


def dims(p):
    d = p['attributes'].get('Dimensions', '')
    if d and d != 'N/A':
        return d
    for v in p['variations']:
        dd = v.get('dimensions') or {}
        if dd.get('length') and dd.get('width') and dd.get('height'):
            return f"{dd['length']} × {dd['width']} × {dd['height']} cm"
    return None


def clean_desc(s):
    s = re.sub(r'Show More Show Less', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    s = s.replace('masterpiec ', 'masterpiece ')
    # undo line-break hyphenation from the source copy: "em- braces" -> "embraces", "A- shaped" -> "A-shaped"
    s = re.sub(r'\b([A-Z])- ([a-z])', r'\1-\2', s)
    s = re.sub(r'([a-z])- ([a-z])', r'\1\2', s)
    return s


def edition(p):
    """One wood (or the only version) of a product: its options, prices and images."""
    vs = p['variations']
    groups = {}
    for v in vs:
        for k, val in v['attributes'].items():
            key = k.replace('attribute_pa_', '').replace('attribute_', '')
            if val:
                groups.setdefault(key, [])
                if val not in groups[key]:
                    groups[key].append(val)
    pr = prices(p['price'])
    # products whose variations weren't exposed: rebuild the option from the spec table
    if not vs:
        for label, key in (('Seater', 'seater'), ('Bed Size', 'bed-size'), ('Table Size', 'table-size'), ('Size', 'size')):
            raw = p['attributes'].get(label)
            if raw:
                vals = [x.replace('+', '-') if key == 'seater' else x.lower() for x in raw.split()]
                vals = [x[:-1] if key == 'seater' and x.endswith('S') else x for x in vals]
                groups[key] = vals
    combos = []
    for v in vs:
        combos.append({'o': {k.replace('attribute_pa_', '').replace('attribute_', ''): val for k, val in v['attributes'].items() if val},
                       'price': int(round(v['price'])),
                       'img': out_name(v['image']) if v.get('image') else None})
    if not vs and pr and groups:
        key = next(iter(groups))
        vals = groups[key]
        lo, hi = min(pr), max(pr)
        for i, val in enumerate(vals):
            price = lo if len(vals) == 1 else round((lo + (hi - lo) * i / (len(vals) - 1)) / 100) * 100
            combos.append({'o': {key: val}, 'price': price, 'img': None})
    options = []
    for key, vals in groups.items():
        options.append({'key': key, 'label': OPTION_LABEL.get(key, key.replace('-', ' ').capitalize()),
                        'values': [{'id': v, 'label': nice(v), 'swatch': SWATCH.get(v)} for v in vals]})
    # put finish first, then fabric, then size-like
    order = ['finish', 'color', 'urban-jute', 'touch', 'velvet', 'artificial-leather', 'seater', 'table-size', 'bed-size', 'size']
    options.sort(key=lambda o: order.index(o['key']) if o['key'] in order else 99)
    images = list(dict.fromkeys(out_name(u) for u in p['images']))
    return {'wood': wood_of(p['name']), 'sourceUrl': p['url'], 'priceFrom': min(pr) if pr else None,
            'priceTo': max(pr) if pr else None, 'comingSoon': 'Coming Soon' in p['price'],
            'options': options, 'combos': combos, 'images': images, 'dimensions': dims(p)}


families = {}
for p in RAW:
    fam = family_name(p['name'])
    families.setdefault(fam, []).append(p)

products = []
for fam, ps in families.items():
    ps.sort(key=lambda x: 0 if wood_of(x['name']) == 'ashwood' else 1)
    cat = next((c for c in PRIORITY if any(c in x['categories'] for x in ps)), 'decor')
    dept, room, label = CATS[cat]
    eds = [edition(x) for x in ps]
    desc = max((clean_desc(x['description']) for x in ps), key=len)
    spec = None
    m = re.match(r'^(\d+″ Height)\s*COLOURS.*', desc)
    if m:  # decor pieces only carry a size + colour line
        spec, desc = m.group(1), ''
    slug = re.sub(r'[^a-z0-9]+', '-', fam.lower().replace('″', 'in')).strip('-')
    products.append({
        'id': slug, 'name': fam, 'dept': dept, 'type': cat, 'typeLabel': label, 'room': room,
        'description': desc, 'spec': spec, 'editions': eds,
        'priceFrom': min((e['priceFrom'] for e in eds if e['priceFrom']), default=None),
        'comingSoon': all(e['comingSoon'] for e in eds),
    })

products.sort(key=lambda p: (['seating', 'tables', 'storage', 'bedroom', 'decor'].index(p['dept']), p['type'], p['name']))

# resize every referenced image to 1000px JPEG
needed = {}
for p in RAW:
    for u in p['images'] + [v['image'] for v in p['variations'] if v.get('image')]:
        needed[out_name(u)] = local(u)


def resize(item):
    name, src = item
    dst = os.path.join(OUT_IMG, name)
    if os.path.exists(dst) or not os.path.exists(src):
        return
    subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '72', '-Z', '1000', src, '--out', dst],
                   check=True, capture_output=True)


with ThreadPoolExecutor(8) as ex:
    list(ex.map(resize, needed.items()))

os.makedirs('src/data', exist_ok=True)
json.dump(products, open('src/data/catalogue.json', 'w'), ensure_ascii=False, indent=1)
print(len(products), 'products from', len(RAW), 'listings;', len(needed), 'images')
