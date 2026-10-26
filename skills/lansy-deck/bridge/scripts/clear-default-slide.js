// Write: remove the title slide Figma puts into a new Slides file, and nothing else.
// ARGS: { fileKey }
// A file made by hand starts with one slide holding placeholder text («Slide Deck Title»).
// Removed only when it is the file's sole slide and looks untouched: no slot layers (#…) that a
// template slide always has, no images, only short placeholder-length texts.
if (figma.fileKey !== ARGS.fileKey) throw new Error(`Wrong file: ${figma.fileKey}, expected ${ARGS.fileKey}`);
const slides = figma.getSlideGrid().flat().filter((s) => !s.removed);
if (slides.length !== 1) return { removed: false, reason: `${slides.length} slides` };
const slide = slides[0];
const nodes = slide.findAll(() => true);
const texts = nodes.filter((n) => n.type === 'TEXT').map((t) => t.characters);
const hasImage = nodes.some((n) => Array.isArray(n.fills) && n.fills.some((f) => f.type === 'IMAGE'));
const hasSlots = nodes.some((n) => n.name.startsWith('#'));
const untouched = !hasSlots && !hasImage && texts.every((t) => t.length <= 60);
if (!untouched) return { removed: false, reason: 'the slide has content', texts };
slide.remove();
return { removed: true, texts };
