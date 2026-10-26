#!/usr/bin/env node
// Builds data/catalog.json from extract.js output and data/font-metrics.json.
//   node cli/build-catalog.mjs <extract-part.json>...
// Capacity = chars per line × designed lines × FILL, per language.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILL = 0.9; // word wrap never fills a line completely
const LINE_SEP = new RegExp('[\\u2028\\u2029]', 'g');
const STACK_SLACK = 1.2; // a hand-broken stack may grow 20% over its template text
const ANY_BREAK = new RegExp('[\\n\\u2028\\u2029]', 'g');
const metrics = JSON.parse(readFileSync(join(ROOT, 'data/font-metrics.json'), 'utf8'));

const slides = process.argv.slice(2).flatMap((f) => {
  const d = JSON.parse(readFileSync(f, 'utf8'));
  if (!d.ok) throw new Error(`${f}: ${d.error}`);
  return d.result;
});

function capacity(t) {
  const m = metrics[t.font] || metrics['Struve Regular'];
  const lh = t.lineHeight || t.size * m.autoLineHeight;
  const lines = Math.max(1, Math.round(t.h / lh));
  const fixedWidth = t.autoResize === 'HEIGHT' || t.autoResize === 'NONE' || t.autoResize === 'TRUNCATE';
  // Some texts wrap far narrower than their layer (cover lead: layer 1728px, lines 615px).
  // For multi-line text that wraps on its own (no hand breaks) the rendered width is the real wrap width.
  const handBroken = new RegExp('[\\n\\u2028\\u2029]').test(t.sample.trim());
  const wrapW = lines >= 2 && !handBroken && t.renderW && t.renderW < t.w * 0.8 ? t.renderW : t.w;
  const cpl = (adv) => (adv ? Math.floor(wrapW / (t.size * adv)) : null);
  // Numbers are set in digits, which are wider than average letters.
  const numeric = /(value|num)(-\d+)?$/.test(t.slot);
  const en = cpl(numeric ? m.digitAdvance : m.avgAdvanceEn);
  const ru = cpl(numeric ? m.digitAdvance : m.avgAdvanceRu);
  // The template text is known to fit, so a limit is never below its length.
  const sampleLen = t.sample.replace(LINE_SEP, '').trim().length;
  const sampleRu = numeric || !m.avgAdvanceRu ? sampleLen : Math.floor(sampleLen * m.avgAdvanceEn / m.avgAdvanceRu);
  // A wide title or lead broken by hand into 3+ lines is a narrow stack in the design:
  // the full-width estimate overstates it, so the sample sets the limit.
  const breaks = (t.sample.trim().match(ANY_BREAK) || []).length;
  const stack = /^#(title|lead)$/.test(t.slot) && t.w >= 1000 && breaks >= 2;
  return {
    lines,
    cplEn: en, cplRu: ru,
    sampleLen, sampleRu,
    maxEn: stack ? Math.ceil(sampleLen * STACK_SLACK) : Math.max(Math.floor(en * lines * FILL), sampleLen),
    maxRu: stack ? Math.ceil(sampleRu * STACK_SLACK) : ru ? Math.max(Math.floor(ru * lines * FILL), sampleRu) : null,
    wraps: fixedWidth,
    ...(stack ? { stack: true } : {}),
  };
}

const slot = (t) => ({
  slot: t.slot, id: t.id, ...(t.group ? { group: t.group, item: t.item } : {}),
  font: t.font, size: t.size, color: t.color,
  ...(t.accentFonts.length ? { accentFonts: t.accentFonts } : {}),
  w: t.w, x: t.x, y: t.y,
  ...capacity(t),
  sample: t.sample.replace(LINE_SEP, '\n'),
});

function background(s) {
  const full = s.layers.filter((l) => l.full);
  const photo = full.find((l) => /фото/i.test(l.name));
  if (photo) return 'photo';
  const img = full.find((l) => l.image);
  if (img) return `image:${img.name}`;
  const fill = full.find((l) => l.fill)?.fill || s.fill;
  return fill || 'none';
}

const catalog = {
  version: 1,
  source: { fileKey: '3m8vS0i2okRWSOD3KaPVUX', note: 'Библиотека слайдов; id слайдов — из исходного шаблона, к компонентам ведёт data/library.json' },
  fill: FILL,
  slides: slides.map((s) => {
    const groups = s.groups;
    const groupOf = (t) => t.slot.startsWith('#item/');
    const itemSlots = s.slots.filter(groupOf);
    const loose = s.slots.filter((t) => !groupOf(t));
    return {
      n: Number(s.n), id: s.id, type: s.row,
      background: background(s),
      footer: s.footer,
      slots: loose.map(slot),
      groups: groups.map((g) => ({
        slot: g.slot, id: g.id, layout: g.layout, count: g.items.length,
        items: g.items.map((i) => i.id),
        highlighted: g.items.map((i) => i.fill).filter(Boolean),
      })),
      itemSlots: itemSlots.map(slot),
    };
  }),
};

writeFileSync(join(ROOT, 'data/catalog.json'), JSON.stringify(catalog, null, 1));
console.log(`catalog: ${catalog.slides.length} slides, ${catalog.slides.reduce((a, s) => a + s.slots.length + s.itemSlots.length, 0)} slots`);
