// Write test, copy only: put Cyrillic into a Struve H1, measure, then restore.
const grid = figma.currentPage.children.find((n) => n.type === 'SLIDE_GRID');
const slide = grid.children.flatMap((r) => r.children).find((s) => s.name === '47');
if (!slide) throw new Error('Slide "47" not found');
const h1 = slide.findAllWithCriteria({ types: ['TEXT'] }).find((t) => t.name === 'H1');
if (!h1) throw new Error('H1 not found on slide 47');

await Promise.all(h1.getStyledTextSegments(['fontName']).map((s) => figma.loadFontAsync(s.fontName)));
const before = { chars: h1.characters, w: h1.width, h: h1.height };

h1.characters = 'Видим, где теряются продажи — и почему';
const after = { chars: h1.characters, w: h1.width, h: h1.height, font: h1.fontName, missing: h1.hasMissingFont };

h1.characters = before.chars;
const restored = h1.characters === before.chars && h1.height === before.h;

return { slideId: slide.id, h1Id: h1.id, before, after, restored };
