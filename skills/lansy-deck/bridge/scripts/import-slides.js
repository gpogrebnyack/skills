// Write: add slides to a Slides file from the published slide library.
// ARGS: { fileKey, slides: [{ key, name }] }   // appended in order to the last row
// Each library component becomes an ordinary slide: instance → detach → its layers move
// onto the slide. Nested footer and dots stay instances of the library components.
if (figma.fileKey !== ARGS.fileKey) throw new Error(`Wrong file: ${figma.fileKey}, expected ${ARGS.fileKey}`);
if (figma.editorType !== 'slides') throw new Error('Open a Figma Slides file');

const out = [];
for (const { key, name } of ARGS.slides) {
  const comp = await figma.importComponentByKeyAsync(key);
  const slide = figma.createSlide();
  const inst = comp.createInstance();
  slide.appendChild(inst);           // parent first, then position
  inst.x = 0; inst.y = 0;
  const frame = inst.detachInstance();
  slide.fills = JSON.parse(JSON.stringify(frame.fills));
  for (const kid of [...frame.children]) slide.appendChild(kid);
  frame.remove();
  out.push({ name, slide: slide.id });
}
return out;
