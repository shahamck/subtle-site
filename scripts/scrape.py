# Pulls the live subtleconcepts.in catalogue into raw/catalogue.json (names, prices, copy,
# dimensions, options, full-size image URLs). Run: python3 -I scripts/scrape.py
import html, json, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = 'https://subtleconcepts.in'
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh) subtle-redesign-scraper'}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read().decode('utf-8', 'replace')


def text(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def listing():
    """Returns {url: [category slugs]} across every page of /products/."""
    found = {}
    for page in range(1, 15):
        try:
            s = get(f'{BASE}/products/' + (f'page/{page}/' if page > 1 else ''))
        except Exception:
            break
        before = len(found)
        for cls, body in re.findall(r'<(?:div|section|li)[^>]*class="([^"]*\btype-product\b[^"]*)"(.*?)(?=<(?:div|section|li)[^>]*class="[^"]*\btype-product\b|$)', s, re.S):
            m = re.search(r'href="(https://subtleconcepts\.in/product/[^"/]+/)"', body)
            if m:
                found.setdefault(m.group(1), re.findall(r'product_cat-([\w-]+)', cls))
        if len(found) == before:
            break
    return found


def product(url):
    s = get(url)
    ld = None
    for block in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', s, re.S):
        try:
            data = json.loads(block)
        except Exception:
            continue
        for node in data.get('@graph', [data]) if isinstance(data, dict) else data:
            if isinstance(node, dict) and node.get('@type') in ('Product', 'ProductGroup'):
                ld = node
    name = text(re.search(r'<h1[^>]*product_title[^>]*>(.*?)</h1>', s, re.S).group(1))
    desc = ''
    m = re.search(r'id="tab-description"[^>]*>(.*?)(?:Assembly Information|Care Instructions|</div>\s*</div>)', s, re.S)
    if m:
        desc = text(m.group(1))
    attrs = {}
    m = re.search(r'<table class="woocommerce-product-attributes.*?</table>', s, re.S)
    if m:
        for k, v in re.findall(r'<th[^>]*>(.*?)</th>\s*<td[^>]*>(.*?)</td>', m.group(0), re.S):
            attrs[text(k)] = text(v)
    variations = []
    m = re.search(r'data-product_variations="([^"]*)"', s)
    if m:
        try:
            for v in json.loads(html.unescape(m.group(1))) or []:
                variations.append({'attributes': v['attributes'], 'price': v['display_price'],
                                   'image': v.get('image', {}).get('full_src'), 'dimensions': v.get('dimensions')})
        except Exception:
            pass
    images = []
    if ld:
        for im in ld.get('image', []) if isinstance(ld.get('image'), list) else [ld.get('image')]:
            u = im.get('url') if isinstance(im, dict) else im
            if u:
                images.append(u)
    images += re.findall(r'large_image&quot;:&quot;(https:\\/\\/[^&]+)&quot;', s)
    images = list(dict.fromkeys(i.replace('\\/', '/') for i in images))
    price = re.search(r'<p class="price">(.*?)</p>', s, re.S)
    cats = re.findall(r'rel="tag">([^<]+)</a>', s.split('posted_in', 1)[1][:2000]) if 'posted_in' in s else []
    return {'url': url, 'slug': url.rstrip('/').rsplit('/', 1)[1], 'name': name, 'price': text(price.group(1)) if price else '',
            'categories': [html.unescape(c) for c in cats], 'description': desc, 'attributes': attrs,
            'variations': variations, 'images': images}


if __name__ == '__main__':
    cats = listing()
    print(len(cats), 'products', file=sys.stderr)
    with ThreadPoolExecutor(8) as ex:
        out = list(ex.map(product, cats))
    for p in out:
        p['categories'] = cats[p['url']]
    json.dump(out, open('raw/catalogue.json', 'w'), indent=1, ensure_ascii=False)
    print('saved', len(out), file=sys.stderr)
