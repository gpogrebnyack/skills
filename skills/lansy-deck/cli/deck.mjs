#!/usr/bin/env node
// Agent-facing CLI over data/catalog.json, data/rhythm.json and families/*.md.
//   node cli/deck.mjs families              — one line per family: name, slides, purpose
//   node cli/deck.mjs family <name>         — full family card (file stem or Russian name)
//   node cli/deck.mjs list [type]           — one line per slide
//   node cli/deck.mjs slide <n|id>          — slots and limits of one slide
//   node cli/deck.mjs check <storyboard>    — rhythm and limits of a storyboard (exit 1 on errors)
//   node cli/deck.mjs wait --file <fileKey>  — start the bridge if needed, wait until the plugin runs in the file
//   node cli/deck.mjs build <storyboard> --file <fileKey> [--fill-only]
//                                           — import slides from the library into the empty Slides file, fill and verify
//   node cli/deck.mjs verify <storyboard> --file <fileKey>
//                                           — overflow, widows and extra lines in the built deck (exit 1 on errors)
//   node cli/deck.mjs shots <storyboard> --file <fileKey> --out <dir>
//                                           — PNG of every built slide, named by its storyboard number
//   node cli/deck.mjs footers               — footer topics the storyboard may use
//   node cli/deck.mjs stop                  — stop the bridge relay that build or wait started
//   --lang ru|en (default en; check takes it from the storyboard) picks the character limit
//   --json makes check print machine-readable output

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { catalog, families, findSlide, itemSlots, limitOf, rhythm, ROOT } from './lib.mjs';
import { check, formatReport } from './check.mjs';
import { build, run, waitForPlugin } from './build.mjs';
import { formatVerify, verify } from './verify.mjs';

const args = process.argv.slice(2);
const li = args.indexOf('--lang');
const lang = li >= 0 ? args.splice(li, 2)[1] : 'en';
const ji = args.indexOf('--json');
const asJson = ji >= 0 && Boolean(args.splice(ji, 1));
const fi = args.indexOf('--file');
const fileKey = fi >= 0 ? args.splice(fi, 2)[1] : null;
const oi = args.indexOf('--fill-only');
const fillOnly = oi >= 0 && Boolean(args.splice(oi, 1));
const ui = args.indexOf('--out');
const outDir = ui >= 0 ? args.splice(ui, 2)[1] : null;
const BRIDGE = `http://localhost:${process.env.BRIDGE_PORT || 3917}`;
const [cmd, arg] = args;

// A text that grows by width has no wrap limit: show the template length as a guide.
const limitText = (t, m) => (t.wraps ? `≤${String(m ?? '—').padEnd(4)} ${t.lines} стр. в образце` : `≈${String(t.sampleLen).padEnd(4)} растёт по ширине   `);
const fontText = (t) => `${t.font} ${Math.round(t.size)}`;
// Limits read off a 1–3 character sample or a tall narrow column are rough: say so.
const caveat = (t) => (t.sampleLen <= 3 ? '  (образец короткий — лимит условный)' : t.lines >= 6 ? '  (узкая колонка — точнее покажет verify)' : '');
const sample = (t, n) => `«${t.sample.replace(/\n/g, ' ').slice(0, n)}»`;

