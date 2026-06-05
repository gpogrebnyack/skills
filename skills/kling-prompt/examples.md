# Промпт: цельное видео 5 секунд (два шота в одном запросе)

## Настройки в Kling

| Параметр | Значение |
|---|---|
| Режим | Image to Video, Custom Multi-Shot |
| Стартовый кадр | `b.png` |
| Финальный кадр | `Frame 105.png` |
| Элемент (Elements 3.0) | `image.png` → назвать `device` |
| Длительность | 5 секунд |
| Формат | 9:16 вертикальный |

---

## Промпт

A pure deep green void. A matte dark green mannequin wearing @device — a brushed silver capsule pendant on a black cord — exists within it, invisible: its surface identical to the background, its presence undetectable. It begins to rotate around its vertical axis. As it turns, the silver metal face of the pendant finds the ambient light first — a single clean glint separating from the green, the first sign of life in the frame. The mannequin form gradually reads as three-dimensional through the soft play of shadow on its matte surface as the rotation continues, but the eye stays on the device.

The camera begins to move — a slow pull that builds with quiet inevitability, accelerating as it commits toward the pendant. The mannequin keeps rotating. Both movements — the spin and the push — converge on the same destination, tightening the world down to the device alone. The camera arrives: pendant filling the frame at a slight three-quarter angle. At that exact moment the arc LED at the top of @device ignites — a clean green glow blooms from nothing to full brightness in one smooth pulse, like a heartbeat starting. Then everything stops. The camera holds perfectly still, the mannequin holds perfectly still, the LED glows steadily — a beat of complete stillness after all the motion, letting the lit device breathe.

Vertical 9:16. Soft diffused studio ambient light throughout, no dramatic sources. Four seconds of motion building to arrival, the final second belonging entirely to the glowing LED — still, close, alive. No cuts.

---

## Логика

- Одна история, не два шота: ротация и камера — два движения одного нарратива
- Динамика нарастает: ротация начинается медленно → камера подхватывает и ускоряется → LED как финальный удар
- «First sign of life in the frame» — устройство появляется раньше манекена, нарративный приоритет
- «Quiet inevitability» / «tightening the world down to the device» — кинематографический язык вместо технического
- LED привязан к «exact moment» прихода камеры — кульминация, не случайный момент
- «No cuts» — явный запрет на монтажную склейку

---

---

# Промпт: проявление манекена из фона (отдельно, 3 сек)

## Настройки в Kling

| Параметр | Значение |
|---|---|
| Режим | Image to Video |
| Стартовый кадр | `b.png` |
| Финальный кадр | `Frame 104.png` |
| Элемент (Elements 3.0) | `image.png` → назвать `device` |
| Длительность | 3 секунды |
| Формат | 9:16 вертикальный |

---

## Промпт (v3 — форма всегда в кадре, свет её раскрывает)

A matte dark green mannequin bust wearing @device — a brushed silver rounded-capsule pendant on a thin black cord — centered against a perfectly matching deep green background. The mannequin surface and the background are identical in color. The mannequin is always present in the frame — it is never absent, never fades in, never appears from nothing. It is simply invisible at first because light has not yet found its surface.

The mannequin rotates slowly around its vertical axis throughout the entire shot. The lighting is soft, diffused, and even — a standard studio ambient setup with no dramatic sources, matching exactly the lighting of the final frame. At the very start, the mannequin's matte green surface blends entirely into the background: the rotation angle shows no form-revealing shadows yet. As the rotation continues at the same slow pace, the 3D curvature of the torso begins to catch the soft ambient light slightly differently from the background plane — the subtlest shadow appears in the collarbone hollow, a barely-perceptible lighter tone traces the shoulder curve. The @device pendant, being brushed silver metal rather than matte green, naturally reflects the ambient light more visibly than the mannequin surface — a quiet metallic glint that draws the eye to the product first. The mannequin form fills in around it, secondary and understated. The rotation is continuous and never stops within the shot.

Camera holds static, no movement. Vertical 9:16. Soft diffused studio ambient lighting throughout — no spotlights, no rim lights, no dramatic sources. The mannequin is revealed purely through the gentle shadow play of a rotating matte 3D form in even light. Extreme slow motion. Studio product photography aesthetic, clean and minimal.

---

## Логика

- Манекен не «появляется» — он всегда там, просто свет его не нашёл
- «Never absent, never fades in» — явный запрет на морф/fade между кадрами
- Свет **мягкий рассеянный ambient** — никаких спотов и рим-лайтов, которые Kling превращает в прожектор
- Форма манекена читается через **тонкие тени от вращения** в ровном свете, не через направленный источник
- Кулон привлекает внимание за счёт материала (металл vs матовый пластик), а не отдельного светового источника
- Ротация непрерывна до конца клипа

---

# Промпт: зум на устройство + включение светодиода

## Настройки в Kling

