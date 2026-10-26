// Write: rename nodes. ARGS: { fileKey, renames: [{ id, name }] }.
// Refuses to run on any file other than ARGS.fileKey. Returns old names for rollback.
if (figma.fileKey !== ARGS.fileKey) throw new Error(`Wrong file: ${figma.fileKey}, expected ${ARGS.fileKey}`);
const nodes = await Promise.all(ARGS.renames.map((r) => figma.getNodeByIdAsync(r.id)));
const done = [], missing = [];
nodes.forEach((n, i) => {
  const r = ARGS.renames[i];
  if (!n) return missing.push(r.id);
  done.push({ id: r.id, from: n.name, to: r.name });
  n.name = r.name;
});
return { renamed: done.length, missing, rollback: done.map((d) => ({ id: d.id, name: d.from })) };