if (cmd === 'families') {
  for (const f of families()) console.log(`${f.key.padEnd(10)} ${f.name.padEnd(17)} ${f.slides.padEnd(6)} ${f.purpose}`);
} else if (cmd === 'family' && arg) {
  const f = families().find((x) => x.key === arg || x.name.toLowerCase() === arg.toLowerCase());
  if (!f) throw new Error(`no family ${arg}; see: deck.mjs families`);
  console.log(f.text);
} else if (cmd === 'list') {
  for (const s of catalog.slides.filter((x) => !arg || x.type === arg)) {
    const groups = s.groups.map((g) => `${g.slot}×${g.count}`).join(' ');
    const loose = s.slots.map((t) => t.slot).join(' ');
    const e = rhythm.slides[s.n];
    console.log(`${String(s.n).padStart(2)}  E${e.e} ${e.bg.padEnd(8)} ${s.type.padEnd(16)} ${loose.padEnd(28)} ${groups}`);
  }
} else if (cmd === 'slide' && arg) {
  const s = findSlide(arg);
  if (!s) throw new Error(`no slide ${arg}`);
  const r = rhythm.slides[s.n];
  console.log(`Slide ${s.n} · ${s.type} · id ${s.id} · E${r.e} · фон ${r.bg}${r.supermarker ? ' · Supermarker' : ''}`);
  console.log(`Footer: ${s.footer ? `Topic=${s.footer['Тема']}, Background=${s.footer['Фон'] === 'Тёмный' ? 'Dark' : 'Light'}` : 'нет'}`);
  console.log(`Limits: ${lang}, chars incl. spaces. Строки — как в образце; окончательно влезание проверяет deck verify.`);
  const preview = join('previews', `${String(s.n).padStart(2, '0')}.jpg`);
  if (existsSync(join(ROOT, preview))) console.log(`Preview: ${preview}`);
  for (const t of s.slots) console.log(`  ${t.slot.padEnd(14)} ${limitText(t, limitOf(t, lang))}  ${fontText(t)}${t.stack ? '  стопка: ставь переносы' : ''}  ${sample(t, 50)}${caveat(t)}`);
  for (const g of s.groups) {
    console.log(`  ${g.slot} — ровно ${g.count} эл.`);
    for (const t of itemSlots(s, g.slot, lang)) console.log(`    ${t.slot.padEnd(14)} ${limitText(t, t.limit)}  ${fontText(t)}  ${sample(t, 44)}${caveat(t)}`);
  }
} else if (cmd === 'check' && arg) {
  const report = check(JSON.parse(readFileSync(arg, 'utf8')));
  console.log(asJson ? JSON.stringify(report, null, 1) : formatReport(report));
  process.exit(report.errors.length ? 1 : 0);
} else if (cmd === 'wait' && fileKey) {
  try {
    await waitForPlugin(fileKey);
  } catch (e) {
    console.error(`wait failed: ${e.message}`);
    process.exit(1);
  }
} else if (cmd === 'footers') {
  for (const t of rhythm.footerThemes) console.log(t);
} else if (cmd === 'stop') {
  try {
    const res = await fetch(`${BRIDGE}/shutdown`, { method: 'POST' });
    console.log(res.ok ? 'bridge stopped' : `bridge did not stop (HTTP ${res.status}) — an older server? stop it by hand`);
    if (!res.ok) process.exit(1);
  } catch {
    console.log('bridge was not running');
  }
} else if (cmd === 'shots' && arg && fileKey && outDir) {
  const logPath = `${arg}.build.json`;
  if (!existsSync(logPath)) { console.error(`no build log ${logPath} — build the deck first`); process.exit(1); }
  const { slides } = JSON.parse(readFileSync(logPath, 'utf8'));
  const names = Object.fromEntries(slides.map((id, i) => [id, String(i + 1).padStart(2, '0')]));
  const { result } = await run('screenshots.js', { fileKey, ids: slides, names, scale: 0.5 }, { readOnly: true });
  mkdirSync(outDir, { recursive: true });
  for (const f of result.files) writeFileSync(join(outDir, `${names[f.id]}.png`), Buffer.from(f.base64, 'base64'));
  console.log(`${result.files.length} slides → ${resolve(outDir)}`);
} else if (cmd === 'verify' && arg && fileKey) {
  try {
    const report = await verify(JSON.parse(readFileSync(arg, 'utf8')), { storyPath: arg, fileKey });
    console.log(asJson ? JSON.stringify(report, null, 1) : formatVerify(report));
    process.exit(report.ok ? 0 : 1);
  } catch (e) {
    console.error(`verify failed: ${e.message}`);
    process.exit(1);
  }
} else if (cmd === 'build' && arg) {
  if (!fileKey) { console.error('build needs --file <fileKey of the empty Slides file>'); process.exit(2); }
  try {
    await build(JSON.parse(readFileSync(arg, 'utf8')), { storyPath: arg, fileKey, fillOnly });
  } catch (e) {
    console.error(`build failed: ${e.message}`);
    process.exit(1);
  }
} else {
  console.error('usage: deck.mjs families | family <name> | list [type] | slide <n|id> [--lang ru|en] | check <storyboard.json> [--json] | wait --file <key> | build <storyboard.json> --file <key> [--fill-only] | verify <storyboard.json> --file <key> [--json] | shots <storyboard.json> --file <key> --out <dir> | footers | stop');
  process.exit(2);
}
