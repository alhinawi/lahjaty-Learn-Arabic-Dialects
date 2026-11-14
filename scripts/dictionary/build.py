"""Builds src/content/dictionary/*.json from the compact authoring files in scripts/dictionary/data/*.txt.

Run: npm run dict:build   (then commit both the .txt and the generated .json files)

Line format inside a topic file:
  @topic <id> | <Arabic name> | <English name> | <icon>
  <slug> | <MSA> | <English> | <pos> | KEY=word; KEY=word ... | dialect: example || dialect: example
KEY is a dialect id or a group below; later keys override earlier ones.
"""
import json, os, re, sys, glob

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUT = os.path.join(ROOT, 'src/content/dictionary')
content = json.load(open(os.path.join(ROOT, 'src/content/phrases.json')))
DIALECTS = [d['id'] for d in content['dialects'] if d['id'] != 'fs']

EG = ['cai', 'alx', 'shq', 'dkh', 'mnf', 'ghr', 'bhr', 'dmt', 'kfs']
LEV = ['dam', 'alp', 'leb', 'psu', 'jor']
GLF = ['kuw', 'qat', 'bah', 'emi']
SA = ['naj', 'shm']
G = {
    'ALL': DIALECTS,
    'EG': EG, 'EGS': EG + ['sai'],
    'LEV': LEV, 'LEVP': LEV + ['psr'], 'SY': ['dam', 'alp'], 'PJ': ['psu', 'jor'], 'PJP': ['psu', 'jor', 'psr'],
    'IQ': ['bag', 'bas'], 'IQM': ['bag', 'bas', 'mos'],
    'GLF': GLF, 'SA': SA, 'KHL': GLF + SA,
    'YE': ['san', 'ade'],
    'MA': ['mar'], 'MAJ': ['mar', 'jeb'], 'MAG': ['mar', 'alg'], 'MAGT': ['mar', 'alg', 'tun'],
    'LY': ['tri', 'ben'], 'TLY': ['tun', 'tri', 'ben'], 'NAF': ['mar', 'alg', 'tun', 'tri', 'ben'],
}
POS = {'n', 'v', 'adj', 'adv', 'pron', 'q', 'int', 'num', 'phr', 'conj', 'prep'}

topics, errors = [], []
seen = set()
for path in sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', '*.txt'))):
    topic = None
    for n, raw in enumerate(open(path, encoding='utf8'), 1):
        line = raw.strip()
        if not line or line.startswith('#'):
            continue
        where = f'{os.path.basename(path)}:{n}'
        if line.startswith('@topic'):
            tid, name, name_en, icon = [x.strip() for x in line[6:].split('|')]
            topic = {'id': tid, 'name': name, 'nameEn': name_en, 'icon': icon, 'entries': []}
            topics.append(topic)
            continue
        parts = [x.strip() for x in line.split('|')]
        if len(parts) < 5:
            errors.append(f'{where}: expected at least 5 fields'); continue
        slug, fs, en, pos, cells = parts[:5]
        ex = parts[5] if len(parts) > 5 else ''
        cid = f"{topic['id']}.{slug}"
        if not re.fullmatch(r'[a-z0-9_]+', slug): errors.append(f'{where}: bad slug {slug}')
        if cid in seen: errors.append(f'{where}: duplicate {cid}')
        seen.add(cid)
        if pos not in POS: errors.append(f'{where}: bad pos {pos}')
        words = {}
        for cell in [c.strip() for c in cells.split(';') if c.strip()]:
            if '=' not in cell:
                errors.append(f'{where}: bad cell {cell}'); continue
            k, v = [x.strip() for x in cell.split('=', 1)]
            ids = G.get(k, [k])
            for d in ids:
                if d not in DIALECTS: errors.append(f'{where}: unknown key {k}')
                elif v == '-':
                    words.pop(d, None)
                else:
                    words[d] = v
        examples = {}
        for e in [x.strip() for x in ex.split('||') if x.strip()]:
            d, t = [x.strip() for x in e.split(':', 1)]
            if d not in words and d != 'fs': errors.append(f'{where}: example for {d} without a word')
            examples[d] = t
        entry = {'id': cid, 'fs': fs, 'en': en, 'pos': pos, 'words': {d: words[d] for d in DIALECTS if d in words}}
        if examples: entry['ex'] = examples
        topic['entries'].append(entry)

if errors:
    print('\n'.join(errors)); sys.exit(1)
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(os.path.join(OUT, '*.json')):
    os.remove(f)
index = {'version': 1, 'topics': [{k: t[k] for k in ('id', 'name', 'nameEn', 'icon')} for t in topics]}
json.dump(index, open(os.path.join(OUT, 'index.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
for t in topics:
    json.dump({'id': t['id'], 'entries': t['entries']}, open(os.path.join(OUT, f"{t['id']}.json"), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
cells = sum(len(e['words']) for t in topics for e in t['entries'])
print(f"{len(topics)} topics, {sum(len(t['entries']) for t in topics)} concepts, {cells} dialect words")
for d in DIALECTS:
    c = sum(1 for t in topics for e in t['entries'] if d in e['words'])
    print(d, c, end='  ')
print()
