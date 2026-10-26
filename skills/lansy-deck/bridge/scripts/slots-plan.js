// Read-only: propose slot names (docs/slots.md) for each slide from its structure.
// ARGS: { from, to } or { ids }. Returns compact lines for review.
const grid = figma.currentPage.children.find((n) => n.type === 'SLIDE_GRID');
const all = grid.children.flatMap((row) => row.children.map((s) => ({ s, row: row.name })))
  .filter(({ s }) => s.name !== '-');
const picked = ARGS.ids ? all.filter(({ s }) => ARGS.ids.includes(s.id)) : all.slice(ARGS.from ?? 0, ARGS.to ?? all.length);

const insideInstance = (n) => { for (let p = n.parent; p && p.type !== 'SLIDE'; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
const texts = (root) => root.findAllWithCriteria({ types: ['TEXT'] }).filter((t) => t.visible && !insideInstance(t));
const size = (t) => (typeof t.fontSize === 'number' ? t.fontSize : Math.max(...t.getStyledTextSegments(['fontSize']).map((g) => g.fontSize)));
const style = (t) => (t.fontName === figma.mixed ? t.getStyledTextSegments(['fontName'])[0].fontName.style : t.fontName.style);
const isNum = (s) => /^[\s+\-–~≈x×$€£₽%.,/\d]+$/i.test(s.replace(/up to|as little as|day|pcs/gi, '').trim()) && /\d/.test(s);
const isOrdinal = (s) => /^\s*0?\d{1,2}\s*$/.test(s);
// Structural signature: highlighted cards differ in color or weight, not in shape.
const sig = (n) => texts(n).map((t) => {
  const ch = t.characters.trim();
  return isOrdinal(ch) ? 'o' : isNum(ch) ? 'n' : 't';
}).join('');
const allShort = (n) => texts(n).every((t) => t.characters.trim().length <= 24);

// Item groups: containers whose >=2 children share the same text signature.
function findGroups(slide) {
  const groups = [];
  const used = new Set();
  const frames = slide.findAll((n) => 'children' in n && n.type !== 'INSTANCE' && !insideInstance(n) && n.children.length >= 2);
  const cands = frames.map((f) => {
    const kids = f.children.filter((k) => k.visible && 'children' in k && texts(k).length > 0);
    if (kids.length < 2) return null;
    const sigs = kids.map(sig);
    const best = Object.entries(sigs.reduce((m, s) => ((m[s] = (m[s] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1])[0];
    if (best[1] < 2 || best[1] < kids.length - 1) return null;
    // An odd child (table header, hero card) stays outside the group.
    // An odd child joins when it is the same kind of thing with one text more or less (first step without a description).
    const near = (s) => s === best[0] || (Math.abs(s.length - best[0].length) === 1 && (best[0].startsWith(s) || best[0].endsWith(s) || s.startsWith(best[0]) || s.endsWith(best[0])));
    let items = kids.filter((k, i) => near(sigs[i]));
    // A first row of only short texts above longer rows is a table header.
    if (items.length >= 3 && allShort(items[0]) && !items.slice(1).every(allShort)) items = items.slice(1);
    if (items.length < 2) return null;
    return { f, kids: items, covered: items.reduce((c, k) => c + texts(k).length, 0) };
  }).filter(Boolean).sort((a, b) => b.covered - a.covered);
  for (const c of cands) {
    if ([c.f, ...c.kids].some((n) => used.has(n.id))) continue;
    if (groups.some((g) => g.f.findOne((n) => n.id === c.f.id) || c.f.findOne((n) => n.id === g.f.id))) continue;
    groups.push(c);
    c.f.findAll(() => true).forEach((n) => used.add(n.id));
    used.add(c.f.id);
  }
  return groups;
}

function itemRole(t, item) {
  const s = size(t), st = style(t), ch = t.characters.trim();
  if (isOrdinal(ch)) return 'num';
  if (isNum(ch) && s >= 40) return 'value';
  const ts = texts(item).filter((x) => !isOrdinal(x.characters.trim()));
  const isValue = (x) => x && isNum(x.characters.trim()) && size(x) >= 40;
  const i = ts.indexOf(t);
  const next = ts[i + 1];
  if (isValue(next) && ch.length <= 30) return 'label';
  if (ts.some(isValue)) return 'text';
  if (i === 0 && next) {
    if (size(next) >= s * 1.3 && ch.length <= 24) return 'label';
    if (/Semibold|Medium|Bold/.test(st) && !/Semibold|Medium|Bold/.test(style(next))) return 'title';
    if (size(next) < s || ch.length <= 40 && next.characters.trim().length > ch.length * 1.5) return 'title';
  }
  return 'text';
}

const out = [];
for (const { s, row } of picked) {
  const plan = [];
  const groups = findGroups(s);
  const inGroup = new Map();
  groups.forEach((g, gi) => {
    const gname = gi === 0 ? '#items' : `#items-${gi + 1}`;
    plan.push({ id: g.f.id, slot: gname, from: g.f.name, n: g.kids.length });
    g.kids.forEach((k) => {
      plan.push({ id: k.id, slot: '#item', from: k.name, g: gname });
      const counts = {};
      texts(k).forEach((t) => {
        let r = itemRole(t, k);
        counts[r] = (counts[r] || 0) + 1;
        if (counts[r] > 1) r += '-' + counts[r];
        inGroup.set(t.id, true);
        plan.push({ id: t.id, slot: '#item/' + r, from: t.name, f: size(t) + style(t)[0], c: t.characters.slice(0, 28), g: gname });
      });
    });
  });
  const loose = texts(s).filter((t) => !inGroup.has(t.id));
  const maxSize = Math.max(0, ...loose.filter((t) => !isNum(t.characters.trim())).map(size));
  // Short sibling texts in one horizontal row are column headers.
  const short = loose.filter((t) => t.characters.trim().length <= 24 && size(t) <= 32 && !isNum(t.characters.trim()));
  const heads = new Set();
  for (const t of short) {
    for (let p = t.parent, up = 0; p && p.type !== 'SLIDE' && up < 3; p = p.parent, up++) {
      if (p.layoutMode !== 'HORIZONTAL') continue;
      const row = short.filter((x) => p.findOne((n) => n.id === x.id));
      if (row.length >= 2) { row.forEach((x) => heads.add(x.id)); break; }
    }
  }
  const counts = {};
  loose.forEach((t, i) => {
    const sz = size(t), ch = t.characters.trim();
    const next = loose[i + 1];
    let r;
    if (!counts.title && !isNum(ch) && sz >= 40 && (sz === maxSize || t.name === 'H1')) r = 'title';
    else if (isOrdinal(ch)) r = 'num';
    else if (heads.has(t.id)) r = 'head';
    else if (isNum(ch) && sz >= 64) r = 'value';
    else if (next && isNum(next.characters.trim()) && size(next) >= 64 && ch.length <= 30) r = 'label';
    else if (sz <= 20) r = 'note';
    else if (!counts.lead && counts.title && sz <= 40 && ch.length > 30) r = 'lead';
    else r = 'text';
    counts[r] = (counts[r] || 0) + 1;
    const slot = '#' + r + (counts[r] > 1 ? '-' + counts[r] : '');
    plan.push({ id: t.id, slot, from: t.name, f: sz + style(t)[0], c: t.characters.slice(0, 28) });
  });
  out.push({ n: s.name, id: s.id, row, plan });
}
return out;
