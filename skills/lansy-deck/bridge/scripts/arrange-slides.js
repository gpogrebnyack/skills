// Write: lay slides out in rows, one row per storyboard section.
// ARGS: { fileKey, rows: [[slideId]] }
// New rows can't be named in Figma Slides; the row break alone marks the section.
if (figma.fileKey !== ARGS.fileKey) throw new Error(`Wrong file: ${figma.fileKey}, expected ${ARGS.fileKey}`);
const rows = [];
for (const ids of ARGS.rows) {
  const row = [];
  for (const id of ids) {
    const s = await figma.getNodeByIdAsync(id);
    if (!s || s.type !== 'SLIDE') throw new Error(`No slide ${id}`);
    row.push(s);
  }
  rows.push(row);
}
figma.setSlideGrid(rows);
return figma.getSlideGrid().map((r) => r.length);
