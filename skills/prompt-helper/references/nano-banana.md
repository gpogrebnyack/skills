# Nano Banana 2 и Pro — промпт

Семейство Gemini Image. Один гайд по промптингу на всех, разница в возможностях:

| Модель | ID | Разрешение | Референсов | Для чего |
|---|---|---|---|---|
| Nano Banana 2 | `gemini-3.1-flash-image` | 512px, 1K, 2K, 4K | до 10 | рабочая лошадка, по умолчанию |
| Nano Banana Pro | `gemini-3-pro-image` | до 4K | до 6 | сложные композиции, точный текст, Thinking |
| Nano Banana 2 Lite | `gemini-3.1-flash-lite-image` | только 1K | до 14 | быстро и дёшево, без поиска |

Официальный принцип: **описывай сцену, а не перечисляй ключевые слова.**

## Генерация — порядок важен, первое влияет сильнее

```
1. Субъект        кто/что, количество, материал, черты
2. Действие       что происходит, поза
3. Место          где, время суток, погода
4. Медиум         фото, иллюстрация, акварель, 3D
5. Камера         крупность, угол, объектив
6. Свет и цвет    качество, направление, палитра
7. Ограничения    чего не должно быть
```

## Шаблоны Google

**Фотореализм.** `A photorealistic [shot type] of a [subject] in a [setting]. [Lighting]. Shot from a [camera angle] with a [lens type].`

**Иллюстрация, стикер.** `A [style] of a [subject with details]. The design features [visual qualities] and [color/background].`

**Текст в картинке.** `Create a [image type] for [brand] with the text '[exact text]' in a [font style]. [Style], [color scheme].` Для точного текста — Pro.

**Продуктовая съёмка.** `A high-resolution, studio-lit product photograph of a [product] on a [background]. The lighting is a [setup] to [purpose]. The camera angle is [angle] to showcase [feature]. Ultra-realistic, sharp focus on [detail].`

**Минимализм, место под текст.** `A minimalist composition featuring a single [subject] positioned in the [location]. The background is a vast, empty [color] canvas, creating significant negative space. Soft, subtle lighting.`

**Комикс, сториборд.** `Make a [N] panel comic in a [style]. Put the character in a [scene].`

## Редактирование — сначала что сохранить, потом что менять

```
Keep [что нельзя трогать].
Change [что меняем] to [на что].
Do not change anything else.
```

Модель понимает семантическую маску без рисования. При замене объекта по
референсу может «нормализовать» его к канонической версии — нестандартные
детали проговаривай.

## Что работает и что нет

- Цвет hex-кодом — ненадёжно. Словами (`deep forest green`) — лучше. Референс-картинкой — надёжнее всего.
- Негатив «no cars» — слабо. Позитивная формулировка `empty street` — лучше.
- Мелкий текст — плывёт. Крупный, в кавычках, с указанием шрифта — держится, особенно на Pro.
- Персонаж без референса непостоянен. Нужна консистентность — загружай референс и говори, что из него брать: `Use the attached photo for the face and hair only.`
- Thinking у Pro тянет к реализму: для намеренно абсурдных сцен может сгладить.

## Настройки вне промпта

`aspect_ratio`: 1:1, 3:2, 2:3, 16:9, 9:16, 4:3 и другие. `image_size`: `1K` (по умолчанию), `2K`, `4K` — буква заглавная.

Источник: ai.google.dev/gemini-api/docs/image-generation, раздел Prompting guide; заметки автора по Nano Banana Pro.
