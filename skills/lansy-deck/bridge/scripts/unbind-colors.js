// Write: replace colors bound to variables with plain palette colors.
// ARGS: { fileKey, map: { "58575A": "201F1D", ... }, dryRun?: boolean }
// The legacy slides bind fills to a remote theme collection («Custom Style»). A pasted copy
// re-resolves those variables, so a recolor that only changed the paint color gets undone.
// Plain colors keep the slides independent of that theme.
if (figma.fileKey !== ARGS.fileKey) throw new Error('Wrong file: ' + figma.fileKey);

const hex = (c) => [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const rgb = (h) => ({ r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 });
const isBound = (p) => p.type === 'SOLID' && p.boundVariables && p.boundVariables.color;

// 1. Find the layers that carry bound colors; no fonts are touched yet.
const roots = figma.editorType === 'slides'
  ? figma.currentPage.children.find((n) => n.type === 'SLIDE_GRID').children.flatMap((r) => r.children)
  : figma.currentPage.children;
const targets = [];
for (const root of roots) {
  for (const n of [root, ...root.findAll(() => true)]) {
    let inInstance = false;
    for (let q = n.parent; q && q !== root; q = q.parent) if (q.type === 'INSTANCE') { inInstance = true; break; }
    if (inInstance) continue;
    const keys = ['fills', 'strokes'].filter((k) => k in n && (
      (Array.isArray(n[k]) && n[k].some(isBound)) ||
      (k === 'fills' && n.type === 'TEXT' && n.fills === figma.mixed && n.getStyledTextSegments(['fills']).some((s) => s.fills.some(isBound)))));
    if (keys.length) targets.push({ n, keys });
  }
}

// 2. Resolve every variable once.
const values = new Map();
for (const { n, keys } of targets) for (const k of keys) {
  const paints = Array.isArray(n[k]) ? n[k] : n.getStyledTextSegments(['fills']).flatMap((s) => s.fills);
  for (const p of paints.filter(isBound)) {
    const id = p.boundVariables.color.id;
    if (values.has(id)) continue;
    const v = await figma.variables.getVariableByIdAsync(id);
    const coll = v && await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId);
    const val = v && coll ? v.valuesByMode[coll.defaultModeId] : null;
    values.set(id, val && val.r !== undefined ? hex(val) : hex(p.color));
  }
}
const plain = (paints) => paints.map((p) => {
  if (!isBound(p)) return p;
  const { boundVariables, ...rest } = p;
  const value = values.get(p.boundVariables.color.id);
  return { ...rest, color: rgb(ARGS.map[value] || value) };
});

if (ARGS.dryRun) return { layers: targets.length, variables: Object.fromEntries(values), sample: targets.slice(0, 12).map(({ n, keys }) => `${n.type} ${n.name}: ${keys.join('+')}`) };

// 3. Load each font once, then rewrite.
const fonts = new Map();
for (const { n } of targets) if (n.type === 'TEXT') for (const s of n.getStyledTextSegments(['fontName'])) fonts.set(JSON.stringify(s.fontName), s.fontName);
await Promise.all([...fonts.values()].map((f) => figma.loadFontAsync(f)));

let changed = 0;
for (const { n, keys } of targets) for (const k of keys) {
  if (Array.isArray(n[k])) n[k] = plain(n[k]);
  else for (const s of n.getStyledTextSegments(['fills'])) if (s.fills.some(isBound)) n.setRangeFills(s.start, s.end, plain(s.fills));
  changed++;
}
return { layers: targets.length, changed, variables: Object.fromEntries(values) };
