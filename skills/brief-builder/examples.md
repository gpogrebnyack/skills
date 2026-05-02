# УМКА — Worked Examples

Reference file with full decomposition examples across different domains.
Read this file when you need inspiration for structuring a specific type of request.

---

## Example 1 — Literary Analysis

**Raw input:** «хочу изучить книгу Идиот Достоевского на предмет депрессии»

**У — Установка:**
Проанализировать тему депрессии в романе «Идиот» Ф.М. Достоевского. Формат — академический анализ для читателей, интересующихся литературоведением.

**М — Модель:**
Литературовед, специализирующийся на творчестве Достоевского. Глубокое понимание психологизма в русской классике XIX века.

**К — Контекст:**
Роман «Идиот» (1868). Главный герой — князь Мышкин — страдает от психических расстройств, которые можно интерпретировать как проявления депрессии. Тема душевных страданий является центральной для произведения.

**А — Алгоритм:**
1. Проанализировать образ Мышкина — выявить признаки депрессии с цитатами.
2. Рассмотреть, как тема раскрывается через взаимодействие с другими персонажами.
3. Исследовать философские и нравственные вопросы, связанные с депрессией.
4. Сделать выводы о роли темы в контексте всего произведения.

---

## Example 2 — Landing Page

**Raw input:** «нужен лендинг для кофейни»

**У — Установка:**
Создать дизайн-макет лендинга для кофейни. Результат — готовый код (HTML/CSS/JS). Тон — тёплый, крафтовый, уютный.

**М — Модель:**
UI/UX-дизайнер и фронтенд-разработчик, специализирующийся на лендингах для HoReCa-сегмента. Сильная сторона — передача атмосферы через типографику и палитру.

**К — Контекст:**
Кофейня — локальный бизнес. Целевая аудитория — городские жители 25-40 лет. Нужны блоки: герой, меню, о нас, локация, контакты. Мобильная версия обязательна.

**А — Алгоритм:**
1. Определить визуальную концепцию (палитра, типографика, настроение).
2. Спроектировать структуру страницы (порядок блоков, CTA).
3. Написать код с адаптивной вёрсткой.
4. Добавить микроанимации и hover-эффекты.

---

## Example 3 — Business Diagnostics

**Raw input:** «почему у нас упали продажи»

**У — Установка:**
Провести диагностику причин падения продаж. Формат — структурированный аналитический разбор с гипотезами и рекомендациями. Тон — деловой.

**М — Модель:**
Бизнес-аналитик с опытом в диагностике коммерческих проблем и построении гипотез на основе ограниченных данных.

**К — Контекст:**
Конкретные данные не предоставлены — необходимо построить универсальный фреймворк анализа. Типичные категории причин: рыночные, продуктовые, операционные, маркетинговые.

**А — Алгоритм:**
1. Перечислить основные категории причин падения продаж.
2. Для каждой категории дать диагностические вопросы.
3. Предложить метрики для проверки каждой гипотезы.
4. Сформулировать первые шаги по устранению.

---

## Example 4 — Technical Code Review

**Raw input:** «review my React component, it's slow»

**У — Setup:**
Perform a performance audit of a React component. Result — a prioritized list of issues with fixes. Tone — technical, actionable.

**М — Role:**
Senior frontend engineer specializing in React performance optimization. Familiar with profiling tools, memoization patterns, and rendering lifecycle.

**К — Context:**
User reports perceived slowness. No profiler data provided — analysis must be based on code patterns. Assume React 18+ with hooks.

**А — Algorithm:**
1. Identify unnecessary re-renders (missing memoization, inline objects/functions).
2. Check for expensive computations without useMemo.
3. Evaluate component tree structure for render isolation.
4. Produce a fix list ordered by impact (high → low) with code snippets.

---

## Example 5 — Presentation Brief

**Raw input:** «сделай презу для инвестора на 10 слайдов»

**У — Установка:**
Создать структуру и контент питч-дека на 10 слайдов для встречи с инвестором. Формат — готовый текст слайдов + заметки для спикера. Тон — уверенный, data-driven.

**М — Модель:**
Стратегический консультант с опытом подготовки pitch deck для стартапов Series A/B. Понимает, что инвестор смотрит на рынок, unit-экономику и команду.

**К — Контекст:**
Стартап ранней стадии. Конкретные метрики не предоставлены — использовать шаблонную структуру с плейсхолдерами. Презентация для live-выступления, не для отправки по почте.

**А — Алгоритм:**
1. Определить структуру дека: Problem → Solution → Market → Product → Traction → Business Model → Competition → Team → Ask → Appendix.
2. Написать заголовок и 3-5 буллетов на каждый слайд.
3. Добавить speaker notes с ключевыми тезисами для устной подачи.
4. Пометить плейсхолдеры для данных, которые нужно заполнить.

---

## Example 6 — Content Strategy

**Raw input:** «help me plan content for our company blog, we're a B2B SaaS»

**У — Setup:**
Create a 4-week content calendar with topic ideas, formats, and distribution channels. Result — a structured plan in table format. Tone — strategic, practical.

**М — Role:**
Content strategist with B2B SaaS experience. Understands the funnel stages (awareness → consideration → decision) and how content maps to each.

**К — Context:**
B2B SaaS company, specifics unknown. Assume a technical audience (developers, engineering managers). Publishing cadence: 2-3 pieces per week across blog, LinkedIn, newsletter.

**А — Algorithm:**
1. Define 3-4 content pillars aligned with typical B2B SaaS pain points.
2. Map each pillar to funnel stages.
3. Generate topic ideas (2-3 per pillar per week).
4. Assign format (how-to, case study, opinion, tutorial) and channel to each.
5. Arrange into a 4-week calendar table.

---

## Anti-examples — When NOT to use УМКА

| Raw input | Why skip УМКА |
|---|---|
| «Какой курс доллара?» | Single fact, no ambiguity |
| «Переведи: the cat sat on the mat» | Fully specified, one-step |
| «2 + 2» | Trivial |
| «Отрефактори эту функцию, чтобы она принимала массив» | Task is clear, context is in the code |
| «Привет, как дела?» | Conversational, not a task |
