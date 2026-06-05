---
name: kling-prompt
description: >
  Generate a production-ready Kling 3.0 Omni video prompt from a scene description or idea.
  Use this skill whenever the user wants to create a video in Kling, describes a scene, shot,
  or multi-shot sequence — even if they don't mention Kling explicitly.
  Trigger when the user says "сделай промпт для клинга", "напиши промпт для видео",
  "create a Kling prompt", "write a video prompt", "помоги написать промпт для сцены",
  "generate a Kling scene", "как написать промпт для клинга", or describes a visual scene
  and asks for a ready-to-use prompt.
  Takes the scene description as args. If args are empty, ask the user to describe their scene.
disable-model-invocation: false
---

# Kling 3.0 Omni — Prompt Skill

Generate a production-ready Kling 3.0 Omni prompt from a scene description.

## Your process

1. **Read the args** — the user's scene description or intent.
2. **If critical info is missing**, ask ONE compact question covering: number of shots (1–6), named characters with reference images, and desired style/aesthetic. Skip if obvious from context.
3. **Build the prompt** using the rules below.
4. **Output**: the ready-to-paste prompt in a code block, followed by a brief note on any choices made.

---

## Structure: Constraint Sandwich (one per shot)

```
[Subject Anchor]   — who/what is in frame, specific details (clothing, appearance, props)
[Shot + Action]    — framing type + what happens
[Constraints]      — what must stay consistent (details, lighting, style)
```

For **multi-shot**: one paragraph per shot, separated by blank lines. Label as `Shot 1:`, `Shot 2:`, etc.

---

## Rules

**DO:**
- Describe physics/motion as outcome: `"fabric ripples as she runs"`, `"steam rises from the cup"`
- Use cinematic language for camera: `slow dolly backward`, `smooth lateral tracking`, `handheld shaky`, `camera holds static`, `dolly in`, `push in`
- Use standard shot sizes: `extreme wide shot`, `wide shot`, `medium shot`, `close-up`, `extreme close-up`, `over-the-shoulder`
- Use standard angles: `eye level`, `low angle`, `high angle`, `bird's eye`, `dutch angle`
- Reference characters via `@Name` (UI) or `<<<element_1>>>` (API) — only when user has uploaded reference images
- Keep consistent character details across all shots (same clothing, hair, accessories)
- Add style/aesthetic as a closing constraint: `cinematic 35mm grain`, `anamorphic lens flares`, `shallow depth of field`, `Studio Ghibli aesthetic`, `hyperrealistic`

**DON'T:**
- No numeric intensity scales: ~~`motion intensity 1.5`~~, ~~`physics level high`~~
- No timecodes: ~~`0-4s:`~~, ~~`5-9s:`~~
- No formal keyword lists for camera: ~~`[pan]`~~, ~~`[orbit]`~~
- No 5-layer or 7-element formulas
- No dialogue syntax (not supported)

---

## Camera vocabulary

**Motion:**
`slow dolly backward` · `dolly in` · `push in` · `smooth lateral tracking` · `camera follows the subject` · `macro slow motion` · `camera holds static` · `handheld shaky`

**Shot size:**
`extreme wide shot (EWS)` · `wide shot (WS)` · `medium shot (MS)` · `close-up (CU)` · `extreme close-up (ECU)` · `over-the-shoulder (OTS)`

**Angle:**
`eye level` · `low angle` · `high angle` · `bird's eye / top-down` · `dutch angle`

---

## Lighting vocabulary

**Natural:** `golden hour` · `blue hour` · `overcast diffused` · `harsh midday sun`

**Studio:** `rembrandt lighting` · `rim / backlit` · `motivated lighting` · `practicals in frame`

**Atmosphere:** `volumetric fog` · `neon-lit` · `candlelit` · `firelight`

---

## Style vocabulary

**Cinematic:** `cinematic 35mm film grain` · `anamorphic lens flares` · `shallow depth of field` · `tilt-shift miniature` · `hyperrealistic`

**Animation:** `Studio Ghibli aesthetic` · `cel animation` · `stop-motion` · `claymation`

**Era/genre:** `1970s Super 8 home video` · `noir black and white` · `vaporwave aesthetic`

---

## Pre-output checklist

Before writing the final prompt, verify:
- [ ] Subject described concretely (appearance, clothing, specific detail)
- [ ] Action/event clearly stated
- [ ] Camera motion specified
- [ ] Multi-shot: each shot is its own paragraph
- [ ] Consistent details named across shots
- [ ] Characters referenced via `@Name` only if user has Elements 3.0 references loaded
- [ ] Style/aesthetic added as closing constraint
- [ ] Zero numeric intensity parameters

---

## Examples

**Single shot:**
```
An elderly Japanese fisherman in a faded indigo yukata sits cross-legged on a wooden dock at dusk.
Medium close-up, static camera. He slowly mends a fishing net, nimble fingers moving with practiced ease.
Warm golden-hour backlight, volumetric haze over the water. Cinematic 35mm grain.
Keep the yukata's specific indigo pattern consistent.
```

**Two-shot with character reference:**
```
Shot 1: @Mira sprints down a rain-soaked alley, leather jacket gleaming under sodium streetlights.
Wide shot, low-angle tracking alongside her. Wet cobblestones reflect neon signs overhead.

Shot 2: @Mira vaults over a chain-link fence in one fluid motion.
Side-on medium shot, camera holds position as she clears the fence.
Same leather jacket, same rain lighting throughout.
```

**Product/commercial:**
```
A luxury perfume bottle sits on a black marble surface.
Extreme close-up, very slow dolly backward. Golden liquid inside catches light dynamically.
Motivated rim lighting from the right, anamorphic lens flares on the glass edges.
Hyper-realistic, commercial photography aesthetic.
```
