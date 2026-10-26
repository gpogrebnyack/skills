// Storyboard check: rhythm rules from data/rhythm.json and text limits from data/catalog.json.
//
// Storyboard JSON:
// {
//   "lang": "ru",
//   "slides": [
//     { "section": "Problem", "slide": 19, "footer": { "Topic": "Problem" },
//       "texts": { "#title": "…", "#items": [ { "#item/title": "…", "#item/text": "…" } ] } }
//   "\n" in a text is a line break; "*words*" marks the Supermarker accent (English decks only).
//   ]
// }
// Errors break the rules and must be fixed before the storyboard goes to the user.
// Warnings are judgment calls; infos are notes for the build.

import { FAMILY_OF_TYPE, findSlide, itemSlots, limitOf, rhythm } from './lib.mjs';

const R = rhythm.rules;

export function check(storyboard) {
  const lang = storyboard.lang === 'ru' ? 'ru' : 'en';
  const errors = [], warnings = [], infos = [];
  const at = (i) => `#${i + 1}`;
  const rows = (storyboard.slides || []).map((entry, i) => {
    const s = findSlide(entry.slide);
    if (!s) { errors.push(`${at(i)}: слайда ${entry.slide} нет в шаблоне`); return null; }
    return { i, entry, s, family: FAMILY_OF_TYPE[s.type], r: rhythm.slides[s.n] };
  });
  const ok = rows.filter(Boolean);
  if (!ok.length) return summarize(lang, rows, errors, warnings, infos);

  // Per slide: banned slides, Supermarker, footer, texts.
  for (const { i, entry, s, r } of ok) {
    const where = `${at(i)} (слайд ${s.n})`;
    if (R.banned[s.n]) errors.push(`${where}: ${R.banned[s.n]}`);
    if (r.supermarker && R.supermarker[lang] === 0) errors.push(`${where}: акцент Supermarker без кириллицы — в русской деке возьми другой слайд`);
    const accented = Object.values(entry.texts || {}).some((v) => typeof v === 'string' && /\*[^*]+\*/.test(v));
    if (r.supermarker && lang === 'en' && !accented) warnings.push(`${where}: акцент Supermarker не размечен — отметь 2–3 слова как *words*, иначе всё будет Struve`);
    const theme = entry.footer?.Topic;
    if (theme && !rhythm.footerThemes.includes(theme)) errors.push(`${where}: темы футера «${theme}» нет. Есть: ${rhythm.footerThemes.join(', ')}`);
    checkTexts(where, entry.texts || {}, s, lang, errors, warnings, infos);
  }
  const superCount = ok.filter((x) => x.r.supermarker).length;
  if (lang === 'en' && superCount > R.supermarker.en) errors.push(`Supermarker: ${superCount} слайдов, можно не больше ${R.supermarker.en}`);

  // Deck order.
  if (ok[0].family !== R.first) errors.push(`${at(ok[0].i)}: первый слайд должен быть из семейства «Обложка»`);
  if (ok.at(-1).family !== R.last) errors.push(`${at(ok.at(-1).i)}: последний слайд должен быть из семейства «Финал»`);

  // Neighbours and runs.
  let e1run = 0;
  ok.forEach((x, k) => {
    const prev = ok[k - 1];
    if (prev && R.noAdjacentE3 && prev.r.e === 3 && x.r.e === 3) errors.push(`${at(prev.i)}–${at(x.i)}: два E3 подряд (слайды ${prev.s.n} и ${x.s.n})`);
    if (prev && R.noAdjacentSameSlide && prev.s.n === x.s.n) errors.push(`${at(prev.i)}–${at(x.i)}: один шаблон ${x.s.n} подряд`);
    e1run = x.r.e === 1 ? e1run + 1 : 0;
    if (e1run === R.maxE1Run + 1) errors.push(`${at(x.i)}: ${e1run} слайда E1 подряд, можно не больше ${R.maxE1Run}`);
  });

  // Repeats outside sections, one section template.
  const seen = new Map();
  for (const x of ok) {
    if (R.noRepeatSlideExcept.includes(x.family)) continue;
    if (seen.has(x.s.n)) errors.push(`${at(x.i)}: шаблон ${x.s.n} уже стоит на ${at(seen.get(x.s.n))}, повтор можно только у разделов`);
    else seen.set(x.s.n, x.i);
  }
  const sectionTemplates = new Set(ok.filter((x) => x.family === 'section').map((x) => x.s.n));
  if (R.sectionsOneTemplate && sectionTemplates.size > 1) errors.push(`разделы из разных шаблонов: ${[...sectionTemplates].join(', ')} — нужен один`);

  // Backgrounds and E3 share.
  for (const [bg, max] of Object.entries(R.maxBackground)) {
    const list = ok.filter((x) => x.r.bg === bg);
    if (list.length > max) errors.push(`фон ${bg} на ${list.map((x) => at(x.i)).join(', ')} — всего ${list.length}, можно не больше ${max}`);
  }
  const e3 = ok.filter((x) => x.r.e === 3).length;
  const share = e3 / ok.length;
  if (share < R.e3Share[0] || share > R.e3Share[1]) {
    warnings.push(`доля E3 ${Math.round(share * 100)}% вне нормы ${R.e3Share[0] * 100}–${R.e3Share[1] * 100}%`);
  }
  return summarize(lang, rows, errors, warnings, infos);
}

