// Write (temporary probes only): check a built deck against its storyboard.
// ARGS: { fileKey, slides: [{ slideId, texts }], base?: { lines: { nodeId: n }, over: { frameId: px } }, baseOnly?: boolean }
// baseOnly: return that base for the slides — taken right after import, it is what the template
// itself takes: line counts (the yardstick for "the text grew") and content already past its frame
// (some layouts overflow by design, only growth beyond it is an error).
// Otherwise per slide: errors (text off the slide, clipped, auto-layout content taller than its
// frame) and warnings (widow, hand break plus wrap, more lines than the template, sibling columns
// with different line counts, text not as in the storyboard). Every text warning carries the lines
// as Figma breaks them. Lines are counted on a copy laid out off the slide, so pinned heights don't hide them.
if (figma.fileKey !== ARGS.fileKey) throw new Error(`Wrong file: ${figma.fileKey}, expected ${ARGS.fileKey}`);
const SOFT_BREAK = String.fromCharCode(0x2028);
const BREAK = new RegExp('[\\n\\u2028\\u2029]');
const TRAILING = new RegExp('[\\s\\u2028\\u2029]+$');

const inInstance = (n, root) => { for (let p = n.parent; p && p !== root; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
const slotTexts = (slide) => slide.findAll((n) => n.type === 'TEXT' && n.name.startsWith('#') && n.visible && !inInstance(n, slide));

async function loadFonts(nodes) {
  const fonts = new Map();
  for (const t of nodes) for (const s of t.getStyledTextSegments(['fontName'])) fonts.set(JSON.stringify(s.fontName), s.fontName);
  await Promise.all([...fonts.values()].map((f) => figma.loadFontAsync(f)));
}

// One off-slide copy per text, reused for every measurement and removed at the end:
// cloning is the slow part, re-typing a copy is cheap.
const probes = new Map();
function probeOf(node) {
  let p = probes.get(node.id);
  if (!p) {
    const copy = node.clone();
    slideOf(node).appendChild(copy);   // outside any auto-layout: nothing else gets re-laid
    copy.x = -100000; copy.y = -100000;
    try { copy.minHeight = null; copy.maxHeight = null; } catch (e) { /* not an auto-layout child any more */ }
    copy.textAutoResize = 'HEIGHT';
    copy.resize(node.width, copy.height);
    copy.characters = node.characters.slice(0, 1) || 'H';
    p = { copy, one: copy.height };
    probes.set(node.id, p);
  }
  return p;
}
const dropProbes = () => { for (const { copy } of probes.values()) copy.remove(); probes.clear(); };

// Visible lines of `text` (default: the node's own) at the node's width; null for texts that grow
// sideways. Trailing breaks are dropped: some template texts end in an empty line.
function linesOf(node, text) {
  if (node.textAutoResize !== 'HEIGHT') return null;
  text = (text ?? node.characters).replace(TRAILING, '');
  const { copy, one } = probeOf(node);
  copy.characters = text + ' ';
  copy.characters = text;
  return Math.max(1, Math.round(copy.height / one));
}
function slideOf(n) { while (n && n.type !== 'SLIDE') n = n.parent; return n; }

// The node's text as Figma breaks it: fill each line word by word until the next word wraps.
function renderedLines(node) {
  const out = [];
  for (const para of node.characters.replace(TRAILING, '').split(BREAK)) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? line + ' ' + word : word;
      if (line && linesOf(node, next) > 1) { out.push(line); line = word; } else line = next;
    }
    out.push(line);
  }
  return out;
}
const showLines = (node) => '\n      строки: ' + renderedLines(node).map((l) => `«${l}» ${l.length}`).join(' · ');

// How far the children of a fixed or filled auto-layout frame run past it, px; 0 when they fit.
function overflowOf(f) {
  const vertical = f.layoutMode === 'VERTICAL';
  if ((vertical ? f.layoutSizingVertical : f.layoutSizingHorizontal) === 'HUG' || f.layoutWrap === 'WRAP') return 0;
  const kids = f.children.filter((k) => k.visible && k.layoutPositioning !== 'ABSOLUTE');
  if (!kids.length) return 0;
  const gap = f.primaryAxisAlignItems === 'SPACE_BETWEEN' ? 0 : f.itemSpacing;
  const content = kids.reduce((a, k) => a + (vertical ? k.height : k.width), 0) + gap * (kids.length - 1)
    + (vertical ? f.paddingTop + f.paddingBottom : f.paddingLeft + f.paddingRight);
  return Math.max(0, Math.round(content - (vertical ? f.height : f.width)));
}
const layoutFrames = (slide) => slide.findAll((n) => n.type === 'FRAME' && n.layoutMode && n.layoutMode !== 'NONE' && !inInstance(n, slide));

// Expected text and storyboard label for each filled node of a slide.
function targets(slide, texts) {
  const out = [];
  const find = (root, name) => root.findOne((n) => n.type === 'TEXT' && n.name === name);
  for (const [key, value] of Object.entries(texts || {})) {
    if (Array.isArray(value)) {
      const group = slide.findOne((n) => n.name === key);
      const items = group ? group.children.filter((k) => k.name === '#item') : [];
      value.forEach((item, i) => {
        for (const [slot, text] of Object.entries(item)) {
          const node = items[i] && find(items[i], slot);
          if (node) out.push({ label: `${key}[${i + 1}] ${slot}`, node, value: String(text) });
        }
      });
    } else {
      const node = find(slide, key);
      if (node) out.push({ label: key, node, value: String(value) });
    }
  }
  return out;
}

