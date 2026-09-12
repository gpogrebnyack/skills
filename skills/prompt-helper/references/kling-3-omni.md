# Kling 3.0 Omni — промпт

Видео до 4K/60fps, до 6 склеек в одной генерации. Персонажи по референсам:
`@Name` в интерфейсе, `<<<element_1>>>` в API.

## Структура: один абзац на кадр

```
[Subject]      кто/что в кадре, конкретно: одежда, внешность, реквизит
[Shot+Action]  крупность + что происходит
[Constraints]  что не меняется: детали, свет, стиль
```

Мультишот — по абзацу на кадр, `Shot 1:`, `Shot 2:`, через пустую строку.

## Делай

- Движение и физику — как результат: `fabric ripples as she runs`, `steam rises from the cup`
- Камера — киноязыком: `slow dolly backward`, `smooth lateral tracking`, `handheld shaky`, `camera holds static`, `push in`
- Крупность: `extreme wide shot`, `wide shot`, `medium shot`, `close-up`, `extreme close-up`, `over-the-shoulder`
- Ракурс: `eye level`, `low angle`, `high angle`, `bird's eye`, `dutch angle`
- Одни и те же детали персонажа во всех кадрах
- Стиль — последним ограничением: `cinematic 35mm grain`, `anamorphic lens flares`, `shallow depth of field`, `Studio Ghibli aesthetic`, `hyperrealistic`

## Не делай

- Числовые шкалы: ~~`motion intensity 1.5`~~
- Таймкоды: ~~`0-4s:`~~ — у Kling их нет, это Seedance
- Ключевые слова в скобках: ~~`[pan]`~~, ~~`[orbit]`~~
- Формулы «7 элементов»
- Реплики персонажей — диалоги не поддерживаются

## Словарь

**Свет.** Natural: `golden hour` · `blue hour` · `overcast diffused` · `harsh midday sun`.
Studio: `rembrandt lighting` · `rim / backlit` · `motivated lighting` · `practicals in frame`.
Atmosphere: `volumetric fog` · `neon-lit` · `candlelit` · `firelight`.

**Стиль.** Cinematic: `35mm film grain` · `anamorphic flares` · `tilt-shift miniature`.
Animation: `cel animation` · `stop-motion` · `claymation`.
Era: `1970s Super 8` · `noir black and white` · `vaporwave`.

## Перед выдачей

- [ ] Субъект описан конкретно
- [ ] Действие названо
- [ ] Движение камеры задано
- [ ] Мультишот — по абзацу на кадр, детали совпадают
- [ ] `@Name` только если референсы загружены
- [ ] Стиль в конце
- [ ] Ни одного числового параметра

## Примеры

```
An elderly Japanese fisherman in a faded indigo yukata sits cross-legged on a wooden dock at dusk.
Medium close-up, static camera. He slowly mends a fishing net, nimble fingers moving with practiced ease.
Warm golden-hour backlight, volumetric haze over the water. Cinematic 35mm grain.
Keep the yukata's specific indigo pattern consistent.
```

```
Shot 1: @Mira sprints down a rain-soaked alley, leather jacket gleaming under sodium streetlights.
Wide shot, low-angle tracking alongside her. Wet cobblestones reflect neon signs overhead.

Shot 2: @Mira vaults over a chain-link fence in one fluid motion.
Side-on medium shot, camera holds position as she clears the fence.
Same leather jacket, same rain lighting throughout.
```

Источник: практика автора на Kling 3.0 Omni, февраль–июнь 2026.
