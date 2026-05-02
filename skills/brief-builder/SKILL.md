---
name: brief-builder
description: >
  Decompose any raw user query into a structured brief using the УМКА framework
  (Setup, Role, Context, Algorithm). Use this skill whenever the user sends a vague,
  ambiguous, or complex request that would benefit from structured prompt engineering —
  even if they don't mention УМКА explicitly. Trigger when the user says
  "разложи по УМКА", "сделай промпт", "структурируй запрос", "build me a prompt",
  "decompose this", "помоги сформулировать", "write a brief", "structure this request",
  or simply pastes a messy brief and expects a clear output.
  Also trigger when the user asks to analyze, plan, write, or research something and the
  request is too loose to execute well without decomposition.
  Do NOT trigger for simple factual questions, translations, or fully specified tasks
  where all four dimensions are already obvious.
---

# Brief Builder

Decomposes raw user input into a four-block structured brief: **Setup** → **Role** → **Context** → **Algorithm**. The result is either executed directly or returned as a ready-made brief for the user.

Based on the УМКА framework (У — Установка, М — Модель, К — Контекст, А — Алгоритм).

## When to apply

Apply when at least one of these is true:
- The request is ambiguous (multiple valid interpretations)
- The request is complex (needs multi-step reasoning)
- The quality of the output depends heavily on framing (creative, analytical, or strategic tasks)
- The user explicitly asks for prompt or brief decomposition

Skip when:
- The answer is a single fact ("What's the capital of France?")
- The task is fully specified ("Translate this sentence to English")
- The user wants a quick conversational reply, not a deliverable

---

## The Four Blocks

### Setup (У — Установка)

What exactly needs to be done and for whom. Rewrite the raw request into a clear task brief.

Determine four parameters:

| Parameter | Question |
|---|---|
| Result type | What does the user get? (analysis, article, code, plan, table, prompt) |
| Tone | How should it sound? (academic, conversational, business, provocative) |
| Audience | Who will read/use this? (expert, beginner, client, team, investor) |
| Scope | How detailed? (paragraph, 500 words, full report, bullet points) |

The Setup is one to two sentences that eliminate all ambiguity. Not "tell me about depression" but "analyze the theme of depression in Dostoevsky's 'The Idiot' in an academic tone for readers interested in literary criticism."

Common mistakes:
- Too broad: "write something about marketing" — the model picks a random angle
- No format specified: the model decides for itself — list, essay, or three paragraphs
- Missing audience: text for a CEO and text for an intern are two different texts

### Role (М — Модель)

The role the AI adopts. Not a decorative "you are an expert" but a specific specialization that sets the frame of thinking, vocabulary, depth, and angle.

Formula: `[Profession] + [Specialization] + [Behavioral frame]`

Example: "You are a UX researcher specializing in mobile interfaces for fintech products. Your recommendations are always backed by Nielsen Norman Group patterns and real A/B tests."

The role is chosen based on the task. Different roles for the same request yield fundamentally different results:

| Request | Weak role | Strong role |
|---|---|---|
| Analyze depression in "The Idiot" | "You're a smart assistant" | "Literary scholar specializing in Dostoevsky's psychological prose" |
| Write a sales post | "You're a marketer" | "Copywriter in the luxury segment focused on emotional triggers" |
| Debug code | "You're a programmer" | "Senior backend developer (Python, Django, PostgreSQL)" |

Common mistakes:
- Too generic: "you're an expert" — expert in what?
- Contradictory: "you're simultaneously a lawyer and a marketer" — the model oscillates
- No behavioral frame: without it the model may drift in style

### Context (К — Контекст)

Everything the model needs to know to avoid hallucinating. The subject area, constraints, background, sources, input data format.

| Category | Examples |
|---|---|
| Subject matter | "The novel 'The Idiot' (1868), protagonist Prince Myshkin..." |
| Constraints | "Only based on the novel text, no secondary literature" |
| User background | "I'm an art director at a startup", "Deadline is tomorrow" |
| References | "Follow the style of articles in XYZ journal" |
| Input format | "Here's my brief: ...", "Data in CSV, columns: date, amount, category" |

