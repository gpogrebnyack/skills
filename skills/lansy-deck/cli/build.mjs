// Storyboard → deck in an empty Figma Slides file, through the bridge.
// Phases: wait for the plugin, import slides from the published library, rows by section, fill, verify.
// Slide ids and the template's line counts and overflows go to <storyboard>.build.json: --fill-only and deck verify reuse them.

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { check, formatReport } from './check.mjs';
import { formatVerify, verify } from './verify.mjs';
import { findSlide, library, ROOT } from './lib.mjs';

const BRIDGE = `http://localhost:${process.env.BRIDGE_PORT || 3917}`;
const IMPORT_BATCH = 4; // the first import after a library update downloads components: ~25 s a slide
const FILL_BATCH = 4;
const LINE_SEP = new RegExp('[\\u2028\\u2029]', 'g');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const slidesUrl = (fileKey) => `https://www.figma.com/slides/${fileKey}`;

export async function run(scriptFile, args, { readOnly = false, timeoutMs = 300_000 } = {}) {
  // Escape line separators: the plugin sandbox parses the injected ARGS as source code.
  const json = JSON.stringify(args).replace(LINE_SEP, (c) => `\\u${c.charCodeAt(0).toString(16)}`);
  const code = `const ARGS = ${json};\n` + readFileSync(join(ROOT, 'bridge/scripts', scriptFile), 'utf8');
  const res = await fetch(`${BRIDGE}/run`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, fileKey: args.fileKey, readOnly, timeoutMs }),
  });
  const body = await res.json();
  if (!body.ok) throw new Error(`${scriptFile}: ${body.error}`);
  return { result: body.result, info: body.info };
}

async function status() {
  try { return await (await fetch(`${BRIDGE}/status`)).json(); } catch { return null; }
}

// The relay is a local process: start it in the background if nobody did.
async function ensureServer(log) {
  if (await status()) return;
  spawn(process.execPath, [join(ROOT, 'bridge/server.mjs')], { detached: true, stdio: 'ignore' }).unref();
  for (let i = 0; i < 20; i++) { await sleep(250); if (await status()) { log('bridge: server started'); return; } }
  throw new Error(`bridge server did not start at ${BRIDGE}`);
}

// Blocks until the plugin runs in this file. The agent asks the user to start it before calling build.
export async function waitForPlugin(fileKey, { log = console.log, timeoutMs = 600_000 } = {}) {
  await ensureServer(log);
  const connected = (s) => s?.plugins?.find((p) => p.fileKey === fileKey);
  let info = connected(await status());
  if (!info) {
    log(`waiting for the plugin in ${slidesUrl(fileKey)}`);
    log('  Figma Desktop → open the file → Plugins → Development → Lansy Deck Bridge');
    const until = Date.now() + timeoutMs;
    while (!info && Date.now() < until) { await sleep(2000); info = connected(await status()); }
    if (!info) throw new Error(`plugin not started in ${fileKey} within ${timeoutMs / 60000} min`);
  }
  log(`plugin: connected to «${info.fileName}»`);
  return info;
}

// Consecutive slides with the same section form one row.
function rowsOf(storyboard, ids) {
  const rows = [];
  storyboard.slides.forEach((entry, i) => {
    const name = entry.section || '';
    if (rows.at(-1)?.name === name) rows.at(-1).ids.push(ids[i]);
    else rows.push({ name, ids: [ids[i]] });
  });
  return rows;
}

function libraryEntry(entry) {
  const s = findSlide(entry.slide);
  const lib = s && library.slides[s.id];
  if (!lib) throw new Error(`slide ${entry.slide} is not in the library`);
  return { key: lib.key, name: lib.name };
}

export async function build(storyboard, { storyPath, fileKey, fillOnly, log = console.log }) {
  const report = check(storyboard);
  if (!report.ok) {
    log(formatReport(report));
    throw new Error('storyboard has errors — fix them with deck check first');
  }
  const logPath = `${storyPath}.build.json`;
  const info = await waitForPlugin(fileKey, { log });
  if (info.editorType !== 'slides') throw new Error(`${fileKey} is not a Figma Slides file`);
  let ids;

  if (fillOnly) {
    if (!existsSync(logPath)) throw new Error(`no build log ${logPath}`);
    const saved = JSON.parse(readFileSync(logPath, 'utf8'));
    if (saved.fileKey !== fileKey) throw new Error(`build log is for ${saved.fileKey}, not ${fileKey}`);
    ids = saved.slides;
    log(`import: reuse ${ids.length} slides from ${logPath}`);
  } else {
    // Only an empty file: a rerun on top of a half-built deck would mix two decks.
    const { result: found } = await run('count-slides.js', { fileKey }, { readOnly: true });
    if (found.slides === 1) {
      // A Slides file made by hand starts with Figma's title slide: drop it if untouched.
      const { result: cleared } = await run('clear-default-slide.js', { fileKey });
      if (cleared.removed) { log(`removed Figma's default title slide (${cleared.texts.join(' · ') || 'empty'})`); found.slides = 0; }
    }
    if (found.slides) throw new Error(`file already has ${found.slides} slides — build into a new empty Slides file, or rerun with --fill-only`);
    const wanted = storyboard.slides.map(libraryEntry);
    ids = [];
    for (let i = 0; i < wanted.length; i += IMPORT_BATCH) {
      const { result } = await run('import-slides.js', { fileKey, slides: wanted.slice(i, i + IMPORT_BATCH) }, { timeoutMs: 600_000 });
      ids.push(...result.map((r) => r.slide));
      log(`import: slides ${i + 1}–${Math.min(i + IMPORT_BATCH, wanted.length)} of ${wanted.length}`);
    }
    const rows = rowsOf(storyboard, ids);
    await run('arrange-slides.js', { fileKey, rows: rows.map((r) => r.ids) });
    const saved = { fileKey, fileName: info.fileName, builtAt: new Date().toISOString(), slides: ids };
    writeFileSync(logPath, JSON.stringify(saved, null, 1));
    // Before the fill: what the template's own texts and frames take.
    ({ result: saved.base } = await run('verify.js', { fileKey, baseOnly: true, slides: ids.map((slideId) => ({ slideId })) }));
    writeFileSync(logPath, JSON.stringify(saved, null, 1));
    log(`rows: ${rows.map((r) => `${r.name || '—'} (${r.ids.length})`).join(' · ')} → ${logPath}`);
  }

  if (ids.length !== storyboard.slides.length) throw new Error(`slides ${ids.length} ≠ storyboard slides ${storyboard.slides.length}`);
  const jobs = storyboard.slides.map((entry, i) => ({ slideId: ids[i], texts: entry.texts || {}, footer: entry.footer }));
  const results = [];
  for (let i = 0; i < jobs.length; i += FILL_BATCH) {
    const { result } = await run('build-fill.js', { fileKey, slides: jobs.slice(i, i + FILL_BATCH) });
    results.push(...result);
    log(`fill: slides ${i + 1}–${Math.min(i + FILL_BATCH, jobs.length)} done`);
  }
  const missing = results.flatMap((r, i) => r.missing.map((m) => `#${i + 1}: ${m}`));
  log(`fill: ${results.reduce((a, r) => a + r.set, 0)} texts set`);
  if (missing.length) log(`not found:\n  ${missing.join('\n  ')}`);
  const verified = await verify(storyboard, { storyPath, fileKey });
  log(formatVerify(verified));
  log(`deck: ${slidesUrl(fileKey)}`);
  return { slides: ids, results, missing, verified };
}
