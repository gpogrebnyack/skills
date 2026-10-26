# skills

Коллекция агентских скиллов в формате [Agent Skills](https://skills.sh/) от [@gpogrebnyack](https://github.com/gpogrebnyack).

Каждый скилл — самодостаточный каталог в `skills/` с файлом `SKILL.md` и опциональными ассетами рядом. Совместимо с Claude Code, Codex CLI и любыми агентами, которые понимают спецификацию Agent Skills.

## Установка

Через [`npx skills`](https://github.com/vercel-labs/skills) (рекомендуется):

```bash
npx skills add gpogrebnyack/skills@<skill-name> -g -y
```

Флаг `-g` ставит в пользовательскую директорию агента (для Claude Code это `~/.claude/skills/`), `-y` пропускает подтверждение.

## Скиллы

### `design-reference-router`

Маршрутизирует поиск референсов по дизайн-библиотекам. Выбирает Mobbin для продукта, One Page Love и Landing.Gallery для сайтов, Funded и Alexander Jarvis для питч-деков, VASA Works и Deck.gallery для презентаций. Проверяет MCP, подключает недостающие и соблюдает порядок вызова. Совместим с Claude Code, Codex CLI, Pi и другими агентами.

```bash
npx skills add gpogrebnyack/skills@design-reference-router -g -y
```

Подробности — в [`skills/design-reference-router/SKILL.md`](skills/design-reference-router/SKILL.md).

### `graphic-directions-research`

Визуальный аудит конкурентов и генерация стилистических направлений для бренда. Скриншоты через `pageres-cli`, раскладка по семиотическому квадрату Флоша, карта восприятия, ERRC-сетка, направления с кураторскими примерами-прецедентами. Инструкции скилла — на английском, отчёт — на любом языке (по умолчанию русский, спрашивается у пользователя).

```bash
npx skills add gpogrebnyack/skills@graphic-directions-research -g -y
```

Подробности — в [`skills/graphic-directions-research/SKILL.md`](skills/graphic-directions-research/SKILL.md). Кураторская база источников/студий/тем — в [`references.md`](skills/graphic-directions-research/references.md).

### `lansy-deck`

Собирает питч-деку Lansy в Figma Slides из готовых слайдов библиотеки. Режет текст на мысли, подбирает слайд из 10 семейств, пишет тексты под лимит знаков, собирает деку в пустом файле и проверяет переполнения и висячие слова. Внутри — короткий `SKILL.md`, CLI-справочник `cli/deck.mjs` и мост к плагину в Figma Desktop: шрифты бренда есть только там.

Нужно до установки: Figma Desktop, доступ к библиотеке слайдов Lansy в команде Datum и Node.js 18+. Плагин ставится один раз: Plugins → Development → Import plugin from manifest → `~/.claude/skills/lansy-deck/bridge/plugin/manifest.json`.

```bash
npx skills add gpogrebnyack/skills@lansy-deck -g -y
```

Подробности — в [`skills/lansy-deck/SKILL.md`](skills/lansy-deck/SKILL.md).

### `prompt-helper`

Один вход для промптов к генеративным моделям картинок и видео: Kling 3.0 Omni, Nano Banana 2 и Pro, Seedance 2.5, GPT Image 2.5. Сам определяет модель по запросу и ведёт в нужный гайд из `references/`. При вызове запускает `scripts/check_updates.py` — сверяет версии моделей с открытым каталогом fal.ai и, если вышла новая, обновляет гайд.

```bash
npx skills add gpogrebnyack/skills@prompt-helper -g -y
```

Подробности — в [`skills/prompt-helper/SKILL.md`](skills/prompt-helper/SKILL.md).

## Лицензия

MIT — см. [LICENSE](LICENSE).