function checkTexts(where, texts, s, lang, errors, warnings, infos) {
  const loose = new Map(s.slots.map((t) => [t.slot, t]));
  const groups = new Map(s.groups.map((g) => [g.slot, g]));
  for (const key of Object.keys(texts)) {
    if (!loose.has(key) && !groups.has(key)) errors.push(`${where}: слота ${key} нет. Есть: ${[...loose.keys(), ...groups.keys()].join(' ') || '—'}`);
  }
  for (const [key, t] of loose) {
    const value = texts[key];
    if (value === undefined) { warnings.push(`${where}: ${key} не заполнен — останется текст шаблона «${t.sample.replace(/\n/g, ' ').slice(0, 40)}»`); continue; }
    lengthCheck(`${where} ${key}`, value, t, limitOf(t, lang), errors, warnings, t.stack);
  }
  for (const [name, g] of groups) {
    const items = texts[name];
    if (items === undefined) { warnings.push(`${where}: ${name} не заполнен — останутся ${g.count} эл. шаблона`); continue; }
    if (!Array.isArray(items)) { errors.push(`${where}: ${name} должен быть массивом элементов`); continue; }
    // Removing or adding items gives a layout the template never had: the count must match.
    if (items.length !== g.count) errors.push(`${where}: в ${name} ${items.length} эл., а шаблон рассчитан ровно на ${g.count} — возьми слайд под ${items.length} или перестрой пункты`);
    const slots = new Map(itemSlots(s, name, lang).map((t) => [t.slot, t]));
    items.forEach((item, k) => {
      for (const [key, value] of Object.entries(item)) {
        const t = slots.get(key);
        if (!t) { errors.push(`${where} ${name}[${k + 1}]: слота ${key} нет. Есть: ${[...slots.keys()].join(' ')}`); continue; }
        lengthCheck(`${where} ${name}[${k + 1}] ${key}`, value, t, t.limit, errors, warnings, false);
      }
    });
  }
}

function lengthCheck(label, value, t, limit, errors, warnings, stack) {
  const len = String(value).replace(/[\n*]/g, '').length; // line breaks and accent markers take no room
  if (!t.wraps) {
    if (len > t.sampleLen * 1.5) warnings.push(`${label}: ${len} знаков, в шаблоне ${t.sampleLen} — строка растёт по ширине, проверь на скриншоте`);
    return;
  }
  if (limit && len > limit) errors.push(`${label}: ${len} знаков при лимите ${limit} — сократи на ${len - limit}`);
  if (stack && !String(value).includes('\n')) warnings.push(`${label}: в шаблоне это узкая стопка — расставь переносы \\n`);
}

function summarize(lang, rows, errors, warnings, infos) {
  const ok = rows.filter(Boolean);
  const count = (f) => ok.filter(f).length;
  const stats = {
    slides: ok.length,
    e1: count((x) => x.r.e === 1), e2: count((x) => x.r.e === 2), e3: count((x) => x.r.e === 3),
    lime: count((x) => x.r.bg === 'lime'), dark: count((x) => x.r.bg === 'dark'),
    supermarker: count((x) => x.r.supermarker),
  };
  return { lang, ok: errors.length === 0, stats, errors, warnings, infos };
}

export function formatReport(rep) {
  const { stats: st } = rep;
  const pct = st.slides ? Math.round((st.e3 / st.slides) * 100) : 0;
  const lines = [
    `${rep.ok ? 'OK' : 'ОШИБКИ'} · ${st.slides} слайдов · E1 ${st.e1} / E2 ${st.e2} / E3 ${st.e3} (${pct}%) · лайм ${st.lime} · тёмных ${st.dark} · Supermarker ${st.supermarker}`,
  ];
  const block = (title, list) => { if (list.length) lines.push('', `${title}:`, ...list.map((x) => `  - ${x}`)); };
  block('Ошибки', rep.errors);
  block('Предупреждения', rep.warnings);
  block('Для сборки', rep.infos);
  return lines.join('\n');
}
