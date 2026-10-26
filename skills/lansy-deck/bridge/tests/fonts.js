// Read-only: can the desktop runtime load the brand fonts?
const styles = [
  ['Struve', 'Light'], ['Struve', 'Regular'], ['Struve', 'Medium'], ['Struve', 'Semibold'], ['Struve', 'Bold'],
  ['Supermarker', 'Italic'], ['Supermarker', 'Medium Italic'],
];
const load = {};
for (const [family, style] of styles) {
  try { await figma.loadFontAsync({ family, style }); load[`${family} ${style}`] = 'ok'; }
  catch (e) { load[`${family} ${style}`] = 'ERR ' + String(e).split('\n')[0]; }
}
const available = (await figma.listAvailableFontsAsync())
  .filter((f) => /struve|supermarker/i.test(f.fontName.family))
  .map((f) => `${f.fontName.family} ${f.fontName.style}`);
return { load, available };
