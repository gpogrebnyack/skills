# Kling 3.0 Omni — Руководство по промптингу

> Составлено на основе верифицированных источников (101 агент, 19 источников, 25 проверенных утверждений).
> Уровни достоверности: ✅ высокий (официальная документация) · ⚠️ средний (сообщество, подтверждено несколькими источниками) · ❌ опровергнуто

---

## 1. Что такое Kling 3.0 Omni

Kling 3.0 Omni — модель генерации видео от Kuaishou (февраль 2026). Ключевые характеристики:

| Параметр | Значение |
|---|---|
| Длительность видео | 3–15 секунд ✅ |
| Мульти-шот | до ~6 шотов в одном запросе ⚠️ |
| Референсы персонажей | до 4 изображений на персонажа ✅ |
| Синтаксис ссылок | `@ИмяПерсонажа` в UI / `<<<element_1>>>` в API ✅ |

---

## 2. Структура промпта — «Constraint Sandwich»

Единственная структурная рекомендация, прошедшая верификацию — трёхслойный «сэндвич» для каждого шота:

```
[Subject Anchor]  — кто/что в кадре, чёткое определение
[Shot + Action]   — фрейминг и что происходит
[Constraints]     — что должно оставаться неизменным между шотами
```

**Пример одношотового промпта:**
```
A silver-haired botanist in a worn linen apron stands at a cluttered greenhouse workbench.
Medium shot, she slowly lifts a glass terrarium toward the light, inspecting the moss inside.
Keep the same apron detail and grey-blue lighting throughout.
```

> ⚠️ Это рекомендация сообщества (Medium, travisnicholson), не официальный стандарт Kuaishou.
> Формальные многоуровневые формулы (5-слойные, 7-элементные) — опровергнуты.

---

## 3. Мульти-шот: сторибординг в одном промпте

Kling 3.0 Omni поддерживает **до ~6 шотов** в одном запросе через интерфейс «Custom Multi-Shot». Каждый шот описывается отдельно.

### Принцип: один шот = один абзац

Не пишите один большой блок текста. Каждый шот должен содержать:
- Чёткий субъект с теми же деталями внешности, что и в остальных шотах
- Действие/событие шота
- Описание камеры (опционально, но рекомендуется)

**Пример мульти-шот промпта (3 шота):**
```
Shot 1: A young courier in a red parka runs across a rain-slicked Tokyo crosswalk at night.
Wide shot, tracking camera follows from the side at ground level.

Shot 2: The courier pushes through a glass convenience store door, neon light floods in.
Medium shot, camera holds static as she enters, bokeh background.

Shot 3: She places a small package on the counter and exhales with relief.
Close-up on hands and package, slow dolly backward.
```

### Что подтверждено:
- ✅ Длинные промпты поддерживают «continuous storytelling» — не нужно резать на отдельные генерации
- ✅ Официальная документация Kling подтверждает указание движения камеры отдельно на каждый шот
- ⚠️ Лимит «6 шотов» — подтверждён несколькими сторонними источниками, но не официально

---

## 4. Движение камеры

Движение камеры описывается **естественным языком**, отдельно для каждого шота.

### Подтверждённые рабочие дескрипторы ⚠️

```
Движение по оси Z:
  slow dolly backward       — медленно удаляется
  dolly in                  — приближается к субъекту
  push in                   — вталкивается в сцену

Слежение:
  smooth lateral tracking   — плавное боковое сопровождение
  camera follows the subject — камера следует за субъектом

Специальные:
  macro slow motion         — макро-режим + замедление
  camera holds static       — статичная камера
  handheld shaky            — ручная дрожащая камера
```

### Типы кадров (классические кинематографические термины)
```
extreme wide shot (EWS)   — панорамный, устанавливает обстановку
wide shot (WS)            — весь персонаж, окружение видно
medium shot (MS)          — пояс и выше
close-up (CU)             — лицо / деталь
extreme close-up (ECU)    — деталь крупным планом
over-the-shoulder (OTS)   — из-за плеча
```

### Угол камеры
```
eye level         — на уровне глаз (нейтральный)
low angle         — снизу вверх (монументальность, угроза)
high angle        — сверху вниз (уязвимость)
bird's eye / top-down — вид сверху
dutch angle       — наклонная камера (дезориентация)
```