| Параметр | Значение |
|---|---|
| Режим | Image to Video |
| Стартовый кадр | `Frame 104.png` |
| Финальный кадр | `Frame 105.png` |
| Элемент (Elements 3.0) | `image.png` → назвать `device` |
| Длительность | 2 секунды |
| Формат | 9:16 вертикальный |

---

## Промпт

A dark green mannequin bust wearing @device — a brushed silver rounded-capsule pendant on a black cord — facing directly forward against a deep green background.

Two movements happen simultaneously throughout the shot. The camera glides in with a smooth eased dolly — slow at first, gently accelerating, then softly decelerating to rest in an extreme close-up on the pendant. At the same time, the mannequin slowly rotates around its vertical axis by approximately 15 degrees, so that by the final frame the pendant and chest are at a slight three-quarter angle rather than fully frontal. Both movements — the camera push and the mannequin rotation — move in the same unhurried rhythm, easing in together and settling together. The combination creates a sense of the camera circling into the subject rather than simply zooming. As both movements arrive at their final position, the small arc LED indicator at the top of the pendant illuminates — a clean soft green glow blooming smoothly from dark to full brightness, like a device waking up at the moment of arrival.

Camera: smooth dolly in, ease-in-ease-out, no shake. Vertical 9:16. Studio lighting maintained. The final frame is a tight close-up: pendant at a slight 3/4 angle, centered and large, green LED arc glowing, black cord visible at top, mannequin chest surface as background texture.

---

## Логика

- Два движения одновременно: долли камеры + поворот манекена ~15° — именно это видно между стартовым и финальным кадром
- «Move in the same unhurried rhythm, easing in together and settling together» — синхронизация изингов обоих движений
- «Camera circling into the subject» — описывает ощущение, а не механику, помогает модели понять намерение
- Светодиод загорается в момент «arrival» — привязан к завершению движения, не к произвольному моменту
- Финальный кадр прописан с деталью «3/4 angle» чтобы зафиксировать итоговый ракурс

---

# Промпт: живой человек → зум на устройство + LED (5 сек)

## Настройки в Kling

| Параметр | Значение |
|---|---|
| Режим | Image to Video, Custom Multi-Shot |
| Стартовый кадр | фото человека (полукадр, 3/4 поворот) |
| Финальный кадр | крупный план кулона с зелёным LED |
| Элемент (Elements 3.0) | референс устройства → назвать `device` |
| Длительность | 5 секунд |
| Формат | 9:16 вертикальный |

---

## Промпт

**[Subject Anchor]**
A young man with curly dark brown hair and round wire-frame glasses, wearing a light beige button-up shirt and a dark charcoal vest, stands in a three-quarter turn against a deep green background. Around his neck on a thin black cord hangs @device — a brushed silver rounded-capsule pendant with a soft white face and a hand-shaped emblem at center — resting at mid-chest, LED unlit. He breathes slowly and naturally: his chest rises and falls, his shoulders carry the ease of someone at rest, his curls shift slightly with each slow breath. He is not posed — he is simply present.

**[Shot + Action]**
Medium shot, slow dolly in. The camera moves toward him with quiet inevitability, easing gently into motion, then building as it commits to the pendant. His face rises out of the top of the frame as the world narrows. The dark vest fills the periphery. The black cord descends toward center. The brushed silver surface of @device catches the soft ambient light, the hand emblem growing legible. As the camera arrives at extreme close-up on the pendant — centered, at a slight three-quarter angle — the arc LED at the top of @device blooms: a clean green glow rising smoothly from nothing to full brightness in one unhurried pulse. The camera holds.

**[Constraints]**
Vertical 9:16. Soft diffused studio ambient lighting throughout — no dramatic sources, no spotlights, consistent with both frames. No cuts. The man breathes and carries micro-movement throughout but does not gesture, turn, or perform — the motion belongs to the camera, the life belongs to him. Keep @device's brushed silver surface, white face, and hand emblem consistent.

---

## Логика

- **Человек не в Elements** — стартовый кадр уже фиксирует его внешность; Image to Video режим держит консистентность через стартовый кадр, отдельный Element избыточен
- **Constraint Sandwich** — промпт разбит на три явных слоя: кто в кадре → что происходит → что неизменно
- **Физика через результат** (раздел 8 гайда) — «his curls shift slightly with each slow breath» — конкретное физическое следствие дыхания, а не абстрактное «живой»
- **«The motion belongs to the camera, the life belongs to him»** — разграничение: человек не анимируется активно, но и не замораживается
- **Дыхание + микродвижения** — описаны в Subject Anchor, закреплены в Constraints как разрешённый диапазон движения
- **«dolly in»** — подтверждённый дескриптор движения камеры (раздел 4 гайда)
- **LED привязан к приходу камеры** — кульминация в момент «arrives at extreme close-up», не раньше
