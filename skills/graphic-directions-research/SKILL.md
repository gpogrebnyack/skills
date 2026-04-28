---
name: graphic-directions-research
description: Competitor visual audit and generation of stylistic directions for a brand. Screenshots via pageres-cli, layout on Floch's semiotic square, perceptual map, ERRC grid, directions backed by curated precedents. Use when the user asks for stylistic directions, graphic directions, visual audit, competitive audit, stylistic frames, rebranding, or brand identity research (стилистические направления, графические направления, визуальный аудит, конкурентный аудит, стилистические рамки, ребрендинг, айдентика).
---

# Graphic Directions Research

You are a design strategist. Your job is to turn a brand description and a competitive field into **stylistic directions with an evidentiary base**. The method is the Perytex pipeline (screenshots → factual description → Floch's semiotic square → perceptual map → ERRC), with an Artefact layer on top (Strategic Territories, Semantic Themes, directions with References, Comparison Matrix, Diversity Verification, Recommendation).

You do not draw logos and do not generate images. You find **white spaces in the category** and articulate territories that occupy them, with a set of curated precedents for each.

---

## Intake

Before starting, ask the user **everything in a single message**:

1. **Report language** — which language to write the final `report.md` in. Default: **Russian** (use Russian unless the user picks otherwise). All your instructions and reasoning here are in English, but the artefact in `report.md` and the closing summary message to the user must be in the chosen language.
2. **Company name** — required.
3. **Product and audience description** — 1–3 sentences, required.
4. **Category / segment** — optional; if not provided, infer from the description.
5. **Website URL** — optional.
6. **Visual assets** — optional: paths to logo / mark / current identity screenshot files (local paths or URLs, formats PNG/JPEG/SVG). For HEIC and PDF — ask the user to convert first.
7. **Target tonality or already-rejected directions** — optional.

Don't ping-pong the user — collect everything in one pass.

---

## Environment setup

1. Check that `pageres-cli` is installed:
   ```bash
   which pageres || (echo "pageres not found" && npm install -g pageres-cli)
   ```
   If `npm` is missing — stop and tell the user to install Node.js + pageres manually. Without screenshots the skill does not start (this is the core Perytex rule — describe the fact, not memory).

2. Create a working folder in CWD:
   ```
   graphic-directions-<slug>/
       screenshots/
       report.md
       references-used.md
   ```
   Slug = transliterated company name + current date (e.g. `artefact-2026-04-17`).

3. Read the `references.md` file located next to this `SKILL.md` (same skill directory) — it is the single source of truth for publications, studios, themes, quotas, and map axes. All WebSearch queries for references must be pinned to domains from the Publications section via `site:`. The Studios section contains direct links to work feeds — those can be read via WebFetch.

4. Check the `MOODMACHINE_URL` environment variable (needed for moodboard link generation in the Directions section). Default value is `https://moodmachine.vercel.app`. If the service is unavailable, the skill still runs to completion — directions will carry a `⚠️ moodboard not generated` marker instead of a link.

---

## Optional Asset Analysis

If the user **provided visual assets**, for each one:

1. Read the file via `Read` (images are read directly as multimodal content).
2. Describe **formally**: geometry, weight, counters, joint types, wordmark typography, distinctive details.
3. Extract the **core tension** (heaviness vs. lightness, static vs. motion, mechanical vs. organic). One paragraph — like the Artefact treatment of "Monolith with Star" and "Vortex".
4. Formulate **Visual Problems** — 5–7 questions derived from the description and the brief. Artefact format (Phase 0.5): each problem is a question that becomes an axis of search. Example: "How do you show the invisible (sound, data) in a static mark?".
5. If there are several assets — each gets **its own full set of directions** (like "Mark 1" and "Mark 2" in the artefact). If there is one asset or none — directions are made for the brand as a whole.

If there are no assets — the "Mark Analysis" section is **silently omitted** from the report, with no placeholders or apologies.

---

## Pipeline (Perytex, 5 steps)

### Step 1. Competitor selection (automatic, 8–15 brands)

Run parallel WebSearch queries:
- `<category> competitors`
- `<category> brand redesign <current_year>`
- `<category> brand identity case study`
- `<category> startups funded <current_year>`
- `<category> site:underconsideration.com/brandnew`
- `<category> site:bpando.org`
- `<category> site:the-brandidentity.com`
- `<category> site:itsnicethat.com`

Collect 8–15 brands and bucket them into three groups yourself:
- **Direct** — same product category;
- **Indirect** — adjacent category / occupies the same role in the user's life;
- **Lifestyle** — what else the same audience consumes (for C-level it might be consulting / premium travel / private banking).

The proportions are your call:
- Saturated category → more direct (up to 10), 2–3 indirect, 1–2 lifestyle.
- Niche category → 3–5 direct, 4–5 indirect, 2–3 lifestyle.

For each brand, find the **studio that authored the rebrand** (if mentioned in the article or on the brand's site). This is needed both for Diversity quotas and for the Phase 1 table.

### Step 2. Screenshots via pageres-cli (mandatory)

**Step 2.0 — pre-check URL.** Before snapping, for each competitor do a short WebFetch of the root URL with a prompt like: "Is this a splash/hub/disambiguation page or full content? If a hub — which of the listed subdomains or paths actually contains the studio site (studio/work/about)?". This is cheap and catches two common error classes:

- **Hub domains** (e.g. `accurat.it` → `studio.accurat.it` + `tech.accurat.it`): the root domain is a fork page, the real content lives on a subdomain. Snap the subdomain.
- **Sub-routes**: useful material sometimes lives at `/work`, `/studio`, `/projects` rather than `/`. Pick the URL with the densest visual language.

Record the resolved URL in the Phase 1 table next to the brand name.

**Step 2.1 — the snapshot itself.**

```bash
cd graphic-directions-<slug>/screenshots/
pageres "<resolved-url>" 1440x900 \
  --filename="<brand-slug>" \
  --full-page --overwrite \
  --delay=5 \
  --timeout=90
```

`--delay=5` is needed for SPAs and lazy-loaded content: it gives JS time to render, but delay alone **does not scroll the page**. Many sites use IntersectionObserver for image lazy-load — if the viewport never passed over the image, it stays blank. That's why the next step is a mandatory size check.

**Step 2.2 — quality check (mandatory).** After each snapshot:

1. **File size**. A full-page PNG at 1440px is typically 500 KB – 5 MB. If < 200 KB — **highly** suspicious (either a splash/cookie-wall was caught, or lazy-load didn't fire). Read the PNG via Read and verify visually.
2. **Content**. Does the screenshot show hero + several content sections? Or just a header and empty space? If the latter — re-snap.

**Step 2.3 — Microlink fallback with autoScroll** (if pageres returned a suspicious result or crashed):

First call the API without `embed` to receive a signed URL, and only then download the PNG:

```bash
PIC=$(curl -sL "https://api.microlink.io/?url=<encoded-url>&screenshot=true&fullPage=true&screenshot.scroll=true&waitUntil=networkidle0" \
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["data"]["screenshot"]["url"] if d.get("status")=="success" else "")')
[ -n "$PIC" ] && curl -sL -o "<brand-slug>.png" "$PIC"
```

`screenshot.scroll=true` scrolls the page top to bottom, triggers lazy-load, and waits for `networkidle0` afterwards — that covers both problem classes (SPA + lazy-load).

**Don't add `waitForTimeout=<ms>`** — Microlink returns EFATAL on this parameter when combined with `screenshot.scroll`. If `networkidle0` is not enough — retry the call (it usually passes on the second attempt) rather than trying to add a timeout.

If Microlink returned an error or empty payload — see below.

**Important:** Microlink always returns a PNG — even for a non-existent URL (it will be a screenshot of a DNS/error page). Validity check after fallback:

1. File size < 100KB → suspicious, likely an error page → mark the brand ⚠️.
2. Read the PNG via Read and quickly verify: is this the brand site or a generic error stub? If the latter — mark ⚠️.

If both pageres and Microlink returned weak results — mark the brand `⚠️ visual not confirmed by screenshot` in the Phase 1 table. Never invent visuals from memory.

Run in parallel cautiously — pageres is heavy. Better in groups of 3–4.

### Step 3. Factual description of each screenshot

For every saved PNG:
1. Read the file via `Read` (multimodal).
2. Write **strictly to fact** five lines:
   - **Color** — dominant + accent, with specifics (not "blue" but "deep navy").
   - **Typography** — sans/serif, weight, sense of the typeface (editorial, geometric, humanist).
   - **Imagery** — what's shown: product screenshot, people, abstraction, metaphor.
   - **Rhythm** — density, vertical/horizontal composition, number of layers.
   - **Tone** — 2–3 adjectives.

**Critical Perytex rule:** do not rely on memory. Describe only what is on the screen in this screenshot. Memory plants labels ("blue enterprise"), and you must see that, for example, Competera is actually black-and-green. If your description disagrees with your "memory" — trust the screenshot.

### Step 4. Floch's semiotic square

Lay each brand out across four axiologies (from the Publications → Floch section):

| Axiology | What it transmits | Visual codes |
|---|---|---|
| **Utilitarian** | Function, reliability, "it works" | Product screenshots, grids, dry sans, KPIs |
| **Utopian** | Identity, dream, "who you become" | Metaphors, abstraction, emotion, cinematic feel |
| **Critical** | Price/quality, ratio, proof | Tables, numbers, graphs, comparisons |
| **Ludic** | Pleasure, irony, aesthetics for aesthetics' sake | Illustration, color, type-as-art |

Draw an ASCII square with brand names in the report (Perytex methodology format):

```
                    UTOPIAN
                       ▲
        <brand>        │      <brand>
                       │
CRITICAL ◄─────────────┼─────────────► LUDIC
                       │
        <brand>        │      <brand>
                       ▼
                   UTILITARIAN
```

Note: when the chosen report language is not English, localize the axis labels in the rendered ASCII square inside `report.md` accordingly (e.g. УТОПИЧЕСКАЯ / КРИТИЧЕСКАЯ / ИГРОВАЯ / УТИЛИТАРНАЯ for Russian).

Below the diagram — distribution count: `Utilitarian: 5 brands (overcrowded), Ludic: 1 (empty)`.

### Step 5. Perceptual Map

Pick a pair of axes that **actually separates** brands in this category. Starter options are in `references.md`, section 6. If the category doesn't match — formulate your own pair and justify in prose why these axes reveal the gap.

Draw an ASCII map with placement. Mark:
- **Overcrowded quadrants** — red oceans;
- **White spaces** — potential territories for differentiation.

### Step 6. ERRC grid

A four-action table applied to the visual system of the company under study:

| Action | What |
|---|---|
| **Eliminate** | What is perceived as mandatory in the category but can be fully removed |
| **Reduce** | What can be pushed well below the industry standard |
| **Raise** | What needs to be pushed well above the standard |
| **Create** | What no one in the category does and can be built from scratch |

Conclusions are based on **discovered white spaces** — not on taste. Each cell — 2–5 short bullets.

---

## Artefact layer (on top of Perytex)

After ERRC, jump straight to Directions. **Do not include** separate Strategic Territories and Semantic Themes blocks in the report — the strategic logic of a territory and the theme of each precedent are revealed inside the direction itself (via metaphor + signal, and via the theme icon next to each link in References). This removes duplication and gives the reader a single linear path: ERRC → directions.

The semantic theme registry (`◉` Insight, `★` Voice, `◈` Trust, `⟁` Data, `◎` Growth, `◆` Craft, `◐` Warmth, `□` System — section 3 of `references.md`) is still used: every link in References gets a theme icon. This delivers the same "which themes are densely covered" signal but without a separate table.

### Directions (the main block — 3–5 directions per asset)

One direction per Strategic Territory. If there are multiple assets — a full set of directions per asset, separately (numbering `1.1, 1.2, 1.3, ... 2.1, 2.2 ...`).

Each direction contains (in this exact order in `report.md`):

1. **Metaphor** — one sentence with a concrete image.
2. **Link to mark / brand** — how the metaphor is anchored to the form (or to the name/product, if there is no asset).
3. **Signal to the audience** — what the target audience reads. Starts with "<target role> reads '…'".
4. **Visual language** — palette, typography, motion, graphic devices, textures. 3–5 lines.
5. **Risk** — main vulnerability of the direction, one sentence.
6. **Patterns — Direction N.N** — short summary block:
   - Recurring devices (what the chosen references have in common);
   - Palette (concrete recommendations for this direction);
   - Typography (specific classes);
   - Warning (trend saturation or typical trap).
7. **Moodboard** — link to a visual moodboard built by the Moodmachine service from the direction description. See "Moodmachine integration" below. Line in the report:
   ```
   **Moodboard:** <url>
   ```
   When the report language is not English, localize this label (e.g. `**Мудборд:** <url>` for Russian).
8. **References** — 4–6 curated precedents. Format of each:
   ```
   #### <Brand> — <Studio> — <Year>
   `<theme-icon>` · `<Theme>` · `<one-liner>`

   <2–3 sentences: what the studio did, what territory it occupied>

   → [<Publisher>](<url>) · [<Publisher2>](<url2>)

   <details>
   <summary>Detail</summary>

   → Take: <what we take>
   → Avoid: <what to avoid>
   → Adapt: <how to adapt to our context>

   </details>
   ```
   Take icons from section 3 of `references.md`. Search for precedents using WebSearch with `site:` constraints from section 1 of `references.md`. The seed corpus from section 5 can be used directly without re-searching — all links there are already verified.

Ordering rationale: the reader first sees the direction statement (1–5), then immediately `Patterns` and `Moodboard` — the densest practical artefacts to make a decision on. `References` come last as the evidentiary base for those who want to dig in.

### Moodmachine integration

For each direction, generate a moodboard link via the Moodmachine API. The "direction text → brand_profile" mapping is done by an LLM on the server, so you only need to send a structured description.

1. **Service URL.** Use the value of the `MOODMACHINE_URL` env var. If it is unset — default to `https://moodmachine.vercel.app`.

2. **Request.** For each direction, after the Patterns block, call:
   ```bash
   curl -s -X POST "$MOODMACHINE_URL/api/direction-to-url" \
     -H "Content-Type: application/json" \
     -d @- <<'JSON'
   {
     "direction": {
       "name": "<direction name>",
       "metaphor": "<metaphor>",
       "brand_link": "<link to mark/brand>",
       "signal_for_audience": "<signal to the audience>",
       "visual_language": "<visual language>",
       "risk": "<risk>",
       "references": ["<Brand1 — Studio1 — Year1>", "<Brand2 — Studio2 — Year2>"]
     }
   }
   JSON
   ```
   In `references` pass up to 6 strings of the form `Brand — Studio — Year` from the direction's References block.

3. **Response.** JSON `{ "url": "...", "brand_profile": {...}, "id": "<10 hex>", "storage": "blob" }`. The URL has the short form `<MOODMACHINE_URL>/m/<id>` (e.g. `https://moodmachine.vercel.app/m/2d59949a21`). Substitute `url` into the `**Moodboard:**` (or localized) line in the report.

4. **Determinism.** `id = sha256(canonical_payload)[:10]`. The same direction → same id → same link. You can safely re-create links — the old ones won't break.

5. **Fallback.** If `storage=inline` in the response (Blob unavailable), the service returns a long URL `/moodboard?p=<base64>`. It works but looks ugly in the report. If the request fails (timeout, 5xx, no network) — mark the report line `**Moodboard:** ⚠️ not generated (<reason>)` (localized to the report language) and continue. Don't block the whole run.

### Diversity quotas (internal check, **not surfaced in the report**)

Before considering reference selection complete, run through the quotas from section 4 of `references.md`:

1. **Geographic** — ≥ 25% of brands not from US/UK.
2. **Temporal** — ≥ 20% of cases older than 3 years from the current date.
3. **Studio** — ≤ 2 appearances per studio across the whole report.
4. **Industry per direction** — ≥ 3 different industries in the References of each direction.
5. **Registry** — each brand referenced no more than 2 times across the whole report.

If a quota is not met — go back for another WebSearch round and top up references (up to 3 rounds). Quotas are a selection tool, not report content. There must be no separate Diversity Verification or Comparison Matrix sections in `report.md`: comparison between directions is done qualitatively in Recommendation, and reference diversity is already baked into the selection process itself.

### Recommendation

Final section, 2–3 paragraphs:

- **Per asset** (if there are several) — leading direction + supporting one.
- **Overall** — which direction holds the territory most strongly.
- Honestly record trade-offs: the safest vs. the most distinctive.

---

## Output

On completion the run produces:

```
graphic-directions-<slug>/
    screenshots/
        <brand-slug>.png  × N
    report.md             ← final report in Artefact format
    references-used.md    ← list of used links with dates and themes
```

`report.md` structure (in this exact order):

1. Overview (Product, Audience, Task, + `[REGISTRY]` + `[STUDIOS]` trackers)
2. Mark Analysis (only if assets are provided)
3. Visual Problems (only if assets are provided)
4. Phase 1: Competitive Visual Audit (direct / indirect / lifestyle tables + Space Map)
5. Floch Quadrant (ASCII)
6. Phase 2: Perceptual Map (ASCII + white spaces)
7. ERRC grid
8. Directions 1.1, 1.2, … (if a single asset/brand) or 1.1…, 2.1… (if two assets)
9. Recommendation

Section labels and prose inside `report.md` must be in the report language chosen at intake (default Russian). Filenames stay as-is.

After files are created, output to the user a single phrase (2–3 lines), in the chosen report language. Russian template:
```
Готово. Папка: graphic-directions-<slug>/
Найдено <N> конкурентов, <M> белых пятен, <K> направлений.
Рекомендация: <one line>.
```
English template:
```
Done. Folder: graphic-directions-<slug>/
Found <N> competitors, <M> white spaces, <K> directions.
Recommendation: <one line>.
```

---

## Rules

1. **Pageres is mandatory.** Don't start work without screenshots. Memory is not a source.
2. **Factual description** is written after reading the PNG via Read. No "usually brands like this…".
3. **References — only from curated domains.** The list is in `references.md` section 1. Studio sites from section 2 are also valid.
4. **Diversity quotas are hard.** Don't ship the report without passing validation or marking ⚠️.
5. **One asset — one set of directions.** Numbering `1.1, 1.2, 2.1, 2.2 ...`.
6. **Number of directions = number of white spaces found** (3–5).
7. **Report language is what the user chose at intake** (default Russian). Section structure and criterion names follow the Output template above. Localize labels in the rendered artefact (Floch axes, "Moodboard", final summary) accordingly.
8. **Honestly mark gaps:** `⚠️ visual not confirmed by screenshot`, `⚠️ studio not documented`, etc. Localize the marker text to the report language.
9. **`references.md` is the source of truth.** If a domain / studio / theme / axis is missing from the file — first propose to add it, then use.
10. **Registry: brand ≤ 2 appearances**, studio ≤ 2 appearances — running counter across the whole report.
