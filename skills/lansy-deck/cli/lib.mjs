// Shared data access for the deck CLI: catalog, rhythm rules, family cards, slot limits.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

export const catalog = readJson('data/catalog.json');
export const rhythm = readJson('data/rhythm.json');
export const library = readJson('data/library.json'); // template slide id → published library component

// Template row name → family card file.
export const FAMILY_OF_TYPE = {
  'Обложка': 'cover', 'Раздел': 'section', 'Заявление': 'statement', 'Тезисы': 'theses', 'Цифра': 'numbers',
  'Процесс': 'process', 'Интерфейс': 'interface', 'Таблица': 'table', 'Визуальная пауза': 'pause', 'Финал': 'final',
};

export function findSlide(key) {
  return catalog.slides.find((x) => String(x.n) === String(key) || x.id === key) || null;
}

export function families() {
  const dir = join(ROOT, 'families');
  return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
    const text = readFileSync(join(dir, f), 'utf8');
    const name = text.match(/^# Семейство «(.+)»/m)?.[1] ?? f;
    const slides = text.match(/Слайды? ([\d–, ]+)/)?.[1].trim() ?? '';
    const purpose = text.match(/## Для чего\n(.+)/)?.[1] ?? '';
    return { key: f.replace(/\.md$/, ''), name, slides, purpose, text, first: parseInt(slides, 10) };
  }).sort((a, b) => a.first - b.first);
}

export const limitOf = (t, lang) => (lang === 'ru' ? t.maxRu : t.maxEn);
const sampleOf = (t, lang) => (lang === 'ru' ? t.sampleRu : t.sampleLen);

// Item slots of one group, one entry per slot name. Items with the same width and size
// share a limit: the longest template text among them proves that length fits all of them.
export function itemSlots(slide, group, lang) {
  const bySlot = new Map();
  for (const t of slide.itemSlots.filter((x) => (x.group || '#items') === group)) {
    bySlot.set(t.slot, [...(bySlot.get(t.slot) || []), t]);
  }
  return [...bySlot.values()].map((ts) => {
    const geo = new Map();
    for (const t of ts) geo.set(`${t.w}|${t.size}`, [...(geo.get(`${t.w}|${t.size}`) || []), t]);
    const limits = [...geo.values()].map((g) => Math.max(...g.map((t) => limitOf(t, lang) ?? 0), ...g.map((t) => sampleOf(t, lang))));
    const longest = ts.reduce((a, b) => (b.lines > a.lines ? b : a));
    return { ...longest, limit: Math.min(...limits) };
  });
}
