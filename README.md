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

## Лицензия

MIT — см. [LICENSE](LICENSE).
