# Seedance 2.5 — промпт

Видео до 30 секунд одним проходом, 4K, со звуком. До 50 референсов:
30 картинок, 10 видео, 10 аудио. Официальный мануал ByteDance, июль 2026.

## Формула из шести слотов, обязательны первые два

```
1. Субъект + действие      кто что делает
2. Сцена и окружение       место, время, погода
3. Визуальный стиль        свет, цвет, материал, настроение
4. Камера или монтаж       крупность, движение, фокус, склейки
5. Звук                    реплики, фон, эффекты, музыка
```

Два-три предложения — норма. Заполняй только нужные слоты.
Разрешение, длительность и пропорции — в настройках генерации, не в промпте.

## Референсы: у каждого файла — роль

```
@image1 supplies <BAKER>'s features, hair and flour-dusted grey apron. Do not take the background.
@video1 supplies the box-opening motion only.
```

Правило: после загрузки скажи, что каждый ассет даёт, и что из него **не** брать,
если фон или композиция могут просочиться. Несколько ракурсов одного объекта —
скажи об этом явно.

## 30 секунд — по стадиям

```
[STAGE ONE] Opens with: <initial state>. Main event: <one action>. Ends with: <visible state>.
[STAGE TWO] Carried over: <what persists>. Main event: <one action>. Ends with: <state>.
```

Одно главное изменение на стадию. Тайминги: `0-8s` — бюджет времени,
не точка склейки; `at 5s` — событие; `three seconds after` — ожидание.
Сегменты не пересекаются.

## Звук — четыре вида скобок

| Скобки | Что | Пример |
|---|---|---|
| `( )` | музыка | `(calm piano plays underneath)` |
| `< >` | эффекты | `<a bell rings in the distance>` |
| `{ }` | реплика | `{Hello, welcome back}` |
| `【 】` | субтитр | `【Chapter One: Departure】` |

Реплика не на китайском — сначала назови язык: `She says softly in Japanese: {…}`.

## Правка готового видео

```
[EDIT GOAL] Edit @video1; across <range>, <add/remove/replace/adjust> <object>.
[SOURCE ROLE] @video1 is the sole editing master for people, scene, action, composition.
[PRESERVE] Keep identity, clothing, movement and sound as in @video1.
```

Пропорции и длительность при правке блокируются от исходника (±0,3 с).

## Чего модель не делает — девять пунктов из мануала

1. Таймкоды задают темп, а не точные склейки по кадру
2. Правки повышают вероятность совпадения, но не гарантируют покадровую точность
3. Много ассетов — выберет нужные, а не покажет все сразу
4. Субтитры, формулы, точный тайминг — только через подготовленные ассеты и постпродакшн
5. Правка видео: пропорции и длительность не настраиваются
6. Генерация от первого кадра: пропорции от картинки, длительность настраивается
7. Продление видео: пропорции от исходника, добавленная длина настраивается
8. Сборка фильма из картинок: порядок задавай явно
9. Бесшовные переходы — про непрерывность, не про пиксельную идентичность

## Пример

```
A luthier finishes a violin in a narrow workshop, lifting the body off the bench and setting it upright in the drying rack.
Late afternoon light rakes through fine sawdust; fresh varnish shows a deep amber, tools laid out in a worn leather roll.
The camera opens on a medium shot of the hands releasing the clamp, then pushes slowly in on the grain of the top plate, then cuts to the rack seen straight on.
<the scrape of the plane, the click of the clamp> (quiet room tone)
```

Источник: официальный мануал Seedance 2.5 в переводе dev.to/super_lewis, июль 2026.