**Completeness rule:** If you remove everything else and keep only the Context block, the model should understand what's being discussed. If it doesn't — the context is incomplete.

**Brevity rule:** Include only what directly affects output quality. Excess information dilutes focus.

Common mistakes:
- Zero context: the model fills gaps with fabrication
- Context dump: 2000 words of background where only 200 are relevant
- Contradictory context: "target audience is teenagers" + "tone is academic"

### Algorithm (А — Алгоритм)

Step-by-step instructions defining the order of operations. Not "write well" but a concrete sequence turning an open request into a managed pipeline.

Each step formula: `[Action verb] + [Object] + [Success criterion]`

Examples:
- "Analyze Prince Myshkin's character, identifying at least 5 signs of depression with textual citations."
- "Build a comparison table of three frameworks across 6 criteria: performance, learning curve, ecosystem, documentation, community, cost."

Common mistakes:
- No steps at all: the model decides its own thinking order
- Steps without criteria: "analyze" — how to know the analysis is sufficient?
- Too many steps: 15 steps for a simple request — the model loses focus
- Contradictory steps: "first be brief, then elaborate in detail"

---

## Execution Workflow

### Step 1 — Receive raw input

The user writes anything — one word to a paragraph. Do not answer immediately. Decompose first.

### Step 2 — Fill each block

Walk through Setup → Role → Context → Algorithm sequentially. If information is missing, either infer a reasonable default or ask the user. Prefer inferring over asking — ask only when the gap is critical. If you do infer, note assumptions briefly at the end.

### Step 3 — Assemble the final brief

Combine four blocks into a coherent prompt. The format can be explicit (with block headers) or implicit (blocks woven into natural text). Choose based on context:
- Explicit format — when delivering the brief to the user for reuse
- Implicit format — when executing the brief yourself

### Step 4 — Execute or hand off

Either execute the brief and deliver the result, or return it to the user as a ready-made instruction. Default to executing unless the user specifically asked for a brief.

---

## Output Format

When the user asks for brief decomposition (not execution), use this structure:

```
**Setup:**
[1-2 sentences: task + format + tone + audience]

**Role:**
[Profession + specialization + behavioral frame]

**Context:**
[Subject matter, constraints, references — only what matters]

**Algorithm:**
1. [Step with criterion]
2. [Step with criterion]
3. ...
```

When executing, do not show the breakdown — just produce the output. Mention the assumptions you made briefly at the end if any.

Language: always match the user's language. If they write in Russian, decompose and respond in Russian. If in English — in English.

---

## Algorithm Templates

For common task types, use these step patterns as starting points. Adapt to the specific request — never copy blindly.

**Analysis:**
1. Identify key elements / patterns / signals
2. Classify by relevant categories
3. Establish connections and dependencies
4. Draw conclusions

**Content creation:**
1. Define structure (headings, sections)
2. Draft each section
3. Add examples / citations / data
4. Edit tone and style for the audience

**Problem solving:**
1. Describe the problem and its symptoms
2. Hypothesize root causes
3. Propose solutions with effort estimates
4. Recommend the optimal path with rationale

**Comparison:**
1. Define comparison criteria
2. Gather data for each option
3. Format as a table
4. Highlight the leader and laggard with justification

**Planning:**
1. Break the goal into milestones
2. For each milestone: define deliverables, tools, time estimate
3. Identify dependencies and blockers
4. Produce the ordered timeline

See `examples.md` for full worked examples across different domains.

---

## Edge Cases

- **User asks for brief decomposition**: return the four-block breakdown, do not execute
- **User pastes a long brief**: extract the core intent, fill blocks from the brief, ask only about genuine gaps
- **Single-step task** (e.g. "translate this"): skip decomposition, just do it
- **User gives partial brief** (e.g. specifies role but nothing else): fill the remaining blocks, note what was inferred
- **Conflicting instructions**: flag the conflict to the user before proceeding
- **Multiple tasks in one message**: decompose each separately, then suggest execution order
