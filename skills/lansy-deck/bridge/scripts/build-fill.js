// Write: fill imported slides from the storyboard.
// ARGS: { fileKey, slides: [{ slideId, texts: { "#slot": "…", "#items": [{ "#item/slot": "…" }] }, footer: { "Topic": "…" } }] }
// Line breaks "\n" become soft breaks (U+2028), as in the template.
// "*words*" marks the Supermarker accent on slides that have one; elsewhere the asterisks stay as text.
// Items are never added or removed: deck check guarantees the count matches the template.
if (figma.fileKey !== ARGS.fileKey) throw new Error(`Wrong file: ${figma.fileKey}, expected ${ARGS.fileKey}`);

const SOFT_BREAK = String.fromCharCode(0x2028);

async function setText(node, value, log) {
  const segs = node.getStyledTextSegments(['fontName']);
  await Promise.all(segs.map((s) => figma.loadFontAsync(s.fontName)));
  const accent = segs.find((s) => s.fontName.family === 'Supermarker');
  const base = segs.find((s) => s.fontName.family !== 'Supermarker');
  let text = String(value).split('\n').join(SOFT_BREAK);
  const ranges = [];
  if (accent) {
    // Strip the markers and remember where each accented run lands.
    text = text.replace(/\*([^*]+)\*/g, (m, inner, offset) => {
      const removedBefore = ranges.length * 2;
      ranges.push([offset - removedBefore, offset - removedBefore + inner.length]);
      return inner;
    });
  }
  node.characters = text;
  if (accent && base) {
    node.setRangeFontName(0, text.length, base.fontName);
    for (const [a, b] of ranges) node.setRangeFontName(a, b, accent.fontName);
    log.accents = (log.accents || 0) + ranges.length;
  }
  log.set++;
}

// The library footer has English properties; slides cloned from the old Slides template carry Russian ones.
const LEGACY = { Topic: 'Тема', Background: 'Фон' };
const LEGACY_BG = { Light: 'Светлый', Dark: 'Тёмный' };
function footerProps(footer, wanted) {
  const have = footer.componentProperties;
  const out = {};
  for (const [key, value] of Object.entries(wanted)) {
    if (key in have) out[key] = value;
    else if (LEGACY[key] in have) out[LEGACY[key]] = key === 'Background' ? LEGACY_BG[value] || value : value;
  }
  return out;
}

const out = [];
for (const job of ARGS.slides) {
  const slide = await figma.getNodeByIdAsync(job.slideId);
  const log = { slideId: job.slideId, set: 0, missing: [] };
  if (!slide) { log.missing.push('slide'); out.push(log); continue; }

  for (const [key, value] of Object.entries(job.texts || {})) {
    if (Array.isArray(value)) {
      const group = slide.findOne((n) => n.name === key);
      if (!group) { log.missing.push(key); continue; }
      const items = group.children.filter((k) => k.name === '#item');
      if (items.length !== value.length) log.missing.push(`${key}: ${value.length} given, ${items.length} in slide`);
      for (let i = 0; i < Math.min(items.length, value.length); i++) {
        for (const [slot, text] of Object.entries(value[i])) {
          const node = items[i].findOne((n) => n.type === 'TEXT' && n.name === slot);
          if (node) await setText(node, text, log); else log.missing.push(`${key}[${i + 1}] ${slot}`);
        }
      }
    } else {
      const node = slide.findOne((n) => n.type === 'TEXT' && n.name === key);
      if (node) await setText(node, value, log); else log.missing.push(key);
    }
  }

  if (job.footer) {
    const footer = slide.findOne((n) => n.type === 'INSTANCE' && n.name === 'Footer');
    if (footer) { const props = footerProps(footer, job.footer); footer.setProperties(props); log.footer = props; } else log.missing.push('Footer');
  }
  out.push(log);
}
return out;
