// Write, copy only: replace solid colors by a map, outside instances.
// ARGS: { fileKey, map: { "2A2A2A": "201F1D", ... } }
if (figma.fileKey !== ARGS.fileKey) throw new Error('Wrong file: ' + figma.fileKey);

const grid = figma.currentPage.children.find((n) => n.type === 'SLIDE_GRID');
const slides = grid.children.flatMap((r) => r.children).filter((s) => s.name !== '-');
const hex = (c) => [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const rgb = (h) => ({ r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 });
const inInstance = (n) => { for (let p = n.parent; p && p.type !== 'SLIDE'; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
const hit = (p) => p.type === 'SOLID' && ARGS.map[hex(p.color)];
// A paint bound to a variable must lose the binding, or a copy of the file re-resolves the old value.
const recolor = (p) => { const { boundVariables, ...rest } = p; return { ...rest, color: rgb(ARGS.map[hex(p.color)]) }; };

const counts = {}, bySlide = {};
for (const s of slides) for (const n of s.findAll(() => true)) {
  if (inInstance(n)) continue;
  for (const key of ['fills', 'strokes']) {
    if (!(key in n) || !Array.isArray(n[key]) || !n[key].some(hit)) continue;
    if (n.type === 'TEXT') await Promise.all(n.getStyledTextSegments(['fontName']).map((g) => figma.loadFontAsync(g.fontName)));
    n[key] = n[key].map((p) => {
      if (!hit(p)) return p;
      const from = hex(p.color);
      counts[from] = (counts[from] || 0) + 1;
      return recolor(p);
    });
    bySlide[s.name] = (bySlide[s.name] || 0) + 1;
  }
  // Mixed text colors live in ranges, not in the node-level fills array.
  if (n.type === 'TEXT' && n.fills === figma.mixed) {
    const segs = n.getStyledTextSegments(['fills']).filter((g) => g.fills.some(hit));
    if (!segs.length) continue;
    await Promise.all(n.getStyledTextSegments(['fontName']).map((g) => figma.loadFontAsync(g.fontName)));
    for (const g of segs) {
      g.fills.filter(hit).forEach((p) => { const f = hex(p.color); counts[f] = (counts[f] || 0) + 1; });
      n.setRangeFills(g.start, g.end, g.fills.map((p) => (hit(p) ? recolor(p) : p)));
    }
    bySlide[s.name] = (bySlide[s.name] || 0) + 1;
  }
}
return { counts, slides: Object.keys(bySlide) };