> ❌ Опровергнуто: формальный перечень «поддерживаемых ключевых слов» (push-in, orbit, pan, как отдельные команды) — не подтверждён. Используйте описательный язык, а не технические теги.

---

## 5. Консистентность персонажей

Это самая задокументированная и надёжная часть системы Kling 3.0 Omni.

### Elements 3.0 ✅

Официальная функция для закрепления внешности персонажа:

- Загрузите до **4 изображений** на одного персонажа
- 1 главное + до 3 дополнительных (рекомендуется: фронт, профиль, 3/4)
- Система блокирует внешность и переносит её в видео

**Практика:**
```
Оптимальный набор референсов:
  ref_1: фронтальный портрет (нейтральный фон)
  ref_2: профиль (левый или правый)
  ref_3: 3/4 поворот
  ref_4: специфическая деталь (одежда, аксессуар, причёска)
```

### Синтаксис @ ✅

В UI-интерфейсе ссылайтесь на загруженных персонажей через `@`:

```
@Grace stands at the window, looking out at the city.
@Image provides the background lighting style.
@Samoyed runs through the park, ears flying.
```

Несколько персонажей в одной сцене:
```
@Anna and @Marco face each other across the diner table, both looking tense.
```

**API-нотация:** `<<<element_1>>>`, `<<<element_2>>>` и т.д.

> ✅ Подтверждено двумя официальными страницами документации Kling.ai и официальным постом о синтаксисе промптов.

---

## 6. Освещение и атмосфера

Официальных рекомендаций по освещению нет, но эти дескрипторы соответствуют стандартному поведению видео-моделей:

### Тайминг/естественный свет
```
golden hour           — мягкий тёплый свет заката
blue hour             — сумерки, холодный синеватый свет
overcast diffused     — рассеянное облачное освещение
harsh midday sun      — резкий полуденный свет, жёсткие тени
```

### Студийное / направленное
```
rembrandt lighting    — одна боковая точка, треугольная тень на щеке
rim / backlit         — контровый свет, силуэт
motivated lighting    — свет из видимого источника (лампа, окно)
practicals in frame   — видимые источники света создают атмосферу
```

### Спецэффекты атмосферы
```
volumetric fog        — объёмный туман с лучами
neon-lit              — неоновое освещение (киберпанк)
candlelit             — мерцающий свечной свет
firelight             — свет костра / камина
```

> ⚠️ Эти термины не верифицированы на Kling 3.0 Omni специально. Используйте как стандартный кинематографический словарь.

---

## 7. Стиль и эстетика

### Кинематографические стили
```
cinematic 35mm film grain           — зернистость плёнки
anamorphic lens flares              — блики анаморфного объектива
shallow depth of field              — малая глубина резкости
tilt-shift miniature                — эффект миниатюры
hyperrealistic                      — фотореализм
```

### Анимационные стили
```
Studio Ghibli aesthetic             — студия Гибли
cel animation                       — рисованная анимация
stop-motion                         — покадровая анимация
claymation                          — пластилиновая анимация
```

### Временные эпохи / жанры
```
1970s Super 8 home video            — домашняя видеозапись 70-х
noir black and white                — нуар, чёрно-белый
vaporwave aesthetic                 — вейпорвейв
brutalist architecture              — брутализм
```

---

## 8. Физика и движение

Kling 3.0 Omni известен улучшенной физикой. Описывайте физику через результат, а не технические параметры:

```
Хорошо:
  "fabric ripples naturally as she runs"
  "water splashes realistically from each footstep"
  "hair moves in slow motion with the wind"
  "steam rises gently from the coffee cup"

Избегайте:
  "motion intensity 1.5"  ← опровергнуто
  "physics level high"    ← не работает
```

### Работа со временем
```
slow motion               — замедление
time-lapse                — ускоренная съёмка
freeze frame moment       — стоп-кадр
real-time                 — реальное время
```

---

## 9. Практические примеры готовых промптов

### Пример 1: Портретный шот (1 шот)
```
An elderly Japanese fisherman in a faded indigo yukata sits cross-legged on a wooden dock at dusk.
Medium close-up, static camera. He slowly mends a fishing net, nimble fingers moving with practiced ease.
Warm golden-hour backlight, volumetric haze over the water. Cinematic 35mm grain.
Keep the yukata's specific indigo pattern consistent.
```

