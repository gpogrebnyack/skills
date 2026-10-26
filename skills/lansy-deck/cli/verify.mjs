// Deck verify: the built deck against its storyboard, through the bridge.
// Errors: text off the slide or clipped, auto-layout content taller than its frame.
// Warnings: widows, hand break plus wrap, more lines than the template, text edited away from the storyboard.

import { existsSync, readFileSync } from 'node:fs';
import { run } from './build.mjs';

const BATCH = 4;

export async function verify(storyboard, { storyPath, fileKey }) {
  const logPath = `${storyPath}.build.json`;
  if (!existsSync(logPath)) throw new Error(`no build log ${logPath} — build the deck first`);
  const saved = JSON.parse(readFileSync(logPath, 'utf8'));
  if (saved.fileKey !== fileKey) throw new Error(`build log is for ${saved.fileKey}, not ${fileKey}`);
  if (saved.slides.length !== storyboard.slides.length) throw new Error(`build log has ${saved.slides.length} slides, storyboard ${storyboard.slides.length}`);
  const jobs = storyboard.slides.map((entry, i) => ({ slideId: saved.slides[i], texts: entry.texts || {} }));
  const slides = [];
  for (let i = 0; i < jobs.length; i += BATCH) {
    const { result } = await run('verify.js', { fileKey, base: saved.base || null, slides: jobs.slice(i, i + BATCH) });
    slides.push(...result.map((r, k) => ({ ...r, n: i + k + 1, slide: storyboard.slides[i + k].slide })));
  }
  const errors = slides.reduce((a, s) => a + s.errors.length, 0);
  const warnings = slides.reduce((a, s) => a + s.warnings.length, 0);
  return { ok: errors === 0, errors, warnings, baseline: Boolean(saved.base), slides };
}

export function formatVerify(rep) {
  const lines = [`verify: ${rep.ok ? 'OK' : 'ОШИБКИ'} · ошибок ${rep.errors} · предупреждений ${rep.warnings}${rep.baseline ? '' : ' · без замера шаблона: рост строк не проверен, выход за рамку — от нуля'}`];
  for (const s of rep.slides) {
    if (!s.errors.length && !s.warnings.length) continue;
    lines.push(`  #${s.n} (слайд ${s.slide})`);
    for (const e of s.errors) lines.push(`    ✗ ${e}`);
    for (const w of s.warnings) lines.push(`    ! ${w}`);
  }
  return lines.join('\n');
}