// All awaits happen here, before the first measurement: an await between measurements makes
// Figma re-lay every probe touched so far, which turns half a second into minutes.
const slideNodes = await Promise.all(ARGS.slides.map(({ slideId }) => figma.getNodeByIdAsync(slideId)));
await loadFonts(slideNodes.filter(Boolean).flatMap((s) => s.findAll((n) => n.type === 'TEXT' && !inInstance(n, s))));

try {
if (ARGS.baseOnly) {
  const base = { lines: {}, over: {} };
  for (const slide of slideNodes) {
    const nodes = slotTexts(slide);
    for (const t of nodes) { const l = linesOf(t); if (l) base.lines[t.id] = l; }
    for (const f of layoutFrames(slide)) { const o = overflowOf(f); if (o) base.over[f.id] = o; }
  }
  return base;
}
const base = ARGS.base || { lines: {}, over: {} };

const out = [];
for (const [i, job] of ARGS.slides.entries()) {
  const slide = slideNodes[i];
  const rep = { n: i + 1, slideId: job.slideId, errors: [], warnings: [] };
  out.push(rep);
  if (!slide) { rep.errors.push('слайда нет в файле'); continue; }
  const sb = slide.absoluteBoundingBox;

  // Geometry: every visible text, filled or not.
  for (const t of slide.findAllWithCriteria({ types: ['TEXT'] })) {
    if (!t.visible) continue;
    const b = t.absoluteRenderBounds;
    if (!b) continue;
    const p = t.parent.absoluteBoundingBox;
    if (b.x < sb.x - 1 || b.y < sb.y - 1 || b.x + b.width > sb.x + sb.width + 1 || b.y + b.height > sb.y + sb.height + 1) rep.errors.push(`${t.name}: текст за краем слайда`);
    else if (t.parent.type !== 'SLIDE' && t.parent.clipsContent && (b.x + b.width > p.x + p.width + 1 || b.y + b.height > p.y + p.height + 1)) rep.errors.push(`${t.name}: текст обрезан рамкой ${t.parent.name}`);
  }
  // Content of an auto-layout frame running further past it than in the template: something overlaps.
  for (const f of layoutFrames(slide)) {
    const over = overflowOf(f) - (base.over[f.id] || 0);
    if (over > 1) rep.errors.push(`${f.name}: содержимое ${f.layoutMode === 'VERTICAL' ? 'выше' : 'шире'} рамки на ${over} px — сократи текст`);
  }

  // Texts against the storyboard.
  const list = targets(slide, job.texts);
  for (const { label, node, value } of list) {
    const before = rep.warnings.length;
    const expected = value.split('\n').join(SOFT_BREAK).replace(/\*([^*]+)\*/g, '$1');
    const actual = node.characters;
    if (actual !== expected && actual !== value) rep.warnings.push(`${label}: текст в файле отличается от сториборда`);
    const lines = linesOf(node);
    if (!lines) continue;
    const parts = actual.split(BREAK);
    if (parts.length > 1 && lines > parts.length) rep.warnings.push(`${label}: ${lines} строк при ${parts.length} частях через \\n — ручной перенос плюс автоматический, убери \\n или сократи`);
    const was = base.lines[node.id];
    if (was && lines > was) rep.warnings.push(`${label}: ${lines} строк, в шаблоне ${was} — блок вырос, проверь соседей`);
    if (lines < 2) continue;
    // A widow: dropping the paragraph's last word removes a whole line.
    let start = 0;
    for (const part of parts) {
      const words = part.trim().split(/\s+/);
      if (words.length >= 2) {
        const cut = part.replace(/\s*\S+\s*$/, '');
        const shorter = actual.slice(0, start) + cut + actual.slice(start + part.length);
        if (linesOf(node, shorter) < lines) rep.warnings.push(`${label}: висячее слово «${words.at(-1)}» — перепиши строку`);
      }
      start += part.length + 1;
    }
    // Show how the lines fall for any text warning except a plain mismatch.
    const textWarnings = rep.warnings.slice(before).filter((w) => !w.endsWith('отличается от сториборда'));
    if (textWarnings.length) rep.warnings[rep.warnings.length - 1] += showLines(node);
  }

  // Bottom- or centre-aligned columns jump when one of them has a different number of lines.
  for (const group of slide.findAll((n) => n.name === '#items' && n.layoutMode === 'HORIZONTAL' && !inInstance(n, slide))) {
    const items = group.children.filter((k) => k.name === '#item' && k.layoutMode === 'VERTICAL');
    if (items.length < 2 || items.every((k) => k.primaryAxisAlignItems === 'MIN')) continue;
    const bySlot = new Map();
    for (const item of items) {
      for (const t of item.findAll((n) => n.type === 'TEXT' && n.name.startsWith('#item/'))) {
        bySlot.set(t.name, [...(bySlot.get(t.name) || []), linesOf(t)]);
      }
    }
    for (const [slot, counts] of bySlot) {
      // Unevenness the template itself has (its own texts were measured at import) is by design.
      const nodes = items.map((item) => item.findOne((n) => n.type === 'TEXT' && n.name === slot));
      const was = nodes.map((n) => n && base.lines[n.id]);
      if (was.every(Boolean) && was.join('/') === counts.join('/')) continue;
      if (counts.length === items.length && new Set(counts).size > 1) rep.warnings.push(`#items ${slot}: строк в колонках ${counts.join(' / ')} — колонки выровнены по низу и прыгают, выровняй длину текстов`);
    }
  }
}
return out;
} finally {
  dropProbes();
}