### Пример 2: Экшн с консистентным персонажем (2 шота)
```
Shot 1: @Mira sprints down a rain-soaked alley, leather jacket gleaming under sodium streetlights.
Wide shot, low-angle tracking alongside her. Wet cobblestones reflect neon signs overhead.

Shot 2: @Mira vaults over a chain-link fence in one fluid motion.
Side-on medium shot, camera holds position as she clears the fence.
Same leather jacket, same rain lighting throughout.
```

### Пример 3: Природная сцена (3 шота)
```
Shot 1: A lone wolf stands on a snow-covered ridge at dawn, breath misting in the cold air.
Extreme wide shot, static camera. Blue-grey light, no horizon detail.

Shot 2: The wolf turns its head sharply toward the treeline.
Medium close-up on the face, slow dolly in. Eyes catch the early light.

Shot 3: It leaps off the ridge and disappears into the forest below.
Wide shot, camera tilts down to follow the leap. Snow dust rises in its wake.
```

### Пример 4: Продуктовый / коммерческий (1 шот)
```
A luxury perfume bottle sits on a black marble surface.
Extreme close-up, very slow dolly backward. Golden liquid inside catches light dynamically.
Motivated rim lighting from the right, anamorphic lens flares on the glass edges.
Hyper-realistic, commercial photography aesthetic.
```

---

## 10. Что НЕ работает — опровергнутые мифы

Следующие советы широко распространены в блогах, но **не прошли верификацию**:

| Миф | Статус |
|---|---|
| Оптимальная длина промпта 80–150 слов | ❌ Опровергнуто |
| Шкала интенсивности движения 0–3 | ❌ Опровергнуто |
| Тайм-коды в формате `0-4s, 5-9s` | ❌ Опровергнуто |
| Формула «5 слоёв» или «7 элементов» | ❌ Опровергнуто |
| Специальный синтаксис для диалогов | ❌ Опровергнуто |
| Лечение «скольжения ног» через промпт | ❌ Опровергнуто |
| Формальный список ключевых слов камеры | ❌ Опровергнуто |

---

## 11. Открытые вопросы (нет надёжных данных)

Следующие темы не имеют верифицированной документации — используйте с осторожностью:

- **Соотношения сторон**: какие форматы официально поддерживаются? (16:9, 9:16, 1:1?)
- **Негативные промпты**: есть ли механизм, и если да — какой синтаксис?
- **Освещение**: какие конкретно термины модель надёжно распознаёт?
- **@ + Elements 3.0**: как они взаимодействуют одновременно? Есть ли приоритет?

---

## 12. Чеклист перед отправкой промпта

```
□ Субъект описан конкретно (внешность, одежда, деталь)
□ Действие / событие чётко сформулировано
□ Движение камеры указано (если нужно)
□ Для мульти-шота: каждый шот — отдельный абзац
□ Консистентность: одинаковые детали во всех шотах
□ Если есть референс: загружен через Elements 3.0, referenced через @
□ Стиль/эстетика добавлены в конце как constraint
□ Нет числовых параметров интенсивности — только описательный язык
```

---

## Источники

| Источник | Надёжность | Что взято |
|---|---|---|
| kling.ai/quickstart/klingai-element-library-3-user-guide | ✅ Официальный | Elements 3.0, лимиты референсов |
| kling.ai/quickstart/klingai-video-3-omni-model-user-guide | ✅ Официальный | @ синтаксис, мульти-шот |
| kling.ai/blog/kling-3-prompt-syntax-omni-reference-tags | ✅ Официальный | @ синтаксис, API нотация |
| ir.kuaishou.com (пресс-релиз, февраль 2026) | ✅ Официальный | 15-секундный лимит |
| blog.fal.ai/kling-3-0-prompting-guide/ | ⚠️ API-партнёр | Мульти-шот практики |
| wavespeed.ai/blog/posts/kling-3-0-omni-explained/ | ⚠️ Сообщество | Движение камеры |
| travisnicholson.medium.com | ⚠️ Сообщество | Constraint Sandwich |
| datacamp.com/tutorial/kling-3-0 | ⚠️ Вторичный | Консистентность персонажей |
