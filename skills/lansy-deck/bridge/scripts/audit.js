// Read-only: per-slide structural audit of a Lansy deck template.
// ARGS: { from, to } — range in grid order (service slide included).
// D1FF5E is the intentional bright site lime; B8B5B0 is the muted numeral grey.
const PALETTE = ['F5F5F4', 'F8F6F4', '201F1D', '75736F', '9CDE45', 'D1FF5E', '33694F', 'B8B5B0', 'FFFFFF', 'E9E6E0', '141414', '000000'];
const LOGO = '87E000'; // logo mark green: allowed on shapes, never on text
const BRAND_FONTS = ['Struve', 'Supermarker'];
const SEP = new RegExp('[\\u2028\\u2029]');
const DEFAULT_NAME = /^(Frame|Rectangle|Group|Vector|Ellipse|Line|image|Generated_image)( \d+)?$|^Frame \d+$/;

const hex = (c) => [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const grid = figma.currentPage.children.find((n) => n.type === 'SLIDE_GRID');
const all = grid.children.flatMap((row) => row.children.map((s) => ({ s, row: row.name })));
const out = [];

for (const { s, row } of all.slice(ARGS.from ?? 0, ARGS.to ?? all.length)) {
  const issues = {};
  const add = (k, v) => (issues[k] = issues[k] || []).push(v);
  const sb = s.absoluteBoundingBox;

  for (const t of s.findAllWithCriteria({ types: ['TEXT'] })) {
    if (!t.visible) continue;
    const fonts = [...new Set(t.getStyledTextSegments(['fontName']).map((g) => g.fontName.family + ' ' + g.fontName.style))];
    if (t.hasMissingFont) add('missingFont', `${t.name}: ${fonts.join('|')}`);
    const foreign = fonts.filter((f) => !BRAND_FONTS.some((b) => f.startsWith(b)));
    if (foreign.length) add('foreignFont', `${t.name}: ${foreign.join('|')}`);
    if (!t.characters.trim()) add('emptyText', t.name);
    if (SEP.test(t.characters)) add('lineSeparator', t.name);
    const b = t.absoluteRenderBounds || t.absoluteBoundingBox;
    const p = t.parent && t.parent.absoluteBoundingBox;
    if (b && sb && (b.x < sb.x - 1 || b.y < sb.y - 1 || b.x + b.width > sb.x + sb.width + 1 || b.y + b.height > sb.y + sb.height + 1)) add('textOffSlide', t.name);
    else if (b && p && t.parent.type !== 'SLIDE' && t.parent.clipsContent && (b.x + b.width > p.x + p.width + 1 || b.y + b.height > p.y + p.height + 1)) add('textClipped', t.name);
    // Text grew past a fixed-height auto-layout parent: it overlaps whatever comes next.
    else if (b && p && t.parent.layoutMode && t.parent.layoutMode !== 'NONE' && t.parent.layoutSizingVertical === 'FIXED' && b.y + b.height > p.y + p.height + 1) add('textOverflow', t.name);
  }

  const inInstance = (n) => { for (let p = n.parent; p && p.type !== 'SLIDE'; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
  for (const n of s.findAll(() => true)) {
    // Hidden layers inside instances are driven by component properties (Footer «Номер»).
    if (!n.visible && !inInstance(n)) add('hidden', `${n.type} ${n.name}`);
    if (n.type === 'INSTANCE') {
      const main = await n.getMainComponentAsync();
      if (main && main.remote) add('remoteInstance', main.name);
    }
    if ('layoutPositioning' in n && n.layoutPositioning === 'ABSOLUTE') add('absoluteInAL', n.name);
    if ('fills' in n && Array.isArray(n.fills)) {
      for (const f of n.fills) {
        if (f.type !== 'SOLID' || f.visible === false || PALETTE.includes(hex(f.color))) continue;
        if (hex(f.color) === LOGO && n.type !== 'TEXT') continue;
        add('offPalette', `${hex(f.color)} ${n.type} ${n.name}`);
      }
    }
  }

  const footer = s.findOne((n) => n.type === 'INSTANCE' && n.name === 'Footer');
  const named = s.findAll((n) => DEFAULT_NAME.test(n.name)).length;
  const compact = Object.fromEntries(Object.entries(issues).map(([k, v]) => [k, [...new Set(v)].slice(0, 6).concat(new Set(v).size > 6 ? [`…+${new Set(v).size - 6}`] : [])]));
  out.push({
    n: s.name, id: s.id, row,
    footer: footer ? (await footer.getMainComponentAsync()).name : null,
    defaultNames: named,
    issues: compact,
  });
}
return out;
