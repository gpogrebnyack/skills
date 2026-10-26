// Write: pin every text whose stored layout differs from a fresh one. Run in the library file.
// ARGS: { fileKey, dryRun?: boolean, only?: [componentName] }
// Figma draws texts as laid out long ago until something re-lays them (import into a new file,
// any edit). For each auto-height text a copy is laid out far off the canvas at the same width;
// if it draws differently, the narrowest width that reproduces the stored wrap is pinned, and
// where only the box height moved, a pixel line height or a min/max height is pinned.
// No filters on line count or width ratio: one-liners and near-full-width titles go stale too.
// Texts nothing reproduces are reported, not touched.
if (figma.fileKey !== ARGS.fileKey) throw new Error('Wrong file: ' + figma.fileKey);
const TOL = 3;

const roots = figma.currentPage.children.filter((n) => n.type === 'COMPONENT' && (!ARGS.only || ARGS.only.includes(n.name)));
const texts = [];
const fonts = new Map();
for (const root of roots) {
  const seen = {};
  for (const t of root.findAllWithCriteria({ types: ['TEXT'] })) {
    seen[t.name] = (seen[t.name] || 0) + 1;
    let inInstance = false;
    for (let q = t.parent; q && q !== root; q = q.parent) if (q.type === 'INSTANCE') { inInstance = true; break; }
    if (inInstance || t.textAutoResize !== 'HEIGHT' || !t.absoluteRenderBounds) continue;
    // Stored drawing first, before any probe can disturb the page.
    const b = t.absoluteRenderBounds;
    texts.push({ t, root, index: seen[t.name] - 1, stored: { w: t.width, h: t.height, dw: b.width, dh: b.height, oy: b.y - t.absoluteTransform[1][2] } });
    for (const s of t.getStyledTextSegments(['fontName'])) fonts.set(JSON.stringify(s.fontName), s.fontName);
  }
}
await Promise.all([...fonts.values()].map((f) => figma.loadFontAsync(f)));

function lineHeightPx(node) {
  const lh = node.lineHeight;
  if (lh === figma.mixed || typeof node.fontSize !== 'number') return null;
  if (lh.unit === 'PIXELS') return lh.value;
  if (lh.unit === 'PERCENT') return node.fontSize * lh.value / 100;
  return node.fontSize * 1.2; // AUTO: close enough to count lines
}

// Lays a copy out at `width` (and line height `lh`, px) and reports what it draws.
function measure(node, width, lh) {
  const probe = node.clone();
  figma.currentPage.appendChild(probe);
  probe.x = -100000; probe.y = -100000;
  probe.textAutoResize = 'HEIGHT';
  probe.resize(width, probe.height);
  if (lh) probe.lineHeight = { unit: 'PIXELS', value: lh };
  probe.characters = node.characters + ' ';
  probe.characters = node.characters;
  const b = probe.absoluteRenderBounds;
  const r = { h: probe.height, dw: b ? b.width : 0, dh: b ? b.height : 0, oy: b ? b.y - probe.absoluteTransform[1][2] : 0 };
  probe.remove();
  return r;
}
const drawsSame = (m, s) => Math.abs(m.dw - s.dw) <= TOL && Math.abs(m.dh - s.dh) <= TOL;
const fits = (m, s) => drawsSame(m, s) && Math.abs(m.h - s.h) <= 1 && Math.abs(m.oy - s.oy) <= 2;

// Line height that turns the fresh box height at `width` into the stored one.
function lineHeightFor(node, width, stored) {
  const lh = lineHeightPx(node);
  if (!lh) return null;
  const lines = Math.max(1, Math.round(measure(node, width).h / lh));
  return Math.round(stored.h / lines * 100) / 100;
}

const changed = [], unresolved = [];
for (const { t, root, index, stored } of texts) {
  const fresh = measure(t, stored.w);
  if (fits(fresh, stored)) continue;
  // Width only when the wrap changed; a FILL text that wraps the same keeps its sizing.
  const widths = [stored.w];
  if (!drawsSame(fresh, stored)) for (let w = Math.ceil(stored.dw); w <= Math.ceil(Math.max(stored.dw * 1.3, stored.w)); w += 2) widths.push(w);
  let fix = null;
  // Box height off but glyphs in place: clamp the box (top-aligned text in auto-layout only).
  const clampable = t.textAlignVertical === 'TOP' && t.parent.layoutMode && t.parent.layoutMode !== 'NONE';
  for (const w of widths) {
    const m = measure(t, w);
    if (fits(m, stored)) { fix = { width: w }; break; }
    if (Math.abs(m.dw - stored.dw) > TOL) continue;
    const lh = lineHeightFor(t, w, stored);
    if (lh && fits(measure(t, w, lh), stored)) { fix = { width: w, lineHeight: lh }; break; }
    // A max height below the last glyph makes Figma drop that line.
    if (clampable && drawsSame(m, stored) && Math.abs(m.oy - stored.oy) <= 2 && (stored.h > m.h || m.oy + m.dh <= stored.h)) {
      fix = { width: w, [stored.h > m.h ? 'minHeight' : 'maxHeight']: Math.round(stored.h) };
      break;
    }
  }
  const rec = { slide: root.name, slot: t.name, index, chars: t.characters.slice(0, 24), sizing: t.layoutSizingHorizontal,
    stored: [Math.round(stored.w), Math.round(stored.h), Math.round(stored.dw), Math.round(stored.dh), Math.round(stored.oy)],
    fresh: [Math.round(fresh.h), Math.round(fresh.dw), Math.round(fresh.dh), Math.round(fresh.oy)] };
  if (!fix) { unresolved.push(rec); continue; }
  Object.assign(rec, fix);
  if (fix.width === stored.w) delete rec.width;
  if (!ARGS.dryRun) {
    if (rec.width) {
      if (t.layoutSizingHorizontal && t.layoutSizingHorizontal !== 'FIXED') t.layoutSizingHorizontal = 'FIXED';
      t.resize(rec.width, t.height);
    }
    if (fix.lineHeight) t.lineHeight = { unit: 'PIXELS', value: fix.lineHeight };
    t.textAutoResize = 'HEIGHT';
    if (fix.minHeight) t.minHeight = fix.minHeight;
    if (fix.maxHeight) t.maxHeight = fix.maxHeight;
  }
  changed.push(rec);
}
return { texts: texts.length, changed: changed.length, unresolved: unresolved.length, slides: [...new Set(changed.concat(unresolved).map((r) => r.slide))], changedList: changed, unresolvedList: unresolved };
