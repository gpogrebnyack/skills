// Read-only: export slides (or top-level frames in a Design file) as PNG.
// ARGS: { from, to, scale, ids, names }
// Slides are taken in grid order; `ids` overrides the range. `names` maps id → file name prefix
// (frames in a Design file are all called "Frame", so the caller names them).
const grid = figma.currentPage.children.find((n) => n.type === 'SLIDE_GRID');
const all = grid
  ? grid.children.flatMap((row) => row.children.map((s) => ({ s, row: row.name })))
  : figma.currentPage.children.filter((n) => n.type === 'FRAME' || n.type === 'COMPONENT').map((s) => ({ s, row: null }));
const picked = ARGS.ids
  ? all.filter(({ s }) => ARGS.ids.includes(s.id))
  : all.slice(ARGS.from ?? 0, ARGS.to ?? all.length);
const scale = ARGS.scale ?? 0.5;

const files = [];
for (const { s, row } of picked) {
  const bytes = await s.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: scale } });
  const prefix = String((ARGS.names && ARGS.names[s.id]) || s.name).padStart(3, '0');
  files.push({ name: `${prefix}_${s.id.replace(':', '-')}.png`, base64: figma.base64Encode(bytes), id: s.id, row });
}
return { total: all.length, count: files.length, files };
