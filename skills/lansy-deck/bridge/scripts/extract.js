// Read-only: raw catalog data for slides with slot names (docs/slots.md).
// ARGS: { from, to }. The CLI turns this into catalog.json.
const grid = figma.currentPage.children.find((n) => n.type === 'SLIDE_GRID');
const all = grid.children.flatMap((row) => row.children.map((s) => ({ s, row: row.name })));
const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const solid = (n) => ('fills' in n && Array.isArray(n.fills) ? n.fills.find((f) => f.type === 'SOLID' && f.visible !== false) : null);
const image = (n) => ('fills' in n && Array.isArray(n.fills) ? n.fills.some((f) => f.type === 'IMAGE' && f.visible !== false) : false);

function textInfo(t, origin) {
  const seg = t.getStyledTextSegments(['fontName', 'fontSize', 'lineHeight', 'fills']);
  const main = seg.reduce((a, b) => (b.characters.length > a.characters.length ? b : a));
  const lh = main.lineHeight.unit === 'PIXELS' ? main.lineHeight.value
    : main.lineHeight.unit === 'PERCENT' ? main.fontSize * main.lineHeight.value / 100 : null;
  const color = main.fills.find((f) => f.type === 'SOLID');
  const b = t.absoluteBoundingBox;
  // Which #items group and which #item (by order) this slot belongs to.
  let group = null, item = null;
  for (let p = t.parent, child = t; p && p.type !== 'SLIDE'; child = p, p = p.parent) {
    if (child.name === '#item' && item === null) item = p.children.filter((k) => k.name === '#item').indexOf(child);
    if (/^#items/.test(p.name)) { group = p.name; break; }
  }
  return {
    id: t.id, slot: t.name, group, item,
    font: main.fontName.family + ' ' + main.fontName.style, size: main.fontSize, lineHeight: lh,
    color: color ? hex(color.color) : null,
    accentFonts: [...new Set(seg.filter((g) => g !== main).map((g) => g.fontName.family + ' ' + g.fontName.style))],
    w: Math.round(t.width), h: Math.round(t.height), x: Math.round(b.x - origin.x), y: Math.round(b.y - origin.y),
    renderW: t.absoluteRenderBounds ? Math.round(t.absoluteRenderBounds.width) : null,
    autoResize: t.textAutoResize, align: t.textAlignHorizontal,
    sample: t.characters,
  };
}

const out = [];
for (const { s, row } of all.slice(ARGS.from ?? 0, ARGS.to ?? all.length)) {
  if (s.name === '-') continue;
  const origin = s.absoluteBoundingBox;
  const slots = s.findAllWithCriteria({ types: ['TEXT'] }).filter((t) => t.name.startsWith('#') && t.visible).map((t) => textInfo(t, origin));
  const groups = s.findAll((n) => /^#items/.test(n.name)).map((g) => ({
    id: g.id, slot: g.name, layout: g.layoutMode || 'NONE',
    items: g.children.filter((k) => k.name === '#item').map((k) => ({ id: k.id, fill: solid(k) ? hex(solid(k).color) : null })),
  }));
  const footer = s.findOne((n) => n.type === 'INSTANCE' && n.name === 'Footer');
  const fp = footer ? Object.fromEntries(Object.entries(footer.componentProperties).map(([k, v]) => [k.split('#')[0], v.value])) : null;
  const top = s.children.map((c) => ({
    name: c.name, type: c.type,
    full: Math.round(c.width) >= 1900 && Math.round(c.height) >= 1060,
    fill: solid(c) ? hex(solid(c).color) : null, image: image(c),
  }));
  out.push({
    n: s.name, id: s.id, row: row.replace(/^Тип · /, ''), skipped: s.isSkippedSlide,
    fill: solid(s) ? hex(solid(s).color) : null,
    layers: top, footer: fp, slots, groups,
  });
}
return out;
